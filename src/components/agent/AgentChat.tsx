"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { AgentText, Locale } from "../../i18n";
import { fill } from "../../lib/template";

const MAX_CHARS = 500;
/** Mensajes anteriores que se mandan junto con la pregunta (el servidor también recorta). */
const HISTORY = 6;

interface Message {
  role: "user" | "assistant";
  content: string;
}

type ErrorKey = keyof AgentText["errors"];

/** Traduce la respuesta del servidor a uno de los avisos del diccionario. */
function errorFor(status: number, code: unknown): ErrorKey {
  if (status === 429) return code === "daily" ? "daily" : "rate";
  if (status === 503) return code === "quota" ? "quota" : "unavailable";
  if (status === 400 && code === "too_long") return "tooLong";
  return "generic";
}

export function AgentChat({
  text,
  locale,
  contactHref,
}: {
  text: AgentText;
  locale: Locale;
  contactHref: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const controller = useRef<AbortController | null>(null);

  // Mantiene visible lo último que se escribió, sin mover la página.
  useEffect(() => {
    const element = log.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, pending, error]);

  useEffect(() => () => controller.current?.abort(), []);

  const send = async (question: string) => {
    const content = question.trim();
    if (!content || pending) return;
    if (content.length > MAX_CHARS) {
      setError("tooLong");
      return;
    }
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    setDraft("");
    setError(null);
    setPending(true);

    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, messages: next.slice(-HISTORY) }),
        signal: current.signal,
      });
      const body = (await response.json().catch(() => ({}))) as {
        reply?: unknown;
        error?: unknown;
      };
      if (response.ok && typeof body.reply === "string") {
        setMessages([...next, { role: "assistant", content: body.reply }]);
      } else {
        setError(errorFor(response.status, body.error));
      }
    } catch (failure) {
      if (!(failure instanceof DOMException && failure.name === "AbortError")) {
        setError("network");
      }
    } finally {
      if (controller.current === current) {
        setPending(false);
        input.current?.focus({ preventScroll: true });
      }
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send(draft);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void send(draft);
    }
  };

  const reset = () => {
    controller.current?.abort();
    setMessages([]);
    setDraft("");
    setError(null);
    setPending(false);
  };

  const started = messages.length > 0;

  return (
    <div className="border border-trazo bg-hollin">
      <div className="flex items-center justify-between gap-3 border-b border-trazo px-4 py-3 sm:px-6">
        <p className="font-mono text-xs text-ambar">{text.title}</p>
        {started && (
          <button
            type="button"
            onClick={reset}
            className="font-mono text-xs text-ceniza underline-offset-4 transition-colors hover:text-ambar hover:underline"
          >
            {text.reset}
          </button>
        )}
      </div>

      <div
        ref={log}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex max-h-[26rem] min-h-56 flex-col gap-5 overflow-y-auto px-4 py-5 sm:px-6"
      >
        <Bubble label={text.assistant} role="assistant">
          {text.welcome}
        </Bubble>
        {messages.map((message, i) => (
          <Bubble
            key={i}
            label={message.role === "user" ? text.you : text.assistant}
            role={message.role}
          >
            {message.content}
          </Bubble>
        ))}
        {pending && (
          <p className="font-mono text-xs text-ceniza" role="status">
            {text.thinking}
          </p>
        )}
        {error && (
          <div className="border border-trazo p-3 text-sm/6 text-hueso" role="alert">
            <p>
              {fill(text.errors[error], { max: MAX_CHARS })}
            </p>
            {error !== "tooLong" && error !== "rate" && error !== "network" && error !== "generic" && (
              <a
                href={contactHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block font-mono text-[13px] text-ambar underline-offset-4 hover:underline"
              >
                {text.contactCta} ↗
              </a>
            )}
          </div>
        )}
      </div>

      {!started && (
        <div className="border-t border-trazo px-4 py-4 sm:px-6">
          <p className="mb-2 font-mono text-xs text-ceniza">
            {text.suggestionsLabel}
          </p>
          <ul className="flex flex-wrap gap-2">
            {text.suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => void send(suggestion)}
                  disabled={pending}
                  className="border border-trazo px-3 py-2 text-left text-sm text-hueso transition-colors hover:border-ambar hover:text-ambar disabled:opacity-50"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="border-t border-trazo px-4 py-4 sm:px-6"
      >
        <label htmlFor="agente-pregunta" className="sr-only">
          {text.inputLabel}
        </label>
        <div className="flex items-end gap-3">
          <textarea
            id="agente-pregunta"
            ref={input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            maxLength={MAX_CHARS}
            placeholder={text.placeholder}
            className="min-h-12 flex-1 resize-none border border-trazo bg-tinta px-3 py-2.5 text-[15px]/6 text-hueso placeholder:text-ceniza focus:border-ambar"
          />
          <button
            type="submit"
            disabled={pending || !draft.trim()}
            className="min-h-12 bg-ambar px-5 font-mono text-[13px] font-medium text-tinta transition-colors hover:bg-hueso disabled:cursor-not-allowed disabled:opacity-40"
          >
            {text.send}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <p className="max-w-xl text-xs/5 text-ceniza">{text.disclosure}</p>
          {draft.length > MAX_CHARS * 0.8 && (
            <p className="font-mono text-xs tabular-nums text-ceniza">
              {fill(text.counter, { n: draft.length, max: MAX_CHARS })}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

function Bubble({
  label,
  role,
  children,
}: {
  label: string;
  role: "user" | "assistant";
  children: string;
}) {
  return (
    <div
      className={
        role === "assistant"
          ? "border-l-2 border-ambar pl-4"
          : "border-l-2 border-trazo pl-4"
      }
    >
      <p className="font-mono text-xs text-ceniza">{label}</p>
      <p className="mt-1 whitespace-pre-wrap break-words text-[15px]/7 text-hueso">
        {children}
      </p>
    </div>
  );
}
