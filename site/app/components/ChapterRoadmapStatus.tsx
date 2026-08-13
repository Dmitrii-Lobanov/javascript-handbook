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

export function useCompletionStatus(slug: string) {
  return useSyncExternalStore(
    subscribe,
    () => readCompletedSlugs().has(slug),
    () => false,
  );
}

export function notifyCompletionChange() {
  window.dispatchEvent(new Event(completionEvent));
}

export function toggleCompletion(slug: string) {
  const completed = readCompletedSlugs();
  if (completed.has(slug)) completed.delete(slug);
  else completed.add(slug);
  localStorage.setItem("handbook-completed", JSON.stringify([...completed]));
  notifyCompletionChange();
}

export function ChapterRoadmapStatus({ slug }: { slug: string }) {
  const completed = useCompletionStatus(slug);

  return (
    <span
      className={completed ? "performance-chapter-status completed" : "performance-chapter-status"}
    >
      {completed ? "✓ Completed" : "Available"}
    </span>
  );
}

export function CompletionLabel({
  slug,
  incompleteLabel = "Available",
  hideIncomplete = false,
  className = "completion-label",
}: {
  slug: string;
  incompleteLabel?: string;
  hideIncomplete?: boolean;
  className?: string;
}) {
  const completed = useCompletionStatus(slug);
  if (!completed && hideIncomplete) return null;

  return (
    <span className={`${className}${completed ? " completed" : ""}`}>
      {completed ? "✓ Completed" : incompleteLabel}
    </span>
  );
}

export function SectionProgress({
  itemSlugs,
  itemLabel = "chapters",
}: {
  itemSlugs: string[];
  itemLabel?: string;
}) {
  const completedCount = useSyncExternalStore(
    subscribe,
    () => {
      const completed = readCompletedSlugs();
      return itemSlugs.filter((slug) => completed.has(slug)).length;
    },
    () => 0,
  );
  const total = itemSlugs.length;
  const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  function resetProgress() {
    const completed = readCompletedSlugs();
    itemSlugs.forEach((slug) => completed.delete(slug));
    localStorage.setItem("handbook-completed", JSON.stringify([...completed]));
    notifyCompletionChange();
  }

  return (
    <div className="handbook-progress">
      <div className="handbook-progress-summary">
        <div>
          <strong>Your progress</strong>
          <span>
            {completedCount} of {total} {itemLabel} · {percentage}%
          </span>
        </div>
        <button type="button" disabled={completedCount === 0} onClick={resetProgress}>
          Reset progress
        </button>
      </div>
      <progress
        aria-label={`${completedCount} of ${total} available ${itemLabel} completed`}
        max={total || 1}
        value={completedCount}
      >
        {percentage}%
      </progress>
    </div>
  );
}
