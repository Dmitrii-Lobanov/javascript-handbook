import type { Metadata } from "next";
import Link from "next/link";
import { TrackNav } from "../../components/TechnologyNav";
import { getTrack } from "../../lib/tracks";

export const metadata: Metadata = {
  title: "Performance Handbook Roadmap",
  description:
    "A 22-chapter roadmap for understanding, measuring, diagnosing, and improving frontend performance.",
};

const parts = [
  {
    numeral: "I",
    title: "Performance reasoning",
    description: "Learn what to measure, how to reason from evidence, and how to define success.",
    chapters: [
      [1, "What frontend performance means", "User experience, perceived speed, latency, throughput, and meaningful outcomes."],
      [2, "Measurement methodology", "Field and lab data, reproducible baselines, percentiles, and experimental discipline."],
      [3, "Metrics and performance budgets", "Core Web Vitals, diagnostic metrics, budgets, and the limits of aggregate scores."],
    ],
  },
  {
    numeral: "II",
    title: "Loading performance",
    description: "Follow a navigation from the first request to meaningful content on screen.",
    chapters: [
      [4, "Navigation and network latency", "DNS, connections, TLS, redirects, server response time, CDNs, compression, and caching."],
      [5, "The critical rendering path", "HTML parsing, DOM, CSSOM, render blocking, parser blocking, and progressive rendering."],
      [6, "Resource discovery and priority", "Preload scanning, request initiators, hints, priorities, waterfalls, and resource competition."],
      [7, "JavaScript delivery", "Bundles, parsing, compilation, code splitting, duplicate code, hydration, and third parties."],
      [8, "Images, fonts, and media", "Responsive assets, formats, LCP discovery, font loading, dimensions, and stability."],
    ],
  },
  {
    numeral: "III",
    title: "Runtime performance",
    description: "Understand how application work becomes pixels and responsive interactions.",
    chapters: [
      [9, "The browser rendering pipeline", "Style, layout, paint, rasterization, compositing, invalidation, and layout thrashing."],
      [10, "The main thread and event loop", "Tasks, microtasks, rendering opportunities, long tasks, yielding, and workers."],
      [11, "Interaction responsiveness and INP", "Input delay, processing time, presentation delay, and responsive feedback."],
      [12, "Animation and scrolling", "Frame budgets, requestAnimationFrame, compositor work, observers, and reduced motion."],
    ],
  },
  {
    numeral: "IV",
    title: "Application architecture",
    description: "Connect architectural choices to loading, interaction, and maintenance costs.",
    chapters: [
      [13, "Rendering architecture", "Client rendering, SSR, static generation, streaming, hydration, islands, and Server Components."],
      [14, "React performance", "Render and commit cost, state ownership, memoization, Compiler, transitions, and profiling."],
      [15, "Data loading and caching", "Parallel loading, deduplication, prefetching, cache layers, freshness, and invalidation."],
      [16, "Large collections and data-heavy interfaces", "DOM size, pagination, virtualization, incremental rendering, and accessibility."],
    ],
  },
  {
    numeral: "V",
    title: "Stability and memory",
    description: "Keep interfaces visually stable and healthy across long-running sessions.",
    chapters: [
      [17, "Visual stability", "Layout-shift sources, session windows, fonts, media, embeds, and post-load movement."],
      [18, "Memory and lifecycle", "Reachability, detached DOM, listeners, observers, subscriptions, caches, and heap analysis."],
    ],
  },
  {
    numeral: "VI",
    title: "Performance as engineering practice",
    description: "Turn individual optimizations into a sustainable team capability.",
    chapters: [
      [19, "Performance tooling", "DevTools, Lighthouse, React profiling, bundle analysis, coverage, and choosing the right tool."],
      [20, "Real-user monitoring", "Web Vitals collection, attribution, segmentation, sampling, alerting, and release comparison."],
      [21, "Budgets and continuous delivery", "Automated checks, regression thresholds, journey tests, ownership, and escalation."],
      [22, "Tradeoffs and communication", "Prioritization, experiment design, proposals, stakeholder communication, and metric gaming."],
    ],
  },
] as const;

const firstRelease = new Set([1, 2, 3, 5, 7, 9, 10, 14]);

export default function PerformanceHandbookPage() {
  const track = getTrack("performance")!;

  return (
    <>
      <TrackNav track={track} active="handbook" />
      <main className="performance-roadmap-page">
        <section className="performance-roadmap-hero">
          <div>
            <span className="eyebrow">Performance · Handbook roadmap</span>
            <h1>Understand where frontend time goes.</h1>
            <p>
              Build one connected mental model—from navigation and browser rendering to React,
              memory, measurement, and sustainable performance practice.
            </p>
            <div className="wiki-actions">
              <a className="primary-action" href="#roadmap">Explore the roadmap <span aria-hidden="true">↓</span></a>
              <Link className="secondary-action" href="/performance/investigations">Open investigations</Link>
            </div>
          </div>
          <div className="performance-roadmap-summary" aria-label="Performance handbook statistics">
            <div><strong>22</strong><span>chapters planned</span></div>
            <div><strong>6</strong><span>connected parts</span></div>
            <div><strong>8</strong><span>first-release chapters</span></div>
          </div>
        </section>

        <section className="performance-model" aria-labelledby="performance-model-title">
          <div>
            <span className="eyebrow">The working model</span>
            <h2 id="performance-model-title">Reason from experience to evidence.</h2>
          </div>
          <ol aria-label="Performance improvement workflow">
            {[
              "User experience",
              "Metric",
              "Browser timeline",
              "Responsible work",
              "Targeted change",
              "Verified result",
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
            <h2 id="roadmap-title">From first principles to engineering practice</h2>
            <p>
              Priority chapters establish the first useful release. Every chapter will connect its
              model to measurements, interview questions, exercises, and practical investigations.
            </p>
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
                  {part.chapters.map(([number, title, description]) => (
                    <li key={number} className={firstRelease.has(number) ? "priority" : ""}>
                      <span>{String(number).padStart(2, "0")}</span>
                      <div>
                        <div className="performance-chapter-title">
                          <h4>{title}</h4>
                          {firstRelease.has(number) && <small>First release</small>}
                        </div>
                        <p>{description}</p>
                      </div>
                      <span className="performance-chapter-status">Planned</span>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </section>

        <section className="performance-roadmap-next">
          <div>
            <span className="eyebrow">Learn by diagnosing</span>
            <h2>Turn each mental model into an investigation.</h2>
            <p>
              Use the companion lab to trace slow loading, delayed interactions, excessive React
              work, layout instability, and memory growth.
            </p>
          </div>
          <Link href="/performance/investigations">Explore performance investigations →</Link>
        </section>
      </main>
    </>
  );
}
