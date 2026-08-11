import type { Metadata } from "next";
import Link from "next/link";
import { ReactNav } from "../../components/TechnologyNav";

export const metadata: Metadata = {
  title: "React Live Coding Articles",
  description:
    "Explanatory walkthroughs for ten React live-coding tasks frequently used in senior frontend interviews.",
};

const tasks = [
  {
    slug: "01-accessible-autocomplete",
    title: "Accessible autocomplete",
    description:
      "Build responsive search suggestions while handling debouncing, stale responses, keyboard selection, and combobox semantics.",
    difficulty: "Advanced",
    duration: "45–60 min",
    concepts: ["Async state", "Effects", "A11y"],
  },
  {
    slug: "02-data-table",
    title: "Sortable data table",
    description:
      "Model sorting, filtering, row selection, and pagination without duplicating derived state or losing table semantics.",
    difficulty: "Advanced",
    duration: "45–60 min",
    concepts: ["Derived state", "Composition", "Performance"],
  },
  {
    slug: "03-accessible-modal-dialog",
    title: "Accessible modal dialog",
    description:
      "Design a reusable dialog with portals, Escape handling, focus containment, focus restoration, and safe dismissal behavior.",
    difficulty: "Advanced",
    duration: "35–50 min",
    concepts: ["Portals", "Refs", "Focus"],
  },
  {
    slug: "04-reusable-tabs",
    title: "Reusable tabs",
    description:
      "Create controlled and uncontrolled tabs with a composable API, stable relationships, and complete keyboard navigation.",
    difficulty: "Intermediate",
    duration: "30–45 min",
    concepts: ["Composition", "Context", "A11y"],
  },
  {
    slug: "05-infinite-scrolling-feed",
    title: "Infinite scrolling feed",
    description:
      "Load cursor-based pages without duplicate requests, stale results, missing records, or inaccessible navigation behavior.",
    difficulty: "Advanced",
    duration: "45–60 min",
    concepts: ["Pagination", "Observer", "Async state"],
  },
  {
    slug: "06-file-explorer-tree",
    title: "File explorer tree",
    description:
      "Render and update recursive data while preserving expansion state, stable identity, selection, and keyboard navigation.",
    difficulty: "Advanced",
    duration: "45–60 min",
    concepts: ["Recursion", "Tree state", "Keys"],
  },
  {
    slug: "07-toast-notification-system",
    title: "Toast notification system",
    description:
      "Build a provider and Hook API with queues, auto-dismiss timers, exit behavior, deduplication, and live announcements.",
    difficulty: "Advanced",
    duration: "40–55 min",
    concepts: ["Context", "Reducers", "Timers"],
  },
  {
    slug: "08-multi-step-form",
    title: "Multi-step form",
    description:
      "Coordinate field values, validation, conditional steps, drafts, server errors, and accessible focus management.",
    difficulty: "Advanced",
    duration: "45–60 min",
    concepts: ["Forms", "State machine", "Validation"],
  },
  {
    slug: "09-reorderable-list",
    title: "Reorderable list",
    description:
      "Implement drag-and-drop and keyboard reordering with immutable updates, optimistic persistence, and stable item identity.",
    difficulty: "Advanced",
    duration: "45–60 min",
    concepts: ["Pointer events", "Optimistic UI", "A11y"],
  },
  {
    slug: "10-async-resource-explorer",
    title: "Async resource explorer",
    description:
      "Fetch, search, filter, and inspect remote data while handling cancellation, caching, retries, URL state, and waterfalls.",
    difficulty: "Advanced",
    duration: "45–60 min",
    concepts: ["Server state", "Caching", "Routing"],
  },
] as const;

export default function ReactPracticePage() {
  return (
    <>
      <ReactNav active="practice" />
      <main className="react-practice-page">
        <section className="react-practice-hero">
          <div>
            <span className="eyebrow">React · Live coding articles</span>
            <h1>Learn how to solve the task—not what to memorize.</h1>
            <p>
              Ten senior-level walkthroughs covering requirement discovery, state modeling,
              implementation strategy, accessibility, testing, and the tradeoffs worth explaining
              while you code.
            </p>
            <div className="wiki-actions">
              <a className="primary-action" href="#live-coding-tasks">
                Explore the tasks <span aria-hidden="true">↓</span>
              </a>
              <Link className="secondary-action" href="/react/q-and-a">
                Practice React Q&amp;A
              </Link>
            </div>
          </div>
          <div className="react-practice-stats" aria-label="React live coding collection statistics">
            <div><strong>10</strong><span>explanatory articles</span></div>
            <div><strong>45–60</strong><span>minute interview scope</span></div>
            <div><strong>15</strong><span>steps in every guide</span></div>
          </div>
        </section>

        <section className="react-practice-method" aria-labelledby="practice-method-title">
          <span className="eyebrow">The solution method</span>
          <h2 id="practice-method-title">Clarify. Model. Build. Harden. Explain.</h2>
          <p>
            Every article begins with an interview-sized solution, then separates production
            hardening so you can finish under time pressure without ignoring senior-level concerns.
          </p>
        </section>

        <section
          className="react-practice-catalog"
          id="live-coding-tasks"
          aria-labelledby="live-coding-title"
        >
          <div className="wiki-section-heading">
            <span className="eyebrow">Article roadmap</span>
            <h2 id="live-coding-title">Ten tasks that expose real engineering judgment</h2>
            <p>
              The collection progresses from reusable UI primitives to asynchronous workflows and
              application-level state.
            </p>
          </div>

          <div className="react-task-grid">
            {tasks.map((task, index) => {
              const available = index === 0;
              const content = (
                <>
                <div className="react-task-card-top">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <small>{available ? "Available" : "Article planned"}</small>
                </div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <ul aria-label={`${task.title} concepts`}>
                  {task.concepts.map((concept) => <li key={concept}>{concept}</li>)}
                </ul>
                <div className="react-task-card-meta">
                  <span>{task.difficulty}</span>
                  <span>{task.duration}</span>
                </div>
                {available && <span className="react-task-card-link">Read the walkthrough →</span>}
                </>
              );

              return available ? (
                <Link
                  className="react-task-card available"
                  href={`/react/practice/articles/${task.slug}`}
                  key={task.title}
                >
                  {content}
                </Link>
              ) : (
                <article className="react-task-card" key={task.title}>{content}</article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
