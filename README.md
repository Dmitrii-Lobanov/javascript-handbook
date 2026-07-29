# JavaScript Interview Handbook

**Mastering JavaScript Internals for Senior Frontend Engineers**

This handbook is a rigorous, interview-oriented reference for frontend engineers who already use JavaScript professionally. It focuses on runtime reasoning: explaining what the language guarantees, what hosts such as browsers provide, how engines commonly implement those guarantees, and how those distinctions affect React applications in production.

## Who this is for

- Mid-level frontend engineers preparing for senior roles
- Senior frontend engineers preparing for product-company interviews
- React engineers strengthening their JavaScript runtime knowledge
- Engineers preparing for senior- and staff-level technical discussions

Readers are expected to know modern JavaScript syntax, basic asynchronous programming, React fundamentals, and everyday frontend development.

## What makes it different

- Specification concepts are separated from engine, browser, Node.js, and React behavior.
- Each topic connects a formal model to runnable code and production debugging.
- Interview questions progress from definitions to tradeoffs and unfamiliar scenarios.
- React connections focus on real mechanisms such as render closures, identity, batching, and scheduling.
- Performance claims include measurement guidance and avoid treating engine heuristics as language guarantees.

## Contents

The book has nine parts:

1. Runtime Foundations
2. Values and Objects
3. Functions and Abstractions
4. Asynchronous JavaScript
5. Modules and Code Loading
6. Browser Runtime
7. Performance and Engine Behavior
8. React Connections
9. Interview Preparation

See the [complete table of contents](book/table-of-contents.md).

## How to read the handbook

For a systematic review, read Parts I–VIII in order and use Part IX for rehearsal. For targeted preparation, begin with a chapter's core mental model, test yourself with its interview questions and exercises, then return to the formal model and runtime walkthrough where your explanation breaks down.

The primary goal is not to memorize phrasing. Practice giving a direct definition, describing the runtime mechanism, connecting it to a consequence, and adding one important qualification.

## Repository layout

- `book/` contains the manuscript, editorial guidance, and chapter template.
- `exercises/questions/` and `exercises/solutions/` keep longer exercises separate from chapters.
- `examples/browser/`, `examples/node/`, and `examples/react/` contain runnable, environment-specific examples.
- `diagrams/` stores reusable diagram sources or exported assets when Markdown embedding is insufficient.
- `references/` records authoritative sources used for verification.
- `scripts/` is reserved for lightweight validation and publishing utilities.

Markdown is the source of truth so the manuscript can later feed PDF, EPUB, or documentation-site tooling without coupling the writing process to a publishing stack.

## Project status

The handbook is being written incrementally. The editorial foundation and Chapters 1–3 are complete; later chapters have not yet been drafted. Track chapter state and review gates in [PROGRESS.md](PROGRESS.md).
