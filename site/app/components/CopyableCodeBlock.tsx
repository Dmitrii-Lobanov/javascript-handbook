"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";

export function CopyableCodeBlock({ children, ...props }: ComponentProps<"pre">) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const codeElement = useRef<HTMLPreElement>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  async function copyCode() {
    try {
      const code = codeElement.current?.textContent?.replace(/\n$/, "") ?? "";
      await navigator.clipboard.writeText(code);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setStatus("idle"), 1800);
  }

  const label = status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : "Copy";

  return (
    <div className="copyable-code-block">
      <button
        type="button"
        className={status === "copied" ? "code-copy-button copied" : "code-copy-button"}
        onClick={copyCode}
        aria-label={status === "copied" ? "Code copied to clipboard" : "Copy code to clipboard"}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {status === "copied" ? (
            <path d="m5 12 4 4L19 6" />
          ) : (
            <>
              <rect x="8" y="8" width="11" height="11" rx="2" />
              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
            </>
          )}
        </svg>
        <span aria-live="polite">{label}</span>
      </button>
      <pre {...props} ref={codeElement}>
        {children}
      </pre>
    </div>
  );
}
