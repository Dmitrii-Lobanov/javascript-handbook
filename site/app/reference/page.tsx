import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Frontend Reference" };

const referenceCollections = [
  ["JavaScript", "Equality tables, coercion rules, runtime terminology, and API comparisons."],
  ["React", "Hooks, rendering behavior, state patterns, and performance checklists."],
  ["Browser", "Events, rendering, storage, networking, and platform API references."],
  ["TypeScript", "Narrowing, utility types, generics, and type-modeling patterns."],
];

export default function ReferencePage() {
  return (
    <main className="collection-page">
      <section className="collection-hero">
        <span className="eyebrow">Frontend reference</span>
        <h1>Find the detail you need—fast.</h1>
        <p>Compact comparisons, cheat sheets, and diagnostic checklists will live here.</p>
        <span className="coming-soon-pill">Reference content planned</span>
      </section>
      <section className="collection-content">
        <div className="wiki-section-heading">
          <span className="eyebrow">Planned collections</span>
          <h2>Reference by technology</h2>
        </div>
        <div className="collection-grid">
          {referenceCollections.map(([title, description], index) => (
            <article className="collection-card" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{description}</p>
              <small>Planned</small>
            </article>
          ))}
        </div>
        <Link className="back-to-wiki" href="/">
          ← Back to the wiki
        </Link>
      </section>
    </main>
  );
}
