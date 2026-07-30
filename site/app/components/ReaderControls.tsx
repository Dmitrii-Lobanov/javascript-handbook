"use client";

import { useEffect, useState } from "react";

export function ReaderControls({ slug }: { slug: string }) {
  const [complete, setComplete] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    try {
      const completed = JSON.parse(localStorage.getItem("handbook-completed") ?? "[]") as string[];
      setComplete(completed.includes(slug));
      const savedScale = Number(localStorage.getItem("handbook-font-scale") ?? 1);
      setScale(savedScale);
      document.documentElement.style.setProperty("--reader-scale", String(savedScale));
    } catch {
      setComplete(false);
    }
  }, [slug]);

  function toggleComplete() {
    const completed = new Set<string>(JSON.parse(localStorage.getItem("handbook-completed") ?? "[]"));
    if (complete) completed.delete(slug); else completed.add(slug);
    localStorage.setItem("handbook-completed", JSON.stringify([...completed]));
    setComplete(!complete);
  }

  function changeScale(delta: number) {
    const next = Math.min(1.18, Math.max(0.9, Number((scale + delta).toFixed(2))));
    setScale(next);
    localStorage.setItem("handbook-font-scale", String(next));
    document.documentElement.style.setProperty("--reader-scale", String(next));
  }

  return (
    <div className="reader-controls" aria-label="Reading controls">
      <div className="type-controls">
        <button onClick={() => changeScale(-0.05)} aria-label="Decrease text size">A−</button>
        <button onClick={() => changeScale(0.05)} aria-label="Increase text size">A+</button>
      </div>
      <button className={complete ? "completion-button complete" : "completion-button"} onClick={toggleComplete}>
        {complete ? "✓ Completed" : "Mark complete"}
      </button>
    </div>
  );
}
