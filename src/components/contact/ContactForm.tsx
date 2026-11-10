"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ContactText } from "../../i18n";
import { fill } from "../../lib/template";

const MAX_MESSAGE = 1500;

type Priority = "low" | "normal" | "high";
type FieldKey = "name" | "email" | "subject" | "priority" | "message";
type FormError = "rate" | "unavailable" | "network" | "generic";

const FIELD_KEYS: FieldKey[] = ["name", "email", "subject", "priority", "message"];

export function ContactForm({ text }: { text: ContactText }) {
  const { form } = text;
  const shownAt = useRef(0);
  const [priority, setPriority] = useState<Priority>("normal");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldKey[]>([]);
  const [error, setError] = useState<FormError | null>(null);
  const [ticket, setTicket] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Hora en que apareció el formulario: el servidor descarta envíos instantáneos (programas).
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (ticket) successRef.current?.focus();
  }, [ticket]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    setFieldErrors([]);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          priority,
          message,
          website: data.get("website"),
          shownAt: shownAt.current,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        ticket?: string;
        error?: string;
        fields?: string[];
      };
      if (response.ok && body.ok && typeof body.ticket === "string") {
        setTicket(body.ticket);
      } else if (response.status === 400 && Array.isArray(body.fields) && body.fields.length > 0) {
        setFieldErrors(body.fields.filter((f): f is FieldKey => FIELD_KEYS.includes(f as FieldKey)));
      } else if (response.status === 429) {
        setError("rate");
      } else if (response.status === 503) {
        setError("unavailable");
      } else {
        setError("generic");
      }
    } catch {
      setError("network");
    } finally {
      setPending(false);
    }
  };

  const reset = () => {
    setTicket(null);
    setMessage("");
    setPriority("normal");
    setFieldErrors([]);
    setError(null);
    shownAt.current = Date.now();
  };

  if (ticket) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="border border-ambar/60 bg-hollin p-5 outline-none sm:p-6"
      >
        <p className="font-mono text-sm text-ambar">
          {fill(text.success.title, { id: ticket })}
        </p>
        <p className="mt-3 max-w-xl text-[15px]/7 text-hueso">{text.success.text}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 min-h-11 border border-trazo px-5 font-mono text-[13px] text-hueso transition-colors hover:border-ambar hover:text-ambar"
        >
          {text.success.another}
        </button>
      </div>
    );
  }

  const invalid = (key: FieldKey) => fieldErrors.includes(key);
  const inputClass = (key: FieldKey) =>
    `mt-1.5 block w-full border bg-tinta px-3 py-2.5 text-[15px] text-hueso placeholder:text-ceniza focus:border-ambar ${
      invalid(key) ? "border-hueso" : "border-trazo"
    }`;
  const errorText = (key: FieldKey) =>
    invalid(key) ? (
      <p id={`contacto-${key}-error`} className="mt-1.5 text-sm text-hueso">
        {text.errors[key]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="border border-trazo bg-hollin p-4 sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contacto-name" className="font-mono text-xs text-ceniza">
            {form.name}
          </label>
          <input
            id="contacto-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={80}
            aria-invalid={invalid("name")}
            aria-describedby={invalid("name") ? "contacto-name-error" : undefined}
            className={inputClass("name")}
          />
          {errorText("name")}
        </div>
        <div>
          <label htmlFor="contacto-email" className="font-mono text-xs text-ceniza">
            {form.email}
          </label>
          <input
            id="contacto-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={120}
            aria-invalid={invalid("email")}
            aria-describedby={invalid("email") ? "contacto-email-error" : undefined}
            className={inputClass("email")}
          />
          {errorText("email")}
        </div>
        <div>
          <label htmlFor="contacto-subject" className="font-mono text-xs text-ceniza">
            {form.subject}
          </label>
          <input
            id="contacto-subject"
            name="subject"
            type="text"
            required
            maxLength={100}
            aria-invalid={invalid("subject")}
            aria-describedby={invalid("subject") ? "contacto-subject-error" : undefined}
            className={inputClass("subject")}
          />
          {errorText("subject")}
        </div>
        <fieldset>
          <legend className="font-mono text-xs text-ceniza">{form.priority}</legend>
          <div className="mt-1.5 flex gap-2">
            {(["low", "normal", "high"] as const).map((value) => (
              <label
                key={value}
                className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center border px-3 font-mono text-[13px] transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ambar ${
                  priority === value
                    ? "border-ambar bg-tinta text-ambar"
                    : "border-trazo text-ceniza hover:text-hueso"
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={value}
                  checked={priority === value}
                  onChange={() => setPriority(value)}
                  className="sr-only"
                />
                {form.priorities[value]}
              </label>
            ))}
          </div>
          {errorText("priority")}
        </fieldset>
      </div>

      <div className="mt-5">
        <label htmlFor="contacto-message" className="font-mono text-xs text-ceniza">
          {form.message}
        </label>
        <textarea
          id="contacto-message"
          name="message"
          required
          rows={5}
          maxLength={MAX_MESSAGE}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={form.messageHint}
          aria-invalid={invalid("message")}
          aria-describedby={invalid("message") ? "contacto-message-error" : undefined}
          className={`${inputClass("message")} resize-y`}
        />
        <div className="flex items-start justify-between gap-4">
          <div>{errorText("message")}</div>
          {message.length > MAX_MESSAGE * 0.8 && (
            <p className="mt-1.5 font-mono text-xs tabular-nums text-ceniza">
              {fill(form.counter, { n: message.length, max: MAX_MESSAGE })}
            </p>
          )}
        </div>
      </div>

      {/* Campo trampa: invisible para personas y lectores de pantalla; un programa lo llena. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-5 border border-trazo p-3 text-sm/6 text-hueso">
          {text.errors[error]}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 bg-ambar px-6 font-mono text-[13px] font-medium text-tinta transition-colors hover:bg-hueso disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? form.sending : form.send}
        </button>
        <p className="max-w-md text-xs/5 text-ceniza">{form.privacy}</p>
      </div>
    </form>
  );
}
