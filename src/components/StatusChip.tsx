import type { ReactNode } from "react";

export function StatusChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 border border-trazo px-3 py-1.5 font-mono text-xs text-ceniza">
      <span aria-hidden="true" className="size-1.5 bg-ambar/70" />
      {children}
    </span>
  );
}
