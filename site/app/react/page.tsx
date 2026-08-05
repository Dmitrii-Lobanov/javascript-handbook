import type { Metadata } from "next";
import Link from "next/link";
import { ReactNav } from "../components/TechnologyNav";
import { reactQuestionAnswers, reactQuestionRoadmap } from "@/generated/content";

export const metadata: Metadata = {
  title: "React",
  description: "The planned React frontend engineering knowledge track.",
};

export default function ReactPage() {
  const questionCount = reactQuestionRoadmap.reduce(
    (total, section) => total + section.questions.length,
    0,
  );

  return (
    <>
      <ReactNav active="overview" />
      <main className="technology-page">
        <section className="technology-hero">
          <span className="technology-hero-mark react" aria-hidden="true">
            RE
          </span>
          <div>
            <span className="eyebrow">Technology track · Up next</span>
            <h1>React</h1>
            <p>
              A dedicated track for rendering, state, effects, scheduling, performance, component
              design, and senior-level React interviews.
            </p>
            <div className="technology-stats">
              <span>
                <strong>{reactQuestionAnswers.length}</strong> answers available
              </span>
              <span>
                <strong>{reactQuestionRoadmap.length}</strong> topic groups
              </span>
            </div>
          </div>
        </section>

        <section className="technology-resources" aria-labelledby="react-resources-title">
          <div className="wiki-section-heading">
            <span className="eyebrow">React resources</span>
            <h2 id="react-resources-title">Structure ready for content</h2>
            <p>The React handbook and Q&amp;A sources now have dedicated repository folders.</p>
          </div>
          <div className="technology-resource-grid">
            <article className="technology-resource-card">
              <span className="resource-type">Learn</span>
              <h3>React Handbook</h3>
              <p>
                Connected chapters covering React's mental models, runtime behavior, and trade-offs.
              </p>
              <div>Planned</div>
            </article>
            <Link className="technology-resource-card available" href="/react/q-and-a">
              <span className="resource-type">Interview Q&amp;A</span>
              <h3>React Questions &amp; Answers</h3>
              <p>Concise answers with practical explanations and deeper senior-level follow-ups.</p>
              <div>
                <strong>{reactQuestionAnswers.length}</strong> of {questionCount} answers available
              </div>
              <span className="resource-link">Practice answers →</span>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
