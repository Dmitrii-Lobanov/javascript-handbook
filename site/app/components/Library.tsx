"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Chapter, RoadmapPart } from "@/generated/content";

export function Library({ chapters, roadmap }: { chapters: Chapter[]; roadmap: RoadmapPart[] }) {
  const [query, setQuery] = useState("");
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    try {
      setCompleted(JSON.parse(localStorage.getItem("handbook-completed") ?? "[]"));
    } catch {
      setCompleted([]);
    }
  }, []);

  const search = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return { published: chapters, planned: [] };

    const matches = (text: string) => terms.every((term) => text.includes(term));
    const published = chapters.filter((chapter) =>
      matches(
        [chapter.title, chapter.quickRefresher, chapter.headings.join(" "), chapter.searchText]
          .join(" ")
          .toLowerCase(),
      ),
    );
    const publishedNumbers = new Set(published.map((chapter) => chapter.number));
    const planned = roadmap.flatMap((part) =>
      part.chapters
        .filter(
          (chapter) =>
            !publishedNumbers.has(chapter.number) &&
            matches(`${part.title} ${chapter.title}`.toLowerCase()),
        )
        .map((chapter) => ({ ...chapter, part: part.title })),
    );

    return { published, planned };
  }, [chapters, query, roadmap]);

  const isSearching = query.trim().length > 0;
  const resultCount = search.published.length + search.planned.length;
  const availableChapters = chapters.filter((chapter) => chapter.kind === "chapter");
  const chaptersByPart = new Map<number, Chapter[]>();

  chapters.forEach((chapter) => {
    const partChapters = chaptersByPart.get(chapter.partNumber) ?? [];
    partChapters.push(chapter);
    chaptersByPart.set(chapter.partNumber, partChapters);
  });

  const percent = availableChapters.length
    ? Math.round(
        (completed.filter((slug) => availableChapters.some((chapter) => chapter.slug === slug))
          .length /
          availableChapters.length) *
          100,
      )
    : 0;

  return (
    <section className="library-section" id="library">
      <div className="library-heading">
        <div>
          <span className="eyebrow">Your study library</span>
          <h2>Handbook Parts</h2>
          <p>Choose a part, then open the chapter you want to study.</p>
        </div>
        <div className="progress-card" aria-label={`${percent}% of available chapters complete`}>
          <div className="progress-label">
            <span>Reading progress</span>
            <strong>{percent}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      <label className="search-box">
        <span aria-hidden="true">⌕</span>
        <span className="sr-only">Search handbook chapters</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search closures, microtasks, scope…"
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
            ×
          </button>
        )}
      </label>

      {isSearching && (
        <p className="search-summary" role="status" aria-live="polite">
          {resultCount} {resultCount === 1 ? "result" : "results"} for{" "}
          <strong>“{query.trim()}”</strong>
        </p>
      )}

      {isSearching ? (
        <div className="chapter-grid">
          {search.published.map((chapter) => (
            <ChapterCard
              chapter={chapter}
              isComplete={completed.includes(chapter.slug)}
              key={chapter.slug}
            />
          ))}
        </div>
      ) : (
        <div className="part-list">
          {roadmap.map((part, partIndex) => {
            const published = chaptersByPart.get(partIndex + 1) ?? [];
            const availableSlugs = new Set(published.map((chapter) => chapter.slug));
            const planned = part.chapters.filter(
              (chapter) => !chapter.slug || !availableSlugs.has(chapter.slug),
            );

            return (
              <details className="part-panel" key={part.label} open={partIndex === 0}>
                <summary>
                  <span className="part-index">{part.label}</span>
                  <span className="part-summary-copy">
                    <strong>{part.title}</strong>
                    <small>
                      {published.length} {published.length === 1 ? "reading" : "readings"} available
                      {planned.length ? ` · ${planned.length} planned` : ""}
                    </small>
                  </span>
                  <span className="part-toggle" aria-hidden="true" />
                </summary>

                <div className="part-content">
                  {published.length > 0 ? (
                    <div className="chapter-grid">
                      {published.map((chapter) => (
                        <ChapterCard
                          chapter={chapter}
                          isComplete={completed.includes(chapter.slug)}
                          key={chapter.slug}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="part-empty">Chapters for this part are being prepared.</p>
                  )}

                  {planned.length > 0 && (
                    <details className="planned-chapters">
                      <summary>View {planned.length} planned chapters</summary>
                      <ol>
                        {planned.map((chapter) => (
                          <li key={chapter.number}>
                            <span>{String(chapter.number).padStart(2, "0")}</span>
                            {chapter.title}
                          </li>
                        ))}
                      </ol>
                    </details>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}

      {isSearching && search.planned.length > 0 && (
        <div className="planned-results">
          <h3>Planned chapters</h3>
          <ul>
            {search.planned.map((chapter) => (
              <li key={chapter.number}>
                <span>{String(chapter.number).padStart(2, "0")}</span>
                <div>
                  <strong>{chapter.title}</strong>
                  <small>{chapter.part}</small>
                </div>
                {chapter.slug && (
                  <Link href={`/javascript/handbook/chapters/${chapter.slug}`}>Read →</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isSearching && resultCount === 0 && (
        <div className="empty-state">
          <strong>No matching chapters.</strong>
          <span>Try fewer words or search for a broader JavaScript concept.</span>
        </div>
      )}
    </section>
  );
}

function ChapterCard({ chapter, isComplete }: { chapter: Chapter; isComplete: boolean }) {
  return (
    <Link className="chapter-card" href={`/javascript/handbook/chapters/${chapter.slug}`}>
      <div className="chapter-card-top">
        <span className="chapter-number">
          {chapter.kind === "summary" ? "Review" : String(chapter.number).padStart(2, "0")}
        </span>
        <span className={isComplete ? "complete-pill done" : "complete-pill"}>
          {isComplete ? "Completed" : `${chapter.readingMinutes} min`}
        </span>
      </div>
      <h3>{chapter.title}</h3>
      <p>{chapter.excerpt}</p>
      <span className="card-link">
        {chapter.kind === "summary" ? `Review Part ${chapter.partNumber}` : "Read chapter"}{" "}
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
