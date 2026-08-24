import type { Metadata } from "next";
import Link from "next/link";
import { JavaScriptNav } from "../../components/TechnologyNav";

export const metadata: Metadata = {
  title: "JavaScript Practice Roadmap",
  description:
    "A roadmap of explanatory JavaScript live-coding tasks for senior frontend interviews.",
};

const tasks = [
  {
    slug: "01-debounce",
    title: "Debounce with cancel and flush",
    description:
      "Build debounce from its closure and timer model, then preserve arguments, dynamic this, cancellation, and explicit flush behavior.",
    difficulty: "Intermediate",
    duration: "25–40 min",
    concepts: ["Closures", "Timers", "Function APIs"],
  },
  {
    slug: "02-throttle",
    title: "Throttle with leading and trailing calls",
    description:
      "Limit execution frequency while retaining the latest call and making leading, trailing, and cancellation semantics explicit.",
    difficulty: "Advanced",
    duration: "30–45 min",
    concepts: ["Scheduling", "Closures", "Time windows"],
  },
  {
    slug: "03-memoize",
    title: "Memoize with configurable cache keys",
    description:
      "Cache results without confusing falsy values, argument identity, serialization, promise failures, or invalidation policy.",
    difficulty: "Intermediate",
    duration: "25–40 min",
    concepts: ["Maps", "Identity", "Caching"],
  },
  {
    slug: "04-deep-clone",
    title: "Deep clone",
    description:
      "Clone recursive data while handling circular references and explaining prototypes, descriptors, built-ins, and structuredClone.",
    difficulty: "Advanced",
    duration: "35–50 min",
    concepts: ["Recursion", "WeakMap", "Object model"],
  },
  {
    slug: "05-deep-equal",
    title: "Deep equality",
    description:
      "Compare nested values with deliberate primitive semantics, own-key handling, circular-pair tracking, and clear scope boundaries.",
    difficulty: "Advanced",
    duration: "35–50 min",
    concepts: ["Equality", "Recursion", "Graph pairs"],
  },
  {
    slug: "06-event-emitter",
    title: "Event emitter",
    description:
      "Design on, off, once, and emit while preserving listener order and defining mutation, errors, and reentrancy during emission.",
    difficulty: "Intermediate",
    duration: "30–45 min",
    concepts: ["Callbacks", "Maps", "Reentrancy"],
  },
  {
    slug: "07-promise-all",
    title: "Implement Promise.all",
    description:
      "Coordinate an iterable of values and promises while preserving input order, handling empty input, and rejecting predictably.",
    difficulty: "Intermediate",
    duration: "25–40 min",
    concepts: ["Promises", "Iterables", "Ordering"],
  },
  {
    slug: "08-promise-pool",
    title: "Concurrency-limited promise pool",
    description:
      "Schedule asynchronous task functions under a strict concurrency limit with ordered results and an explicit failure policy.",
    difficulty: "Advanced",
    duration: "40–55 min",
    concepts: ["Queues", "Concurrency", "Backpressure"],
  },
  {
    slug: "09-retry-with-backoff",
    title: "Retry with backoff and cancellation",
    description:
      "Retry only eligible asynchronous failures with bounded delays, cancellation, deadlines, jitter, and idempotency reasoning.",
    difficulty: "Advanced",
    duration: "35–50 min",
    concepts: ["Async flow", "AbortSignal", "Resilience"],
  },
  {
    slug: "10-lru-cache",
    title: "LRU cache",
    description:
      "Maintain recency and fixed capacity with efficient reads, updates, and eviction using Map or a hash map plus linked list.",
    difficulty: "Advanced",
    duration: "35–50 min",
    concepts: ["Map", "Linked list", "Invariants"],
  },
] as const;

export default function JavaScriptPracticePage() {
  return (
    <>
      <JavaScriptNav active="practice" />
      <main className="react-practice-page">
        <section className="react-practice-hero">
          <div>
            <span className="eyebrow">JavaScript · Live coding roadmap</span>
            <h1>Implement the contract—not just the happy path.</h1>
            <p>
              Ten guided tasks for practicing closures, identity, object graphs, events,
              asynchronous coordination, caching, and the trade-offs expected in senior frontend
              interviews.
            </p>
            <div className="wiki-actions">
              <a className="primary-action" href="#javascript-live-coding-tasks">
                Explore the roadmap <span aria-hidden="true">↓</span>
              </a>
              <Link className="secondary-action" href="/javascript/q-and-a">
                Practice JavaScript Q&amp;A
              </Link>
            </div>
          </div>
          <div
            className="react-practice-stats"
            aria-label="JavaScript practice roadmap statistics"
          >
            <div>
              <strong>10</strong>
              <span>planned walkthroughs</span>
            </div>
            <div>
              <strong>25–55</strong>
              <span>minute interview scope</span>
            </div>
            <div>
              <strong>4</strong>
              <span>skill groups</span>
            </div>
          </div>
        </section>

        <section className="react-practice-method" aria-labelledby="javascript-practice-method">
          <span className="eyebrow">The solution method</span>
          <h2 id="javascript-practice-method">Contract. Invariants. Baseline. Edge cases. Explain.</h2>
          <p>
            Each walkthrough will begin with a finishable implementation, then add correctness and
            production requirements without hiding the language mechanics behind a library.
          </p>
        </section>

        <section
          className="react-practice-catalog"
          id="javascript-live-coding-tasks"
          aria-labelledby="javascript-live-coding-title"
        >
          <div className="wiki-section-heading">
            <span className="eyebrow">Practice roadmap</span>
            <h2 id="javascript-live-coding-title">Ten tasks that reveal JavaScript reasoning</h2>
            <p>
              The roadmap progresses from function wrappers and structural data to asynchronous
              orchestration and stateful data structures. Articles will become clickable as they are
              published.
            </p>
          </div>

          <div className="react-task-grid">
            {tasks.map((task, index) => (
              <article className="react-task-card" key={task.slug}>
                <div className="react-task-card-top">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <small>Article planned</small>
                </div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <ul aria-label={`${task.title} concepts`}>
                  {task.concepts.map((concept) => (
                    <li key={concept}>{concept}</li>
                  ))}
                </ul>
                <div className="react-task-card-meta">
                  <span>{task.difficulty}</span>
                  <span>{task.duration}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
