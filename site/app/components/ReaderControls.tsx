"use client";

import { useEffect, useState } from "react";
import { toggleCompletion, useCompletionStatus } from "./ChapterRoadmapStatus";

export function TextSizeControls() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    try {
      const savedScale = Number(localStorage.getItem("handbook-font-scale") ?? 1);
      setScale(savedScale);
      document.documentElement.style.setProperty("--reader-scale", String(savedScale));
    } catch {
      setScale(1);
    }
  }, []);

  function changeScale(delta: number) {
    const next = Math.min(1.18, Math.max(0.9, Number((scale + delta).toFixed(2))));
    setScale(next);
    localStorage.setItem("handbook-font-scale", String(next));
    document.documentElement.style.setProperty("--reader-scale", String(next));
  }

  return (
    <div className="reader-controls" aria-label="Reading controls">
      <div className="type-controls">
        <button onClick={() => changeScale(-0.05)} aria-label="Decrease text size">
          A−
        </button>
        <button onClick={() => changeScale(0.05)} aria-label="Increase text size">
          A+
        </button>
      </div>
    </div>
  );
}

export function CompletionControl({ slug }: { slug: string }) {
  const complete = useCompletionStatus(slug);

  function toggleComplete() {
    toggleCompletion(slug);
  }

  return (
    <div className="reader-controls">
      <button
        className={complete ? "completion-button complete" : "completion-button"}
        onClick={toggleComplete}
      >
        {complete ? "✓ Completed" : "Mark complete"}
      </button>
    </div>
  );
}
