import { createHash } from "node:crypto";
import {
  MAX_BODY_BYTES,
  newTicketId,
  parseTicket,
  SendError,
  sendTicket,
} from "../../../lib/contact/contact";
import { createLimiter } from "../../../lib/agent/limiter";

/**
 * Formulario de contacto «como ticket»: manda un correo a Johan con Resend. No se guarda nada; el destinatario y la clave
 * viven en variables de entorno del servidor.
 */
const limiter = createLimiter({ perVisitor: 3, windowMs: 30 * 60 * 1000, perDay: 40 });

const headers = { "Cache-Control": "no-store" } as const;

function json(body: Record<string, unknown>, status: number, extra: HeadersInit = {}) {
  return Response.json(body, { status, headers: { ...headers, ...extra } });
}

function visitorKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = request.headers.get("x-real-ip") ?? forwarded ?? "desconocido";
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

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

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return json({ error: "invalid", fields: [] }, 413);
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: "invalid", fields: [] }, 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "invalid", fields: [] }, 400);
  }

  const parsed = parseTicket(body);
  if (!parsed.ok) {
    // A un programa se le responde «enviado» sin enviar nada, para no darle pistas.
    if (parsed.reason === "bot") return json({ ok: true, ticket: newTicketId() }, 200);
    return json({ error: "invalid", fields: parsed.fields }, 400);
  }

  const limit = limiter.check(visitorKey(request));
  if (!limit.ok) {
    return json({ error: "rate" }, 429, { "Retry-After": String(limit.retryAfterSec) });
  }

  const id = newTicketId();
  try {
    await sendTicket(parsed.ticket, id, {
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
      CONTACT_FROM: process.env.CONTACT_FROM,
    });
  } catch (error) {
    const kind = error instanceof SendError ? error.kind : "failed";
    console.error(`[contacto] ${kind}`);
    return json({ error: "unavailable" }, 503);
  }
  return json({ ok: true, ticket: id }, 200);
}
