import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Frontend Practice Lab" };

const practiceModes = [
  ["Output prediction", "Trace runtime behavior and explain every step."],
  ["Debugging scenarios", "Diagnose realistic browser, React, and performance failures."],
  ["Coding exercises", "Implement focused utilities and frontend patterns."],
  ["Architecture prompts", "Reason about boundaries, trade-offs, and system behavior."],
];

export default function PracticePage() {
  return (
    <main className="collection-page">
      <section className="collection-hero practice-hero">
        <span className="eyebrow">Practice lab</span>
        <h1>Turn knowledge into engineering judgment.</h1>
        <p>Interactive exercises and interview simulations will connect directly to wiki topics.</p>
        <span className="coming-soon-pill">Practice content planned</span>
      </section>
      <section className="collection-content">
        <div className="wiki-section-heading">
          <span className="eyebrow">Planned formats</span>
          <h2>Practice from multiple angles</h2>
        </div>
        <div className="collection-grid">
          {practiceModes.map(([title, description], index) => (
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
