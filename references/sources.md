# Authoritative Source Index

This index defines the preferred verification sources for the handbook. Individual chapters should link to the exact section or article they rely on; inclusion here is not evidence that a source has been consulted for every chapter.

## JavaScript language

- [ECMAScript Language Specification](https://tc39.es/ecma262/) — normative language semantics and terminology
- [TC39 proposals](https://github.com/tc39/proposals) — proposal status and links to draft specifications
- [MDN JavaScript reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference) — practical reference and compatibility context

## Browser platform

- [WHATWG HTML Standard](https://html.spec.whatwg.org/) — event loops, tasks, microtasks, and browser integration
- [WHATWG DOM Standard](https://dom.spec.whatwg.org/) — DOM trees, events, and dispatch
- [Fetch Standard](https://fetch.spec.whatwg.org/) — fetching, requests, responses, and cancellation integration
- [Web Performance Working Group specifications](https://www.w3.org/webperf/) — performance APIs and timing
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API) — browser API usage and compatibility context

## Engine implementation

- [V8 documentation](https://v8.dev/docs) — V8 architecture and diagnostics
- [V8 blog](https://v8.dev/blog) — implementation techniques and version-specific engine work

V8 material describes one engine unless the article explicitly establishes a broader guarantee.

## Node.js

- [Node.js documentation](https://nodejs.org/docs/latest/api/) — Node-specific APIs and runtime behavior
- [Node.js event loop guide](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) — event-loop phases and scheduling APIs

## React

- [React documentation](https://react.dev/) — current public React behavior and guidance
- [React source repository](https://github.com/facebook/react) — implementation investigation when public documentation is insufficient

React implementation details must be marked as such and associated with the examined version.

## Source-use checklist

Before publishing a technical claim:

1. Identify whether it belongs to the language, host, engine, or framework.
2. Prefer the normative specification or official documentation for that layer.
3. Check whether the behavior is version-dependent or implementation-specific.
4. Reproduce observable claims in the named environment when practical.
5. Paraphrase and cite the precise source near the relevant section.
