"use client";

import { MarkdownContent } from "./MarkdownContent";
import { CompletionLabel, SectionProgress } from "./ChapterRoadmapStatus";
import { CompletionControl } from "./ReaderControls";
import type { QuestionAnswer, QuestionRoadmapSection } from "@/generated/content";

export function QuestionAnswerCollection({
  technology,
  description,
  roadmap,
  answers,
}: {
  technology: string;
  description: string;
  roadmap: QuestionRoadmapSection[];
  answers: QuestionAnswer[];
}) {
  const questionCount = roadmap.reduce((total, section) => total + section.questions.length, 0);
  const answersByNumber = new Map(answers.map((answer) => [answer.number, answer]));
  const completionPrefix = `${technology.toLowerCase()}-q-and-a`;
  const completionSlugs = answers.map((answer) => `${completionPrefix}-${answer.number}`);

  return (
    <main className="questions-page">
      <section className="questions-hero">
        <span className="eyebrow">Interview practice · {technology}</span>
        <h1>{technology} Questions &amp; Answers</h1>
        <p>{description}</p>
        <div className="questions-stats" aria-label={`${technology} Q&A statistics`}>
          <div>
            <strong>{answers.length}</strong>
            <span>answers available</span>
          </div>
          <div>
            <strong>{roadmap.length}</strong>
            <span>topic groups</span>
          </div>
          <span className="coming-soon-pill">{questionCount} questions total</span>
        </div>
      </section>

      <section className="questions-roadmap" aria-labelledby="questions-roadmap-title">
        <div className="questions-roadmap-heading">
          <span className="eyebrow">Q&amp;A topics</span>
          <h2 id="questions-roadmap-title">Choose a topic</h2>
          <p>Open a question for the concise answer, explanation, and deeper follow-up.</p>
          <SectionProgress itemSlugs={completionSlugs} itemLabel="questions" />
        </div>

        <div className="question-section-list">
          {roadmap.map((section, index) => (
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
                  const answer = answersByNumber.get(question.number);

                  return answer ? (
                    <li className="answered-question" key={question.number}>
                      <details>
                        <summary>
                          <span>{String(question.number).padStart(3, "0")}</span>
                          <p>{question.title}</p>
                          <CompletionLabel
                            className="question-completion-label"
                            hideIncomplete
                            slug={`${completionPrefix}-${question.number}`}
                          />
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
                          <div className="answer-completion">
                            <span>Finished reviewing this question?</span>
                            <CompletionControl slug={`${completionPrefix}-${question.number}`} />
                          </div>
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
