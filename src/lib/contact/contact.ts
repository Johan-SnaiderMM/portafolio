import { randomInt } from "node:crypto";

export const PRIORITIES = ["low", "normal", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 120 },
  subject: { min: 3, max: 100 },
  message: { min: 10, max: 1500 },
} as const;
/** Un formulario que se envía más rápido que esto lo llenó un programa, no una persona. */
export const MIN_FILL_MS = 2_000;
export const MAX_BODY_BYTES = 10_000;

export interface Ticket {
  name: string;
  email: string;
  subject: string;
  priority: Priority;
  message: string;
}

export type FieldError = "name" | "email" | "subject" | "priority" | "message";

export type ParseResult =
  | { ok: true; ticket: Ticket }
  /** Cuerpo malformado o campos inválidos (se devuelve cuáles). */
  | { ok: false; reason: "invalid"; fields: FieldError[] }
  /** Parece un programa (campo trampa lleno o formulario enviado demasiado rápido). */
  | { ok: false; reason: "bot" };

/** Quita caracteres de control y, en los campos de una línea, los saltos de línea (evita inyectar cabeceras). */
function clean(value: unknown, multiline = false): string {
  if (typeof value !== "string") return "";
  const text = multiline
    ? value.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    : value.replace(/[\u0000-\u001f\u007f]/g, " ");
  return text.trim();
}

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

export function parseTicket(body: unknown, now: number = Date.now()): ParseResult {
  if (!body || typeof body !== "object") {
    return { ok: false, reason: "invalid", fields: [] };
  }
  const raw = body as Record<string, unknown>;

  // Campo trampa (invisible para personas) y tiempo mínimo de llenado.
  const shownAt = typeof raw.shownAt === "number" ? raw.shownAt : 0;
  if (clean(raw.website) !== "" || !shownAt || now - shownAt < MIN_FILL_MS) {
    return { ok: false, reason: "bot" };
  }

  const ticket = {
    name: clean(raw.name),
    email: clean(raw.email),
    subject: clean(raw.subject),
    priority: raw.priority as Priority,
    message: clean(raw.message, true),
  };

  const fields: FieldError[] = [];
  if (ticket.name.length < LIMITS.name.min || ticket.name.length > LIMITS.name.max) fields.push("name");
  if (ticket.email.length > LIMITS.email.max || !EMAIL.test(ticket.email)) fields.push("email");
  if (ticket.subject.length < LIMITS.subject.min || ticket.subject.length > LIMITS.subject.max) fields.push("subject");
  if (!PRIORITIES.includes(ticket.priority)) fields.push("priority");
  if (ticket.message.length < LIMITS.message.min || ticket.message.length > LIMITS.message.max) fields.push("message");

  if (fields.length > 0) return { ok: false, reason: "invalid", fields };
  return { ok: true, ticket };
}

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Código corto para que quien escribe y Johan se refieran al mismo mensaje: TKT-4F2K. */
export function newTicketId(): string {
  let id = "";
  for (let i = 0; i < 4; i++) id += ALPHABET[randomInt(ALPHABET.length)];
  return `TKT-${id}`;
}

const PRIORITY_LABEL: Record<Priority, string> = { low: "Baja", normal: "Normal", high: "Alta" };

/** Correo que recibe Johan. Todo es texto plano: nada de lo escrito por el visitante se interpreta como HTML. */
export function buildEmail(ticket: Ticket, id: string) {
  const priority = PRIORITY_LABEL[ticket.priority];
  return {
    subject: `[${id}] [${priority}] ${ticket.subject}`,
    text: [
      `Ticket: ${id}`,
      `Prioridad: ${priority}`,
      `De: ${ticket.name} <${ticket.email}>`,
      "",
      ticket.message,
      "",
      "—",
      "Enviado desde el formulario del portafolio. Responde a este correo para contestarle (Reply-To ya apunta a quien escribió).",
    ].join("\n"),
  };
}

export class SendError extends Error {
  constructor(public kind: "unconfigured" | "failed") {
    super(kind);
  }
}

export interface MailEnv {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM?: string;
}

/** Envía el ticket por Resend. Sin SDK: una sola llamada HTTP. */
export async function sendTicket(
  ticket: Ticket,
  id: string,
  env: MailEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL) throw new SendError("unconfigured");
  const { subject, text } = buildEmail(ticket, id);
  let response: Response;
  try {
    response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        // Si el visitante reintenta, Resend no envía dos veces el mismo ticket.
        "Idempotency-Key": id,
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM || "Portafolio <onboarding@resend.dev>",
        to: [env.CONTACT_TO_EMAIL],
        reply_to: ticket.email,
        subject,
        text,
      }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new SendError("failed");
  }
  if (!response.ok) throw new SendError("failed");
}
