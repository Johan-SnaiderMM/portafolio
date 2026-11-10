import type { AgentLocale } from "./prompt";

export const MAX_MESSAGE_CHARS = 500;
/** Cuántos mensajes anteriores se envían al modelo (la conversación larga no hace falta y gasta cuota). */
export const MAX_HISTORY = 6;
export const MAX_BODY_BYTES = 8_000;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  locale: AgentLocale;
  messages: ChatMessage[];
}

export type ParseResult =
  | { ok: true; value: ChatRequest }
  | { ok: false; reason: "invalid" | "too_long" | "empty" };

/** Quita caracteres de control (menos salto de línea y tabulación) y recorta los bordes. */
function clean(text: string): string {
  return text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
}

/**
 * Valida el cuerpo que llega del navegador. El prompt del sistema NUNCA viene del cliente: aquí solo se aceptan mensajes
 * de usuario y de asistente, el último debe ser del usuario y se conservan los últimos `MAX_HISTORY`.
 */
export function parseChatRequest(body: unknown): ParseResult {
  if (!body || typeof body !== "object") return { ok: false, reason: "invalid" };
  const { messages, locale } = body as Record<string, unknown>;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40) {
    return { ok: false, reason: "invalid" };
  }

  const parsed: ChatMessage[] = [];
  for (const item of messages) {
    if (!item || typeof item !== "object") return { ok: false, reason: "invalid" };
    const { role, content } = item as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      return { ok: false, reason: "invalid" };
    }
    const text = clean(content);
    if (text.length > MAX_MESSAGE_CHARS) return { ok: false, reason: "too_long" };
    if (text) parsed.push({ role, content: text });
  }

  const recent = parsed.slice(-MAX_HISTORY);
  // Una conversación debe empezar con un mensaje del usuario y terminar con uno.
  while (recent.length > 0 && recent[0].role !== "user") recent.shift();
  if (recent.length === 0 || recent[recent.length - 1].role !== "user") {
    return { ok: false, reason: "empty" };
  }

  return {
    ok: true,
    value: { locale: locale === "en" ? "en" : "es", messages: recent },
  };
}
