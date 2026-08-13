"use client";

import { useSyncExternalStore } from "react";

const completionEvent = "handbook-completion-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(completionEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(completionEvent, callback);
  };
}

function readCompletedSlugs() {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem("handbook-completed") ?? "[]"));
  } catch {
    return new Set<string>();
  }
}

export function notifyCompletionChange() {
  window.dispatchEvent(new Event(completionEvent));
}

export function ChapterRoadmapStatus({ slug }: { slug: string }) {
  const completed = useSyncExternalStore(
    subscribe,
    () => readCompletedSlugs().has(slug),
    () => false,
  );

  return (
    <span
      className={completed ? "performance-chapter-status completed" : "performance-chapter-status"}
    >
      {completed ? "✓ Completed" : "Available"}
    </span>
  );
}

export function HandbookProgress({ chapterSlugs }: { chapterSlugs: string[] }) {
  const completedCount = useSyncExternalStore(
    subscribe,
    () => {
      const completed = readCompletedSlugs();
      return chapterSlugs.filter((slug) => completed.has(slug)).length;
    },
    () => 0,
  );
  const total = chapterSlugs.length;
  const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  return (
    <div className="handbook-progress">
      <div className="handbook-progress-summary">
        <strong>Your progress</strong>
        <span>
          {completedCount} of {total} chapters · {percentage}%
        </span>
      </div>
      <progress
        aria-label={`${completedCount} of ${total} available chapters completed`}
        max={total || 1}
        value={completedCount}
      >
        {percentage}%
      </progress>
    </div>
  );
}
