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

    const matches = (text: string) => terms.every(term => text.includes(term));
    const published = chapters.filter(chapter => matches([
      chapter.title,
      chapter.quickRefresher,
      chapter.headings.join(" "),
      chapter.searchText,
    ].join(" ").toLowerCase()));
    const publishedNumbers = new Set(published.map(chapter => chapter.number));
    const planned = roadmap.flatMap(part => part.chapters
      .filter(chapter => !publishedNumbers.has(chapter.number) && matches(`${part.title} ${chapter.title}`.toLowerCase()))
      .map(chapter => ({ ...chapter, part: part.title })));

    return { published, planned };
  }, [chapters, query, roadmap]);

  const isSearching = query.trim().length > 0;
  const resultCount = search.published.length + search.planned.length;

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
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search closures, microtasks, scope…"
          autoComplete="off"
        />
        {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
      </label>

      {isSearching && (
        <p className="search-summary" role="status" aria-live="polite">
          {resultCount} {resultCount === 1 ? "result" : "results"} for <strong>“{query.trim()}”</strong>
        </p>
      )}

      <div className="chapter-grid">
        {search.published.map(chapter => {
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

      {isSearching && search.planned.length > 0 && (
        <div className="planned-results">
          <h3>Planned chapters</h3>
          <ul>{search.planned.map(chapter => (
            <li key={chapter.number}>
              <span>{String(chapter.number).padStart(2, "0")}</span>
              <div><strong>{chapter.title}</strong><small>{chapter.part}</small></div>
              {chapter.slug && <Link href={`/chapters/${chapter.slug}`}>Read →</Link>}
            </li>
          ))}</ul>
        </div>
      )}

      {isSearching && resultCount === 0 && (
        <div className="empty-state">
          <strong>No matching chapters.</strong>
          <span>Try fewer words or search for a broader JavaScript concept.</span>
        </div>
      )}

      {!isSearching && (
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
