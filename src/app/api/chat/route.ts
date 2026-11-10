import { createHash } from "node:crypto";
import { createLimiter } from "../../../lib/agent/limiter";
import {
  buildSystemPrompt,
  leaksPrompt,
  REFUSAL,
} from "../../../lib/agent/prompt";
import { AgentError, generateReply } from "../../../lib/agent/providers";
import { MAX_BODY_BYTES, parseChatRequest } from "../../../lib/agent/validate";

/**
 * Asistente del portafolio. El navegador solo manda los mensajes; el prompt, las claves y la elección del proveedor viven
 * aquí. No se guarda ninguna conversación: lo único que se registra son líneas de error sin texto de los usuarios.
 */
const limiter = createLimiter();

const headers = { "Cache-Control": "no-store" } as const;

function json(body: Record<string, unknown>, status: number, extra: HeadersInit = {}) {
  return Response.json(body, { status, headers: { ...headers, ...extra } });
}

/** Identifica al visitante sin guardar su dirección: solo un resumen irreversible, en memoria. */
function visitorKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = request.headers.get("x-real-ip") ?? forwarded ?? "desconocido";
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/** Solo se acepta desde páginas de este mismo sitio. */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "forbidden" }, 403);

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return json({ error: "invalid" }, 413);
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: "invalid" }, 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "invalid" }, 400);
  }
  const parsed = parseChatRequest(body);
  if (!parsed.ok) {
    return json({ error: parsed.reason }, 400);
  }
  const { locale, messages } = parsed.value;

  const limit = limiter.check(visitorKey(request));
  if (!limit.ok) {
    return json({ error: limit.reason === "daily" ? "daily" : "rate" }, 429, {
      "Retry-After": String(limit.retryAfterSec),
    });
  }

  try {
    const reply = await generateReply(
      buildSystemPrompt(locale),
      messages,
      {
        GROQ_API_KEY: process.env.GROQ_API_KEY,
        GROQ_MODEL: process.env.GROQ_MODEL,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        GEMINI_MODEL: process.env.GEMINI_MODEL,
      },
      { log: (line) => console.error(`[agente] ${line}`) },
    );
    // Si el modelo se dejó sacar sus instrucciones, no se entrega la respuesta.
    const text = leaksPrompt(reply.text) ? REFUSAL[locale] : reply.text;
    return json({ reply: text }, 200);
  } catch (error) {
    const kind = error instanceof AgentError ? error.kind : "failed";
    if (kind === "failed") console.error("[agente] fallo sin clasificar");
    // 503: el sitio funciona, el asistente no está disponible ahora (sin claves, cuota agotada o proveedor caído).
    return json({ error: kind === "quota" ? "quota" : "unavailable" }, 503);
  }
}
