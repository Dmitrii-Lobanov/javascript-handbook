import type { Metadata } from "next";
import Link from "next/link";
import { chapters, questionAnswers, reactQuestionAnswers } from "@/generated/content";
import { learningTracks } from "./lib/tracks";

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

export default function WikiHome() {
  const answerCount = questionAnswers.length + reactQuestionAnswers.length;

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
            <strong>{answerCount}</strong>
            <span>answers available</span>
          </div>
          <div>
            <strong>{learningTracks.length}</strong>
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
          <p>Follow the phased curriculum or jump directly to the subject you need.</p>
        </div>
        <div className="track-grid">
          {learningTracks.map((track) => (
            <Link className="track-card available" href={`/${track.slug}`} key={track.title}>
              <span className={`track-mark ${track.status}`}>{track.mark}</span>
              <div>
                <div className="track-title-row">
                  <h3>{track.title}</h3>
                  <small>
                    {track.status === "available"
                      ? "Available"
                      : track.status === "expanding"
                        ? "Expanding"
                        : `Phase ${track.phase}`}
                  </small>
                </div>
                <p>{track.description}</p>
                <span className="track-meta">
                  {track.resources.map((resource) => resource.label).join(" · ")}
                </span>
              </div>
              <span className="track-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
