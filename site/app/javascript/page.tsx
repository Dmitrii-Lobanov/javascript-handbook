import type { Metadata } from "next";
import Link from "next/link";
import { JavaScriptNav } from "../components/TechnologyNav";
import { chapters, questionAnswers, questionRoadmap, roadmap } from "@/generated/content";

export const metadata: Metadata = {
  title: "JavaScript",
  description: "JavaScript handbooks, interview Q&A, references, and practice.",
};

export default function JavaScriptPage() {
  const chapterCount = chapters.filter((chapter) => chapter.kind === "chapter").length;
  const plannedQuestions = questionRoadmap.reduce(
    (total, section) => total + section.questions.length,
    0,
  );
  const plannedChapters = roadmap.reduce((total, part) => total + part.chapters.length, 0);

  return (
    <>
      <JavaScriptNav active="overview" />
      <main className="technology-page">
        <section className="technology-hero">
          <span className="technology-hero-mark" aria-hidden="true">
            JS
          </span>
          <div>
            <span className="eyebrow">Technology track</span>
            <h1>JavaScript</h1>
            <p>
              Master language semantics, runtime behavior, browser integration, performance, and the
              explanations expected in senior frontend interviews.
            </p>
            <div className="technology-stats">
              <span>
                <strong>{chapterCount}</strong> chapters available
              </span>
              <span>
                <strong>{questionAnswers.length}</strong> answers available
              </span>
            </div>
          </div>
        </section>

        <section className="technology-resources" aria-labelledby="javascript-resources-title">
          <div className="wiki-section-heading">
            <span className="eyebrow">JavaScript resources</span>
            <h2 id="javascript-resources-title">Choose your format</h2>
            <p>Study the complete model or practice retrieving it under interview pressure.</p>
          </div>
          <div className="technology-resource-grid">
            <Link className="technology-resource-card available" href="/javascript/handbook">
              <span className="resource-type">Learn</span>
              <h3>JavaScript Handbook</h3>
              <p>
                Connected chapters that move from runtime foundations to senior-level reasoning.
              </p>
              <div>
                <strong>{chapterCount}</strong> of {plannedChapters} chapters available
              </div>
              <span className="resource-link">Open handbook →</span>
            </Link>
            <Link className="technology-resource-card available" href="/javascript/q-and-a">
              <span className="resource-type">Interview Q&amp;A</span>
              <h3>JavaScript Questions &amp; Answers</h3>
              <p>Concise answers, practical explanations, and optional deeper follow-up detail.</p>
              <div>
                <strong>{questionAnswers.length}</strong> of {plannedQuestions} answers available
              </div>
              <span className="resource-link">Practice answers →</span>
            </Link>
            <article className="technology-resource-card">
              <span className="resource-type">Reference</span>
              <h3>JavaScript Quick Reference</h3>
              <p>
                Comparison tables, syntax reminders, runtime terminology, and debugging checklists.
              </p>
              <div>Planned</div>
            </article>
            <article className="technology-resource-card">
              <span className="resource-type">Practice</span>
              <h3>JavaScript Practice Lab</h3>
              <p>
                Output prediction, debugging scenarios, implementation tasks, and mock interviews.
              </p>
              <div>Planned</div>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
