import type { ChatMessage } from "./validate";

export type ProviderName = "groq" | "gemini";

export interface ProviderEnv {
  GROQ_API_KEY?: string;
  GROQ_MODEL?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
}

/** Modelos por defecto; se pueden cambiar con variables de entorno cuando el proveedor retire alguno. */
export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";

const TIMEOUT_MS = 15_000;
const MAX_OUTPUT_TOKENS = 400;
const TEMPERATURE = 0.3;

export type FailureKind =
  /** Ningún proveedor tiene clave configurada. */
  | "unconfigured"
  /** Cuota agotada o límite de velocidad (429) en todos los que se probaron. */
  | "quota"
  /** Error del proveedor, tiempo agotado o respuesta vacía. */
  | "failed";

export class AgentError extends Error {
  constructor(
    public kind: FailureKind,
    message: string,
  ) {
    super(message);
  }
}

type Fetch = typeof fetch;

interface Reply {
  text: string;
  provider: ProviderName;
}

/** Códigos de estado que significan «prueba con el otro proveedor». */
class ProviderFailure extends Error {
  constructor(
    public quota: boolean,
    message: string,
  ) {
    super(message);
  }
}

async function request(
  fetchImpl: Fetch,
  url: string,
  init: RequestInit,
  name: ProviderName,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetchImpl(url, {
      ...init,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new ProviderFailure(
      false,
      `${name}: ${error instanceof Error ? error.name : "error de red"}`,
    );
  }
  if (!response.ok) {
    // 429 = límite o cuota. 401/403 = clave mala (se registra igual que cualquier fallo, sin imprimir la clave).
    throw new ProviderFailure(response.status === 429, `${name}: HTTP ${response.status}`);
  }
  try {
    return await response.json();
  } catch {
    throw new ProviderFailure(false, `${name}: respuesta que no es JSON`);
  }
}

export async function callGroq(
  system: string,
  messages: ChatMessage[],
  env: ProviderEnv,
  fetchImpl: Fetch = fetch,
): Promise<string> {
  const data = (await request(
    fetchImpl,
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
        messages: [{ role: "system", content: system }, ...messages],
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: TEMPERATURE,
      }),
    },
    "groq",
  )) as { choices?: { message?: { content?: unknown } }[] };
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new ProviderFailure(false, "groq: respuesta vacía");
  }
  return text.trim();
}

export async function callGemini(
  system: string,
  messages: ChatMessage[],
  env: ProviderEnv,
  fetchImpl: Fetch = fetch,
): Promise<string> {
  const model = env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const data = (await request(
    fetchImpl,
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY ?? "",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          temperature: TEMPERATURE,
        },
      }),
    },
    "gemini",
  )) as {
    candidates?: { content?: { parts?: { text?: unknown }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();
  if (!text) throw new ProviderFailure(false, "gemini: respuesta vacía");
  return text;
}

/**
 * Pide la respuesta a Groq y, si falla o no hay cuota, a Gemini. Si ninguno responde, lanza `AgentError`.
 * Los detalles de cada fallo se devuelven en `log` (sin claves ni texto de la conversación).
 */
export async function generateReply(
  system: string,
  messages: ChatMessage[],
  env: ProviderEnv,
  options: { fetchImpl?: Fetch; log?: (line: string) => void } = {},
): Promise<Reply> {
  const { fetchImpl = fetch, log = () => {} } = options;
  const chain: { name: ProviderName; run: () => Promise<string> }[] = [];
  if (env.GROQ_API_KEY) {
    chain.push({
      name: "groq",
      run: () => callGroq(system, messages, env, fetchImpl),
    });
  }
  if (env.GEMINI_API_KEY) {
    chain.push({
      name: "gemini",
      run: () => callGemini(system, messages, env, fetchImpl),
    });
  }
  if (chain.length === 0) {
    throw new AgentError("unconfigured", "Sin claves de proveedor.");
  }

  let allQuota = true;
  for (const provider of chain) {
    try {
      return { text: await provider.run(), provider: provider.name };
    } catch (error) {
      const failure =
        error instanceof ProviderFailure
          ? error
          : new ProviderFailure(false, `${provider.name}: error inesperado`);
      if (!failure.quota) allQuota = false;
      log(failure.message);
    }
  }
  throw new AgentError(
    allQuota ? "quota" : "failed",
    "Ningún proveedor respondió.",
  );
}
