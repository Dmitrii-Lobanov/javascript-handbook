# Part I Summary — Runtime Foundations

This chapter is a compact interview-ready review of the runtime foundations in Part I.
It is designed to be sufficient for a quick prep before a senior frontend discussion.

## Core runtime model

- A JavaScript runtime is ECMAScript + engine + host.
- ECMAScript defines observable language semantics, jobs, execution contexts, and scope.
- The engine implements and optimizes ECMAScript, but it does not own browser APIs.
- The host supplies globals, scheduling, rendering, and environment-specific APIs.
- Frameworks like React add scheduling policy, not a new JavaScript runtime.

## What matters most

- In a browser agent, one callback runs to completion.
- After a task ends, the browser drains microtasks, may render, and then selects another task.
- Promise reactions and `queueMicrotask` callbacks are microtasks.
- Timer callbacks, event dispatch, and user input handlers arrive as later tasks.
- A DOM mutation updates state; paint waits for a rendering opportunity.
- `async` / `await` and `Promise` do not make CPU work run in parallel.
- React transitions change update priority, not where the work executes.

## Layer distinctions

- **ECMAScript:** `Promise`, `Array`, `globalThis`, language semantics, jobs, execution contexts, realms.
- **Host (browser):** `document`, timers, fetch, event loops, rendering, microtasks/tasks scheduling.
- **Host (Node):** `process.nextTick`, event-loop phases, filesystem, `setImmediate`.
- **Engine:** V8, SpiderMonkey, JavaScriptCore, garbage collection, inline caching, hidden classes.
- **Framework:** React render/commit phases, batching, transitions, hooks, component scheduling.

## Execution and scope

- A function call normally creates a fresh execution context and invocation-specific bindings in associated environments.
- The call stack is LIFO for synchronous calls; returns and throws unwind it.
- Lexical scope follows where code is defined, not where it is called.
- Identifier lookup walks lexical environment links to the nearest binding.
- The temporal dead zone applies to uninitialized `let`, `const`, and `class` bindings.

## Closures and React callbacks

- Closures retain the environment where they were created.
- Captured bindings remain reachable until no live roots refer to them.
- In React, each render creates new bindings; a callback retains the snapshot from its render.
- Stale callback behavior means the callback is using a previous render’s environment.

## `this` and invocation form

- Ordinary function `this` depends on call form:
  - method call: receiver is base object,
  - plain call: `undefined` in strict mode,
  - `.call`/`.apply` override it,
  - `.bind` creates a bound function,
  - `new` creates a receiver.
- Arrow functions use lexical `this` and cannot be rebound.

## Memory and GC

- Garbage collection is based on reachability from roots.
- A leak is unwanted retention; removing one reference does not prove collectability.
- Cycles can be collected when no roots reach them.
- Weak collections do not strongly retain their object keys and are not a general cache solution.
- React effects should clean up subscriptions, listeners, and external registrations.

## Interview-ready checklist

- Did I name the layer owning the behavior?
- Did I qualify the environment: browser or Node.js?
- Did I separate ECMAScript scheduling from host scheduling?
- Did I distinguish DOM updates from paint?
- Did I explain `async` / `Promise` / React transitions without implying parallelism?
- Did I avoid conflating lexical scope with the call stack?

## Short answers for common topics

**What is a JavaScript runtime?**
A runtime is ECMAScript plus an engine plus a host. The host adds APIs and scheduling that ECMAScript does not define.

**Why does `.then` run later?**
Promise resolution schedules a job, and in browsers that job becomes a microtask. Microtasks run after the current task finishes.

**Why might a spinner never appear?**
A long-running handler blocks the main thread, so the browser cannot paint the DOM update until after the handler returns.

**Does React `startTransition` make work parallel?**
No. It lowers the update priority and defers rendering, but the JavaScript still runs on the same main thread.

**What is the difference between lexical scope and the call stack?**
Lexical scope is determined by where code is written; the call stack is determined by the order of function invocation.

**What is an execution context?**
It is specification state for one active or suspended evaluation. It is related to, but not identical to, a physical engine stack frame or a lexical environment.

**What does a closure retain?**
A closure retains access to bindings through the lexical environment where its function was created. The creating call can leave the stack while those bindings remain reachable.

**How is `this` selected?**
For an ordinary function, start with the invocation form: method, plain, explicit, bound, or constructor call. Arrow functions instead read `this` lexically.

**When can an object be garbage-collected?**
It becomes eligible when no strong path from a runtime or host root reaches it. Eligibility does not guarantee immediate collection.
