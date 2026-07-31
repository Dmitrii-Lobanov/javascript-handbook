"use client";

import { useEffect, useId, useState } from "react";

export function MermaidDiagram({ chart }: { chart: string }) {
  const reactId = useId();
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const id = `mermaid-${reactId.replaceAll(":", "")}`;

    import("mermaid").then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: document.documentElement.dataset.theme === "dark" ? "dark" : "neutral",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      });
      try {
        const result = await mermaid.render(id, chart);
        if (active) setSvg(result.svg);
      } catch {
        if (active) setFailed(true);
      }
    });

    return () => {
      active = false;
    };
  }, [chart, reactId]);

  if (failed) return <span className="diagram-fallback">{chart}</span>;
  if (!svg) return <span className="diagram-loading">Rendering diagram…</span>;
  return <span className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
}
