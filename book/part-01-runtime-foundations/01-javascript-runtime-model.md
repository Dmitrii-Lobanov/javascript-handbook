# Chapter 1 — JavaScript Runtime Model

**Status:** Outlined

## Chapter purpose

Establish the boundaries that make later explanations precise: ECMAScript defines a language and abstract execution semantics; a JavaScript engine implements them; a host environment supplies APIs and coordinates execution; frameworks such as React add their own scheduling and lifecycle semantics.

## Learning objectives

After completing this chapter, the reader should be able to:

- distinguish ECMAScript, engine, host, and framework responsibilities;
- explain why “JavaScript runtime” can mean different systems in a browser and Node.js;
- trace a small browser program from source evaluation through Web API callbacks and ECMAScript jobs;
- identify which parts of a common event-loop explanation are language guarantees and which are host behavior;
- connect main-thread work and scheduling constraints to React responsiveness;
- choose the appropriate specification, documentation, or diagnostic tool for a runtime question.

## Planned argument

### Why This Matters

Interview questions about the event loop, promises, rendering, modules, and React scheduling often expose a more basic weakness: mixing responsibilities from different layers into one vague “JavaScript runtime.” The chapter will show how correct layer boundaries improve predictions and debugging.

### Core Mental Model

Use a layered model:

1. ECMAScript defines language semantics and abstract machinery.
2. The engine realizes those semantics and applies implementation-specific optimizations.
3. The host embeds the engine, exposes capabilities, and schedules integration with the outside world.
4. Frameworks execute within those constraints and introduce higher-level policies.

The model will explicitly note that real implementations integrate these layers more closely than the conceptual boundaries imply.

### Formal Model

Introduce only the terms needed to support later chapters: agent, realm, execution context, job, job queue, host hook, and host-defined facility. Defer detailed execution-context stacks to Chapter 2 and browser event-loop algorithms to Chapters 25–26.

### Step-by-Step Runtime Walkthrough

Plan one browser example containing synchronous evaluation, a resolved promise reaction, a timer, and a rendering-relevant DOM update. Trace which layer creates, schedules, and executes each operation without presenting the browser event loop as part of ECMAScript.

### Visual Model

Create a compact Mermaid diagram showing source code flowing through the engine while browser APIs, task queues, microtasks, rendering, and React remain correctly labeled by layer.

### Progressive Examples

- **Foundational:** pure ECMAScript evaluation with a function call and a promise reaction.
- **Production-oriented:** a browser event handler that performs expensive synchronous work before a UI update can appear.
- **Interview edge case:** compare scheduling vocabulary and observable ordering across browser and Node.js environments.

### Common Misconceptions

Address at least these claims:

- “The event loop is part of JavaScript.”
- “JavaScript is single-threaded” is a complete runtime description.
- “Web APIs run inside the JavaScript engine.”
- “Promises are browser APIs.”
- “React concurrent rendering makes JavaScript execute component code in parallel.”

### React Connection

Connect host scheduling and main-thread availability to React render work, event handlers, effects, and cooperative scheduling. Avoid duplicating the dedicated React scheduling chapters.

### Performance and Memory Implications

Explain why runtime-layer identification precedes useful profiling: CPU execution, browser rendering, network waits, garbage collection, and React render work require different evidence. Keep engine optimization details for Part VII.

### Debugging Techniques

Plan a short investigation using DevTools Performance traces and async stack traces. Teach the reader to classify trace evidence by engine, browser, and application/framework responsibility.

### Interview Questions

Build four levels around layer identification, observable scheduling, browser-versus-Node qualifications, and diagnosis of an unresponsive React interaction.

### Exercises

Include a responsibility-classification exercise, one output prediction, one flawed event-loop explanation to correct, and one React responsiveness diagnosis.

### Chapter Summary

End with a 30–45 second interview-ready explanation of the layered runtime model and the limits of the phrase “single-threaded.”

## Scope boundaries

This chapter establishes vocabulary and system boundaries. It will not fully teach execution contexts, event-loop algorithms, garbage collection, browser rendering phases, Node.js phases, or React concurrent rendering; later chapters own those details.

## Planned primary references

- ECMA-262 sections on agents, realms, execution contexts, and jobs
- WHATWG HTML sections on event loops and event-loop processing
- Node.js documentation on the event loop
- React documentation on rendering and state updates
- V8 documentation for clearly labeled implementation context
