import type { Dictionary } from "../i18n";

export function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="border-t border-trazo">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 font-mono text-xs text-ceniza sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>{dict.footer.rights}</p>
        <p>{dict.footer.built}</p>
      </div>
    </footer>
  );
}
