import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../../app/api/contact/route";
import { buildEmail, MIN_FILL_MS, newTicketId, parseTicket, sendTicket } from "./contact";

const NOW = 1_800_000_000_000;
const valid = {
  name: "Ana Reclutadora",
  email: "ana@empresa.co",
  subject: "Vacante de desarrollador junior",
  priority: "normal",
  message: "Hola Johan, vimos tu portafolio y quisiéramos hablar.",
  website: "",
  shownAt: NOW - 10_000,
};

describe("parseTicket", () => {
  it("acepta un ticket válido y limpia los campos", () => {
    const result = parseTicket({ ...valid, name: "  Ana \n Reclutadora  " }, NOW);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.ticket.name).toBe("Ana   Reclutadora");
  });

  it("indica qué campos fallan", () => {
    const result = parseTicket(
      { ...valid, name: "A", email: "no-es-correo", subject: "ab", priority: "urgente", message: "corto" },
      NOW,
    );
    expect(result).toEqual({
      ok: false,
      reason: "invalid",
      fields: ["name", "email", "subject", "priority", "message"],
    });
  });

  it("rechaza correos con trucos de cabeceras o varios destinatarios", () => {
    for (const email of ["a@b.co\nBcc: x@y.co", "a@b.co, c@d.co", "<a@b.co>", "a b@c.co", "a@b"]) {
      const result = parseTicket({ ...valid, email }, NOW);
      expect(result.ok, email).toBe(false);
    }
  });

  it("quita los saltos de línea del asunto, pero no del mensaje", () => {
    const result = parseTicket({ ...valid, subject: "Hola\r\nBcc: x@y.co", message: "línea 1\nlínea 2 con más texto" }, NOW);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.ticket.subject).not.toMatch(/[\r\n]/);
      expect(result.ticket.message).toContain("\n");
    }
  });

  it("detecta programas: campo trampa lleno o envío demasiado rápido", () => {
    expect(parseTicket({ ...valid, website: "http://spam.example" }, NOW)).toEqual({ ok: false, reason: "bot" });
    expect(parseTicket({ ...valid, shownAt: NOW - (MIN_FILL_MS - 1) }, NOW)).toEqual({ ok: false, reason: "bot" });
    expect(parseTicket({ ...valid, shownAt: undefined }, NOW)).toEqual({ ok: false, reason: "bot" });
  });

  it("rechaza mensajes demasiado largos y cuerpos que no son objetos", () => {
    expect(parseTicket({ ...valid, message: "x".repeat(1501) }, NOW)).toMatchObject({ ok: false, fields: ["message"] });
    expect(parseTicket(null, NOW)).toMatchObject({ ok: false });
    expect(parseTicket("texto", NOW)).toMatchObject({ ok: false });
  });
});

describe("ticket y correo", () => {
  it("genera códigos TKT-XXXX sin caracteres que se confunden", () => {
    for (let i = 0; i < 50; i++) expect(newTicketId()).toMatch(/^TKT-[A-HJKMNP-Z2-9]{4}$/);
  });

  it("arma el correo en texto plano con asunto, prioridad y datos de quien escribe", () => {
    const parsed = parseTicket({ ...valid, priority: "high" }, NOW);
    if (!parsed.ok) throw new Error("debería ser válido");
    const mail = buildEmail(parsed.ticket, "TKT-AB12");
    expect(mail.subject).toBe("[TKT-AB12] [Alta] Vacante de desarrollador junior");
    expect(mail.text).toContain("Ana Reclutadora <ana@empresa.co>");
    expect(mail.text).toContain(valid.message);
  });
});

describe("sendTicket", () => {
  const ticket = { name: "Ana", email: "ana@empresa.co", subject: "Hola", priority: "low" as const, message: "Un mensaje de prueba" };

  it("llama a Resend con la clave, el destinatario y Reply-To del visitante", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    await sendTicket(ticket, "TKT-AB12", { RESEND_API_KEY: "re_x", CONTACT_TO_EMAIL: "yo@ejemplo.co" }, fetchImpl);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_x");
    expect(init.headers["Idempotency-Key"]).toBe("TKT-AB12");
    const sent = JSON.parse(init.body);
    expect(sent.to).toEqual(["yo@ejemplo.co"]);
    expect(sent.reply_to).toBe("ana@empresa.co");
    expect(sent.from).toContain("onboarding@resend.dev");
  });

  it("falla con «unconfigured» sin claves y con «failed» si Resend responde error o no hay red", async () => {
    const ok = vi.fn();
    await expect(sendTicket(ticket, "T", {}, ok)).rejects.toMatchObject({ kind: "unconfigured" });
    expect(ok).not.toHaveBeenCalled();
    const env = { RESEND_API_KEY: "k", CONTACT_TO_EMAIL: "a@b.co" };
    await expect(sendTicket(ticket, "T", env, vi.fn().mockResolvedValue(new Response("", { status: 422 })))).rejects.toMatchObject({ kind: "failed" });
    await expect(sendTicket(ticket, "T", env, vi.fn().mockRejectedValue(new Error("red")))).rejects.toMatchObject({ kind: "failed" });
  });
});

describe("POST /api/contact", () => {
  let counter = 0;
  const post = (body: unknown, init: { origin?: string | null; ip?: string } = {}) => {
    const headers = new Headers({
      "content-type": "application/json",
      host: "johan-moreno.vercel.app",
      "x-real-ip": init.ip ?? `10.1.0.${++counter}`,
    });
    if (init.origin !== null) headers.set("origin", init.origin ?? "https://johan-moreno.vercel.app");
    return POST(
      new Request("https://johan-moreno.vercel.app/api/contact", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }),
    );
  };
  const fresh = () => ({ ...valid, shownAt: Date.now() - 10_000 });

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("rechaza otro origen", async () => {
    expect((await post(fresh(), { origin: "https://malo.example" })).status).toBe(403);
  });

  it("devuelve los campos inválidos", async () => {
    const response = await post({ ...fresh(), email: "x" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid", fields: ["email"] });
  });

  it("a un programa le responde «enviado» sin llamar a Resend", async () => {
    vi.stubEnv("RESEND_API_KEY", "k");
    vi.stubEnv("CONTACT_TO_EMAIL", "a@b.co");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await post({ ...fresh(), website: "spam" });
    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("503 mientras no haya clave de Resend", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("CONTACT_TO_EMAIL", "");
    const response = await post(fresh());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "unavailable" });
  });

  it("envía el correo y devuelve el código del ticket", async () => {
    vi.stubEnv("RESEND_API_KEY", "k");
    vi.stubEnv("CONTACT_TO_EMAIL", "a@b.co");
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await post(fresh());
    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok: boolean; ticket: string };
    expect(body.ok).toBe(true);
    expect(body.ticket).toMatch(/^TKT-/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("frena al visitante que manda muchos tickets", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++) statuses.push((await post(fresh(), { ip: "203.0.113.50" })).status);
    expect(statuses).toEqual([503, 503, 503, 429, 429]);
  });
});
