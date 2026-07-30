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

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return chapters;
    return chapters.filter(chapter =>
      chapter.title.toLowerCase().includes(normalized) ||
      chapter.searchText.includes(normalized),
    );
  }, [chapters, query]);

  const percent = chapters.length
    ? Math.round((completed.filter(slug => chapters.some(chapter => chapter.slug === slug)).length / chapters.length) * 100)
    : 0;

  return (
    <section className="library-section" id="library">
      <div className="library-heading">
        <div>
          <span className="eyebrow">Your study library</span>
          <h2>Runtime Foundations</h2>
          <p>Start in order, or search for the concept you need to refresh.</p>
        </div>
        <div className="progress-card" aria-label={`${percent}% of available chapters complete`}>
          <div className="progress-label"><span>Reading progress</span><strong>{percent}%</strong></div>
          <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>
        </div>
      </div>

      <label className="search-box">
        <span aria-hidden="true">⌕</span>
        <span className="sr-only">Search handbook chapters</span>
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search closures, microtasks, scope…"
        />
        {query && <button onClick={() => setQuery("")} aria-label="Clear search">×</button>}
      </label>

      <div className="chapter-grid">
        {visible.map(chapter => {
          const isComplete = completed.includes(chapter.slug);
          return (
            <Link className="chapter-card" href={`/chapters/${chapter.slug}`} key={chapter.slug}>
              <div className="chapter-card-top">
                <span className="chapter-number">{String(chapter.number).padStart(2, "0")}</span>
                <span className={isComplete ? "complete-pill done" : "complete-pill"}>{isComplete ? "Completed" : `${chapter.readingMinutes} min`}</span>
              </div>
              <h3>{chapter.title}</h3>
              <p>{chapter.excerpt}</p>
              <span className="card-link">Read chapter <span aria-hidden="true">→</span></span>
            </Link>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="empty-state">
          <strong>No matching chapter yet.</strong>
          <span>Try a broader runtime concept or clear the search.</span>
        </div>
      )}

      {!query && (
        <details className="roadmap">
          <summary>View the complete 76-chapter roadmap</summary>
          <div className="roadmap-grid">
            {roadmap.map(part => (
              <section key={part.label}>
                <span>{part.label}</span>
                <h3>{part.title}</h3>
                <ol>
                  {part.chapters.map(chapter => (
                    <li key={chapter.number} className={chapter.slug ? "available" : "planned"}>
                      {chapter.slug ? <Link href={`/chapters/${chapter.slug}`}>{chapter.title}</Link> : chapter.title}
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
