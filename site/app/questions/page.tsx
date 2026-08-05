import type { Metadata } from "next";
import { MarkdownContent } from "../components/MarkdownContent";
import { questionAnswers, questionRoadmap } from "@/generated/content";

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
            <strong>{questionAnswers.length}</strong>
            <span>answers available</span>
          </div>
          <div>
            <strong>{questionRoadmap.length}</strong>
            <span>topic groups</span>
          </div>
          <span className="coming-soon-pill">{questionCount} questions planned</span>
        </div>
      </section>

      <section className="questions-roadmap" aria-labelledby="questions-roadmap-title">
        <div className="questions-roadmap-heading">
          <span className="eyebrow">Q&amp;A roadmap</span>
          <h2 id="questions-roadmap-title">Choose a topic</h2>
          <p>Available answers are marked below. The remaining questions stay on the roadmap.</p>
        </div>

        <div className="question-section-list">
          {questionRoadmap.map((section, index) => (
            <details className="question-section" key={section.title} open={index === 0}>
              <summary>
                <span className="question-section-index">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{section.title}</strong>
                  <small>{section.questions.length} questions</small>
                </span>
                <span className="part-toggle" aria-hidden="true" />
              </summary>
              <ol>
                {section.questions.map((question) => {
                  const answer = questionAnswers.find(
                    (answer) => answer.number === question.number,
                  );

                  return answer ? (
                    <li className="answered-question" key={question.number}>
                      <details>
                        <summary>
                          <span>{String(question.number).padStart(3, "0")}</span>
                          <p>{question.title}</p>
                          <span className="answer-toggle" aria-hidden="true" />
                        </summary>
                        <div className="answer-body">
                          <div className="answer-card-section">
                            <span>Short answer</span>
                            <MarkdownContent markdown={answer.answer} />
                          </div>
                          <div className="answer-card-section explanation">
                            <span>Why it matters</span>
                            <MarkdownContent markdown={answer.explanation} />
                          </div>
                          {answer.details && (
                            <details className="answer-details">
                              <summary>
                                <svg
                                  className="answer-details-icon"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <circle cx="12" cy="12" r="9" />
                                  <path d="M12 10.5v6M12 7.5h.01" />
                                </svg>
                                More details
                                <span className="answer-details-chevron" aria-hidden="true" />
                              </summary>
                              <div className="answer-details-content answer-card-section">
                                <MarkdownContent markdown={answer.details} />
                              </div>
                            </details>
                          )}
                        </div>
                      </details>
                    </li>
                  ) : (
                    <li key={question.number}>
                      <span>{String(question.number).padStart(3, "0")}</span>
                      <p>{question.title}</p>
                      <small>Planned</small>
                    </li>
                  );
                })}
              </ol>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
