"use client";

import { useEffect, useId, useRef, useState } from "react";

export function MermaidDiagram({ chart }: { chart: string }) {
  const reactId = useId();
  const containerRef = useRef<HTMLSpanElement>(null);
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

  useEffect(() => {
    const container = containerRef.current;
    const svgElement = container?.querySelector("svg");
    const graph = svgElement?.querySelector("g");
    if (!container || !svgElement || !graph) return;

    const diagramContainer = container;
    const diagramSvg = svgElement;
    const diagramGraph = graph;

    function centerGraph() {
      diagramSvg.style.transform = "";

      const containerRect = diagramContainer.getBoundingClientRect();
      const graphRect = diagramGraph.getBoundingClientRect();
      const offset =
        containerRect.left + containerRect.width / 2 - (graphRect.left + graphRect.width / 2);

      diagramSvg.style.transform = `translateX(${offset}px)`;
    }

    const frame = requestAnimationFrame(centerGraph);
    window.addEventListener("resize", centerGraph);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", centerGraph);
    };
  }, [svg]);

  if (failed) return <span className="diagram-fallback">{chart}</span>;
  if (!svg) return <span className="diagram-loading">Rendering diagram…</span>;
  return (
    <span
      ref={containerRef}
      className="mermaid-diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
