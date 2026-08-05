import type { Metadata } from "next";
import Link from "next/link";
import { chapters, questionAnswers } from "@/generated/content";

export const metadata: Metadata = {
  title: "Frontend Engineering Wiki",
  description:
    "A growing frontend engineering knowledge hub for learning, interview preparation, reference, and practice.",
};

const modes = [
  {
    label: "Learn",
    title: "Structured handbooks",
    description: "Build durable mental models through connected, interview-focused chapters.",
    href: "/javascript/handbook",
    status: "Available",
  },
  {
    label: "Q&A",
    title: "Practice explanations",
    description: "Start concise, then reveal reasoning and senior-level follow-up detail.",
    href: "/javascript/q-and-a",
    status: "Available",
  },
  {
    label: "Reference",
    title: "Recall facts quickly",
    description: "Use focused comparisons, cheat sheets, APIs, and debugging checklists.",
    href: "/reference",
    status: "Roadmap",
  },
  {
    label: "Practice",
    title: "Turn knowledge into skill",
    description: "Work through output prediction, debugging, coding, and architecture prompts.",
    href: "/practice",
    status: "Roadmap",
  },
];

const tracks = [
  {
    mark: "JS",
    title: "JavaScript",
    description: "Runtime internals, language semantics, browser behavior, and performance.",
    meta: `${chapters.filter((chapter) => chapter.kind === "chapter").length} chapters · ${questionAnswers.length} answers`,
    href: "/javascript",
    state: "active",
  },
  {
    mark: "RE",
    title: "React",
    description: "Rendering, state, effects, scheduling, performance, and component design.",
    meta: "Handbook and Q&A planned",
    state: "next",
  },
  {
    mark: "TS",
    title: "TypeScript",
    description: "Type modeling, inference, generics, narrowing, and production patterns.",
    meta: "Track planned",
    state: "planned",
  },
  {
    mark: "BR",
    title: "Browser & DOM",
    description: "Events, rendering, storage, networking, accessibility, and platform APIs.",
    meta: "Track planned",
    state: "planned",
  },
  {
    mark: "PF",
    title: "Performance",
    description: "Measurement, main-thread work, loading, rendering, and memory diagnosis.",
    meta: "Track planned",
    state: "planned",
  },
  {
    mark: "AR",
    title: "Frontend Architecture",
    description: "Boundaries, state ownership, data flow, resilience, and system design.",
    meta: "Track planned",
    state: "planned",
  },
];

export default function WikiHome() {
  return (
    <main className="wiki-home">
      <section className="wiki-hero">
        <span className="eyebrow">Frontend Engineering Wiki</span>
        <h1>
          Learn deeply.
          <br />
          Practice clearly.
        </h1>
        <p>
          A growing knowledge system for frontend engineers—structured handbooks, interview Q&amp;A,
          quick references, and deliberate practice in one place.
        </p>
        <div className="wiki-actions">
          <Link className="primary-action" href="/javascript/handbook">
            Start with JavaScript <span aria-hidden="true">→</span>
          </Link>
          <Link className="secondary-action" href="/javascript/q-and-a">
            Open interview Q&amp;A
          </Link>
        </div>
        <div className="wiki-stats" aria-label="Wiki statistics">
          <div>
            <strong>{chapters.filter((chapter) => chapter.kind === "chapter").length}</strong>
            <span>chapters available</span>
          </div>
          <div>
            <strong>{questionAnswers.length}</strong>
            <span>answers available</span>
          </div>
          <div>
            <strong>{tracks.length}</strong>
            <span>knowledge tracks</span>
          </div>
        </div>
      </section>

      <section className="wiki-section wiki-modes" aria-labelledby="study-modes-title">
        <div className="wiki-section-heading">
          <span className="eyebrow">One wiki, four modes</span>
          <h2 id="study-modes-title">Choose how you want to learn</h2>
          <p>Move from understanding to recall and practice without losing the topic context.</p>
        </div>
        <div className="mode-grid">
          {modes.map((mode, index) => (
            <Link className="mode-card" href={mode.href} key={mode.label}>
              <div className="mode-card-top">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <small>{mode.status}</small>
              </div>
              <strong>{mode.label}</strong>
              <h3>{mode.title}</h3>
              <p>{mode.description}</p>
              <span className="mode-link">Explore →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="wiki-section wiki-tracks" aria-labelledby="tracks-title">
        <div className="wiki-section-heading">
          <span className="eyebrow">Knowledge tracks</span>
          <h2 id="tracks-title">Grow beyond one handbook</h2>
          <p>JavaScript is available now. The interface is ready for the next frontend domains.</p>
        </div>
        <div className="track-grid">
          {tracks.map((track) => {
            const content = (
              <>
                <span className={`track-mark ${track.state}`}>{track.mark}</span>
                <div>
                  <div className="track-title-row">
                    <h3>{track.title}</h3>
                    <small>
                      {track.state === "active"
                        ? "Available"
                        : track.state === "next"
                          ? "Up next"
                          : "Planned"}
                    </small>
                  </div>
                  <p>{track.description}</p>
                  <span className="track-meta">{track.meta}</span>
                </div>
                {track.href && (
                  <span className="track-arrow" aria-hidden="true">
                    →
                  </span>
                )}
              </>
            );

            return track.href ? (
              <Link className="track-card available" href={track.href} key={track.title}>
                {content}
              </Link>
            ) : (
              <article className="track-card" key={track.title}>
                {content}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
