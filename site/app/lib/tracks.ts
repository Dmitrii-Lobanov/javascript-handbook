export type TrackStatus = "available" | "expanding" | "planned";

export type TrackResource = {
  slug: string;
  label: string;
  title: string;
  description: string;
  available?: boolean;
};

export type LearningTrack = {
  slug: string;
  mark: string;
  title: string;
  shortTitle?: string;
  description: string;
  status: TrackStatus;
  phase: 1 | 2 | 3;
  resources: TrackResource[];
};

export const learningTracks: LearningTrack[] = [
  {
    slug: "javascript",
    mark: "JS",
    title: "JavaScript",
    description: "Runtime internals, language semantics, browser behavior, and performance.",
    status: "available",
    phase: 1,
    resources: [
      { slug: "handbook", label: "Handbook", title: "JavaScript Handbook", description: "Connected chapters from runtime foundations to senior-level reasoning.", available: true },
      { slug: "q-and-a", label: "Q&A", title: "JavaScript Questions & Answers", description: "Concise explanations with deeper technical follow-ups.", available: true },
      { slug: "practice", label: "Practice", title: "JavaScript Practice", description: "Output prediction, debugging, and implementation exercises." },
    ],
  },
  {
    slug: "typescript",
    mark: "TS",
    title: "TypeScript",
    description: "Type modeling, inference, narrowing, generics, and maintainable API design.",
    status: "planned",
    phase: 1,
    resources: [
      { slug: "handbook", label: "Handbook", title: "TypeScript Handbook", description: "Learn TypeScript as a reasoning and API-design tool." },
      { slug: "q-and-a", label: "Q&A", title: "TypeScript Questions & Answers", description: "Practice explaining the type system clearly." },
      { slug: "practice", label: "Practice", title: "TypeScript Practice", description: "Model real application states and reusable APIs." },
    ],
  },
  {
    slug: "react",
    mark: "RE",
    title: "React",
    description: "Rendering, state, Effects, concurrency, server architecture, and component design.",
    status: "expanding",
    phase: 1,
    resources: [
      { slug: "handbook", label: "Handbook", title: "React Handbook", description: "Mental models, runtime behavior, and architectural tradeoffs." },
      { slug: "q-and-a", label: "Q&A", title: "React Questions & Answers", description: "120 curated questions from fundamentals to senior scenarios.", available: true },
      { slug: "practice", label: "Practice", title: "React Practice", description: "Debugging, performance, accessibility, and design exercises." },
    ],
  },
  {
    slug: "data-structures-algorithms",
    mark: "DS",
    title: "Data Structures & Algorithms",
    shortTitle: "DSA",
    description: "Core structures, reusable problem patterns, and popular interview tasks.",
    status: "planned",
    phase: 1,
    resources: [
      { slug: "foundations", label: "Foundations", title: "DSA Foundations", description: "Complexity, arrays, lists, trees, graphs, sorting, and searching." },
      { slug: "problem-patterns", label: "Patterns", title: "Problem Patterns", description: "Two pointers, sliding windows, traversal, heaps, and dynamic programming." },
      { slug: "interview-tasks", label: "Practice", title: "Interview Tasks", description: "Solve common tasks with hints, tests, and follow-ups." },
    ],
  },
  {
    slug: "browser-web-platform",
    mark: "BR",
    title: "Browser & Web Platform",
    shortTitle: "Browser",
    description: "Rendering, events, networking, storage, workers, and browser debugging.",
    status: "planned",
    phase: 2,
    resources: [
      { slug: "handbook", label: "Handbook", title: "Browser Handbook", description: "Understand the runtime beneath frontend frameworks." },
      { slug: "q-and-a", label: "Q&A", title: "Browser Questions & Answers", description: "Explain platform behavior under interview pressure." },
      { slug: "debugging-labs", label: "Labs", title: "Debugging Labs", description: "Investigate rendering, networking, and memory failures." },
    ],
  },
  {
    slug: "frontend-system-design",
    mark: "SD",
    title: "Frontend System Design",
    shortTitle: "System Design",
    description: "Requirements, boundaries, state, resilience, scalability, and tradeoffs.",
    status: "planned",
    phase: 2,
    resources: [
      { slug: "foundations", label: "Foundations", title: "System Design Foundations", description: "A repeatable framework for ambiguous frontend problems." },
      { slug: "case-studies", label: "Case Studies", title: "Architecture Case Studies", description: "Design feeds, dashboards, editors, uploads, and design systems." },
      { slug: "interview-practice", label: "Practice", title: "System Design Practice", description: "Work through requirements and defend engineering tradeoffs." },
    ],
  },
  {
    slug: "html-css-accessibility",
    mark: "UI",
    title: "HTML, CSS & Accessibility",
    shortTitle: "UI Platform",
    description: "Semantic, resilient, responsive, and accessible interface engineering.",
    status: "planned",
    phase: 2,
    resources: [
      { slug: "handbook", label: "Handbook", title: "UI Platform Handbook", description: "Semantics, layout, responsive design, focus, and accessibility." },
      { slug: "q-and-a", label: "Q&A", title: "UI Platform Questions & Answers", description: "Practice explaining browser-native UI behavior." },
      { slug: "ui-challenges", label: "Practice", title: "UI Challenges", description: "Build robust, accessible components from practical briefs." },
    ],
  },
  {
    slug: "testing",
    mark: "TE",
    title: "Testing",
    description: "Useful test boundaries, async UI, accessibility, and reliable test architecture.",
    status: "planned",
    phase: 2,
    resources: [
      { slug: "handbook", label: "Handbook", title: "Testing Handbook", description: "Learn what each test level proves and where it belongs." },
      { slug: "q-and-a", label: "Q&A", title: "Testing Questions & Answers", description: "Discuss mocking, integration, flakiness, and maintainability." },
      { slug: "exercises", label: "Practice", title: "Testing Exercises", description: "Repair brittle tests and design coverage for real features." },
    ],
  },
  {
    slug: "nextjs",
    mark: "NX",
    title: "Next.js",
    description: "A build-along roadmap from routing and rendering to secure deployment.",
    status: "planned",
    phase: 3,
    resources: [
      { slug: "application-roadmap", label: "Roadmap", title: "Next.js Application Roadmap", description: "Build one production-oriented application progressively." },
      { slug: "q-and-a", label: "Q&A", title: "Next.js Questions & Answers", description: "Reason about execution, caching, and framework tradeoffs." },
      { slug: "production-checklist", label: "Checklist", title: "Production Checklist", description: "Review security, accessibility, performance, and operations." },
    ],
  },
  {
    slug: "performance",
    mark: "PF",
    title: "Performance",
    description: "Measurement-led work across loading, rendering, interaction, and memory.",
    status: "expanding",
    phase: 3,
    resources: [
      { slug: "handbook", label: "Handbook", title: "Performance Handbook", description: "Connect metrics and profiles to user-visible outcomes.", available: true },
      { slug: "investigations", label: "Investigations", title: "Performance Investigations", description: "Diagnose network, main-thread, rendering, and memory bottlenecks." },
      { slug: "exercises", label: "Practice", title: "Optimization Exercises", description: "Apply targeted improvements and verify their impact." },
    ],
  },
  {
    slug: "web-security",
    mark: "SE",
    title: "Web Security",
    description: "Browser threats, authentication, authorization, and secure implementation habits.",
    status: "planned",
    phase: 3,
    resources: [
      { slug: "handbook", label: "Handbook", title: "Web Security Handbook", description: "Build a practical frontend threat model." },
      { slug: "threat-scenarios", label: "Scenarios", title: "Threat Scenarios", description: "Identify vulnerabilities in realistic application flows." },
      { slug: "exercises", label: "Practice", title: "Secure Implementation Exercises", description: "Repair unsafe boundaries and validate protections." },
    ],
  },
  {
    slug: "graphql",
    mark: "GQ",
    title: "GraphQL",
    description: "Schema design, client caching, evolution, reliability, and API tradeoffs.",
    status: "planned",
    phase: 3,
    resources: [
      { slug: "application-roadmap", label: "Roadmap", title: "GraphQL Application Roadmap", description: "Grow a maintainable schema alongside a real application." },
      { slug: "q-and-a", label: "Q&A", title: "GraphQL Questions & Answers", description: "Explain execution, caching, errors, and schema decisions." },
      { slug: "schema-exercises", label: "Practice", title: "Schema Design Exercises", description: "Model APIs and evolve them without breaking clients." },
    ],
  },
];

export function getTrack(slug: string) {
  return learningTracks.find((track) => track.slug === slug);
}
