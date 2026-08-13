import type { Metadata } from "next";
import Link from "next/link";
import { reactChapters } from "@/generated/content";
import { ReactNav } from "../../components/TechnologyNav";
import { ChapterRoadmapStatus, SectionProgress } from "../../components/ChapterRoadmapStatus";

export const metadata: Metadata = {
  title: "React Interview Handbook Roadmap",
  description:
    "A focused 48-chapter roadmap covering the React knowledge most important for frontend interviews.",
};

const parts = [
  {
    numeral: "I",
    title: "Rendering model",
    description: "Build the mental model behind rendering, identity, state, and updates.",
    chapters: [
      [
        1,
        "Render and commit phases",
        "How React calculates changes and applies them to the host environment.",
      ],
      [
        2,
        "What causes a component to render",
        "Initial renders, state updates, parent renders, context, and external stores.",
      ],
      [
        3,
        "Reconciliation and element identity",
        "How type, position, and identity influence reuse of component trees.",
      ],
      [
        4,
        "Keys and list rendering",
        "Stable identity, reordering, state preservation, and common key mistakes.",
      ],
      [
        5,
        "State as a snapshot",
        "Why each render sees a fixed state value and event handlers capture it.",
      ],
      [
        6,
        "State preservation and reset",
        "How tree position preserves state and how to reset it intentionally.",
      ],
      [
        7,
        "Batching and functional updates",
        "Queued updates, automatic batching, updater functions, and update order.",
      ],
    ],
  },
  {
    numeral: "II",
    title: "State and Hooks",
    description: "Model application state and synchronize React with systems outside React.",
    chapters: [
      [
        8,
        "Choosing a state structure",
        "Grouping related values, avoiding contradictions, and normalizing state.",
      ],
      [
        9,
        "Derived and redundant state",
        "Calculate during rendering instead of synchronizing duplicate values.",
      ],
      [10, "Rules of Hooks", "Call-order identity, top-level calls, and why the rules exist."],
      [
        11,
        "Closures and state updates",
        "Captured values, stale closures, event handlers, and safe updates.",
      ],
      [
        12,
        "useEffect as synchronization",
        "Effects as a bridge to external systems rather than lifecycle callbacks.",
      ],
      [
        13,
        "Effect dependencies and cleanup",
        "Reactive dependencies, teardown, race conditions, and idempotence.",
      ],
      [
        14,
        "useRef and mutable values",
        "Persisting non-rendering values and interacting with DOM nodes.",
      ],
      [15, "useReducer", "Explicit transitions, complex state, actions, and reducer tradeoffs."],
      [
        16,
        "Designing custom Hooks",
        "Extracting reusable behavior without hiding ownership or data flow.",
      ],
    ],
  },
  {
    numeral: "III",
    title: "Component design",
    description:
      "Create accessible component APIs with clear ownership and composition boundaries.",
    chapters: [
      [
        17,
        "State ownership and lifting state",
        "Finding the closest common owner and preserving a single source of truth.",
      ],
      [
        18,
        "Controlled and uncontrolled components",
        "External control, local ownership, defaults, and reset behavior.",
      ],
      [
        19,
        "Composition over configuration",
        "Children, slots, render APIs, and avoiding boolean-prop explosions.",
      ],
      [
        20,
        "Designing reusable component APIs",
        "Constraints, defaults, escape hatches, and semantic contracts.",
      ],
      [
        21,
        "Compound and headless components",
        "Shared state, flexible markup, and accessible behavior primitives.",
      ],
      [
        22,
        "Context and provider design",
        "Provider boundaries, stable values, defaults, and dependency visibility.",
      ],
      [
        23,
        "Error boundaries",
        "Render failures, recovery boundaries, fallbacks, and their limitations.",
      ],
      [
        24,
        "Accessible interactive components",
        "Semantics, focus, keyboard behavior, announcements, and testing.",
      ],
    ],
  },
  {
    numeral: "IV",
    title: "Performance",
    description:
      "Measure React work first, then apply targeted optimizations with explicit tradeoffs.",
    chapters: [
      [
        25,
        "Diagnosing unnecessary renders",
        "Render causes, profiling, state placement, and measurement discipline.",
      ],
      [
        26,
        "Referential equality",
        "Object identity, dependency comparisons, props, and cascading work.",
      ],
      [
        27,
        "memo, useMemo, and useCallback",
        "What each tool caches, when it helps, and when it adds noise.",
      ],
      [
        28,
        "Context performance",
        "Consumer fan-out, provider splitting, selectors, and stable values.",
      ],
      [
        29,
        "Code splitting and lazy loading",
        "Route and component boundaries, Suspense fallbacks, and loading cost.",
      ],
      [
        30,
        "List virtualization",
        "Windowing large collections while preserving usability and accessibility.",
      ],
      [
        31,
        "Profiling React applications",
        "Profiler traces, render duration, commits, and validating improvements.",
      ],
      [
        32,
        "Transitions and deferred updates",
        "Urgent versus non-urgent work and keeping interactions responsive.",
      ],
    ],
  },
  {
    numeral: "V",
    title: "Modern React architecture",
    description:
      "Reason about rendering environments, data boundaries, and application-level choices.",
    chapters: [
      [
        33,
        "Client and server rendering",
        "Rendering locations, navigation behavior, tradeoffs, and hybrid applications.",
      ],
      [
        34,
        "Hydration",
        "Attaching behavior to server HTML, mismatches, cost, and selective hydration.",
      ],
      [
        35,
        "Server Components",
        "Server and client boundaries, serialization, composition, and data access.",
      ],
      [
        36,
        "Suspense and streaming",
        "Coordinated fallbacks, progressive delivery, and boundary placement.",
      ],
      [
        37,
        "Data-fetching architecture",
        "Ownership, waterfalls, caching, deduplication, and framework integration.",
      ],
      [
        38,
        "Mutations and optimistic updates",
        "Pending state, rollback, reconciliation, and failure handling.",
      ],
      [
        39,
        "Forms and actions",
        "Form state, validation, submissions, progressive enhancement, and actions.",
      ],
      [
        40,
        "Choosing state-management tools",
        "Local state, context, external stores, server state, and URL state.",
      ],
    ],
  },
  {
    numeral: "VI",
    title: "Testing and production behavior",
    description:
      "Verify user-visible behavior and build interfaces that remain resilient under failure.",
    chapters: [
      [
        41,
        "Testing user-observable behavior",
        "Queries, interactions, outcomes, and avoiding implementation coupling.",
      ],
      [
        42,
        "Unit, integration, and E2E boundaries",
        "Choosing the smallest test that provides meaningful confidence.",
      ],
      [
        43,
        "Testing asynchronous UI",
        "Waiting for outcomes, timers, requests, race conditions, and false confidence.",
      ],
      [
        44,
        "Strict Mode behavior",
        "Development checks, repeated setup and cleanup, and purity expectations.",
      ],
      [
        45,
        "Race conditions and cancellation",
        "Stale responses, Effect cleanup, AbortController, and request ownership.",
      ],
      [
        46,
        "Loading, empty, and error states",
        "Explicit async states, resilient transitions, and accessible feedback.",
      ],
      [
        47,
        "Debugging React applications",
        "Tracing renders, state changes, Effects, warnings, and minimal reproductions.",
      ],
      [
        48,
        "Production resilience",
        "Observability, recovery, defensive boundaries, and graceful degradation.",
      ],
    ],
  },
] as const;

const chapterCount = parts.reduce((total, part) => total + part.chapters.length, 0);

export default function ReactHandbookPage() {
  const availableByNumber = new Map(reactChapters.map((chapter) => [chapter.number, chapter]));

  return (
    <>
      <ReactNav active="handbook" />
      <main className="performance-roadmap-page">
        <section className="performance-roadmap-hero">
          <div>
            <span className="eyebrow">React · Interview handbook</span>
            <h1>Understand React well enough to explain it.</h1>
            <p>
              A focused roadmap for the rendering, state, Hooks, architecture, performance, and
              production concepts that matter most in frontend interviews.
            </p>
            <div className="wiki-actions">
              <a className="primary-action" href="#roadmap">
                Explore the roadmap <span aria-hidden="true">↓</span>
              </a>
              <Link className="secondary-action" href="/react/practice">
                Apply it in practice
              </Link>
            </div>
          </div>
          <div className="performance-roadmap-summary" aria-label="React handbook statistics">
            <div>
              <strong>{chapterCount}</strong>
              <span>planned chapters</span>
            </div>
            <div>
              <strong>{parts.length}</strong>
              <span>connected parts</span>
            </div>
            <div>
              <strong>0</strong>
              <span>practice scenarios</span>
            </div>
          </div>
        </section>

        <section className="performance-model" aria-labelledby="react-model-title">
          <div>
            <span className="eyebrow">Interview learning loop</span>
            <h2 id="react-model-title">Build a model, explain it, then apply it.</h2>
          </div>
          <ol aria-label="React interview preparation workflow">
            {[
              "Mental model",
              "Runtime behavior",
              "Code example",
              "Tradeoff",
              "Interview answer",
              "Practice",
            ].map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
        </section>

        <section className="performance-roadmap" id="roadmap" aria-labelledby="roadmap-title">
          <div className="wiki-section-heading">
            <span className="eyebrow">Six-part curriculum</span>
            <h2 id="roadmap-title">React knowledge without tutorial filler</h2>
            <p>
              Handbook chapters develop transferable mental models. Implementation scenarios stay in
              React Practice, where they can include requirements, hints, and complete solutions.
            </p>
            <SectionProgress
              itemSlugs={reactChapters.map((chapter) => `react-${chapter.slug}`)}
            />
          </div>

          <div className="performance-part-list">
            {parts.map((part) => (
              <section className="performance-part" key={part.numeral}>
                <header>
                  <span>Part {part.numeral}</span>
                  <div>
                    <h3>{part.title}</h3>
                    <p>{part.description}</p>
                  </div>
                  <small>{part.chapters.length} chapters</small>
                </header>
                <ol>
                  {part.chapters.map(([number, title, description]) => {
                    const chapter = availableByNumber.get(number);
                    const content = (
                      <>
                        <span>{String(number).padStart(2, "0")}</span>
                        <div>
                          <div className="performance-chapter-title">
                            <h4>{title}</h4>
                          </div>
                          <p>{description}</p>
                        </div>
                        {chapter ? (
                          <ChapterRoadmapStatus slug={`react-${chapter.slug}`} />
                        ) : (
                          <span className="performance-chapter-status">Draft planned</span>
                        )}
                      </>
                    );

                    return chapter ? (
                      <li className="available" key={number}>
                        <Link href={`/react/handbook/chapters/${chapter.slug}`}>{content}</Link>
                      </li>
                    ) : (
                      <li key={number}>{content}</li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
        </section>

        <section className="performance-roadmap-next">
          <div>
            <span className="eyebrow">Apply the concepts</span>
            <h2>Interview scenarios live in React Practice.</h2>
            <p>
              Use focused exercises to turn handbook concepts into accessible, production-minded
              React implementations.
            </p>
          </div>
          <Link href="/react/practice">Explore React Practice →</Link>
        </section>
      </main>
    </>
  );
}
