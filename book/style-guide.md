# Editorial Style Guide

## Audience and purpose

Write for experienced frontend engineers preparing to reason aloud in senior interviews and debug production systems. Assume fluency with modern JavaScript and React. Explain basic syntax only when it exposes a deeper runtime mechanism.

## Voice

- Be precise, direct, and professional.
- Prefer cohesive explanations over slogans, trivia, or motivational framing.
- Use a mental model to aid recall, then state the formal mechanism and the model's limits.
- Write model answers so they sound natural when spoken, not recited from a specification.
- Use “always,” “never,” and “guarantees” only when the relevant standard supports them.

## Technical boundaries

Label the layer responsible for a behavior:

- **ECMAScript:** language types, execution contexts, environments, objects, jobs, and abstract operations.
- **Engine implementation:** representation and optimization strategies such as shapes, inline caches, and garbage-collector design.
- **Browser host:** event-loop integration, DOM, rendering, timers, networking, and Web APIs.
- **Node.js host:** event-loop phases, CommonJS, process APIs, and Node-specific scheduling.
- **React:** render semantics, state management, batching, effects, and scheduling policy.

Do not use one layer to explain guarantees made by another. Mark version-sensitive or implementation-specific claims and verify them against an authoritative source.

## Explanatory pattern

Prefer this progression:

1. State why the mechanism matters.
2. Give the minimal mental model.
3. Define the formal terms that improve precision.
4. Trace observable behavior step by step.
5. Apply the model to production and React.
6. Test transfer with unfamiliar interview questions.

## Code and output

- Use JavaScript for runtime concepts; use TypeScript only when types improve the scenario.
- Keep examples runnable unless they are explicitly marked as pseudocode.
- Demonstrate one primary idea per example and remove irrelevant setup.
- Name the execution environment when output depends on it.
- For prediction exercises, ask for a prediction before displaying output or analysis.
- Explain surprising results and plausible wrong answers.
- Avoid deprecated APIs except in explicitly historical or migration-focused material.

## Performance claims

- Separate theoretical complexity from measured runtime behavior.
- Do not turn V8 implementation observations into JavaScript guarantees.
- State benchmark conditions and warn when a microbenchmark may not predict application behavior.
- Prefer profiling evidence before optimization advice.
- Describe retained-reference paths rather than saying that a construct “causes memory leaks.”

## Interviews and exercises

Strong model answers normally contain a definition, runtime mechanism, practical consequence, concise example, and meaningful qualification. Deep questions should test model transfer, debugging, tradeoffs, and boundary awareness—not obscure recall.

## References

Use primary sources first: ECMA-262, WHATWG specifications, MDN, official V8 material, Node.js documentation, and React documentation. Paraphrase independently. Record consulted sources in the chapter and maintain the central source index.
