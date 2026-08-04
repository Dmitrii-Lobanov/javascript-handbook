import type { Metadata } from "next";
import { questionRoadmap } from "@/generated/content";

export const metadata: Metadata = {
  title: "JavaScript Interview Q&A",
  description: "The planned JavaScript interview questions and answers roadmap.",
};

export default function QuestionsPage() {
  const questionCount = questionRoadmap.reduce(
    (total, section) => total + section.questions.length,
    0,
  );

  return (
    <main className="questions-page">
      <section className="questions-hero">
        <span className="eyebrow">Interview practice</span>
        <h1>JavaScript Questions &amp; Answers</h1>
        <p>
          A focused companion to the handbook for testing recall and practicing concise interview
          explanations.
        </p>
        <div className="questions-stats" aria-label="Questions and answers roadmap statistics">
          <div>
            <strong>{questionCount}</strong>
            <span>questions planned</span>
          </div>
          <div>
            <strong>{questionRoadmap.length}</strong>
            <span>topic groups</span>
          </div>
          <span className="coming-soon-pill">Answers coming soon</span>
        </div>
      </section>

      <section className="questions-roadmap" aria-labelledby="questions-roadmap-title">
        <div className="questions-roadmap-heading">
          <span className="eyebrow">Q&amp;A roadmap</span>
          <h2 id="questions-roadmap-title">Choose a topic</h2>
          <p>The roadmap is ready. Question and answer pages will be added later.</p>
        </div>

        <div className="question-section-list">
          {questionRoadmap.map((section, index) => (
            <details className="question-section" key={section.title} open={index === 0}>
              <summary>
                <span className="question-section-index">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{section.title}</strong>
                  <small>{section.questions.length} planned questions</small>
                </span>
                <span className="part-toggle" aria-hidden="true" />
              </summary>
              <ol>
                {section.questions.map((question) => (
                  <li key={question.number}>
                    <span>{String(question.number).padStart(3, "0")}</span>
                    <p>{question.title}</p>
                    <small>Planned</small>
                  </li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
