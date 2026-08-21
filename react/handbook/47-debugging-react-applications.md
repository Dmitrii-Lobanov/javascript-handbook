# Chapter 47 — Debugging React Applications

## Quick refresher

Debugging starts with reproduction, scope reduction, evidence collection, and a falsifiable hypothesis—not immediate code changes.

## Why this matters

React symptoms often originate from identity, ownership, stale closures, mutation, browser behavior, or external data rather than React itself.

## Core mental model

```text
reproduce → minimize → observe → hypothesize → test one change → verify
```

Read the first meaningful error and component stack. Use React DevTools to inspect props, state, context, owners, and render activity. Use the Profiler for timing and browser DevTools for network, console, DOM, accessibility, and main-thread evidence.

For unexpected state, trace who owns it and which event or Effect updates it. For unexpected remounts, inspect type, position, and keys. For loops, find an Effect that updates a dependency or an unstable dependency recreated each render. Build a minimal reproduction when framework or library interaction is unclear.

## Classify the symptom

| Symptom | First questions |
| --- | --- |
| State resets | Did type, position, or key change? Was the component remounted? |
| Stale value | Which render created the closure? Are dependencies correct? |
| Infinite loop | Which Effect updates one of its own dependencies? |
| Excess renders | Which state, prop, or context changed, and is the work expensive? |
| Hydration warning | How did server and first client output differ? |
| UI not updating | Was state mutated or set to an `Object.is`-equal value? |

Classification narrows the search faster than adding logs everywhere.

## Trace data ownership

Follow the value from source to display:

```text
event or external source → state owner → derived value
                         → props/context → rendered output
```

At each edge, inspect identity, timing, and whether another source of truth exists. Many React bugs are ordinary data-flow bugs made confusing by duplicated state or Effects.

## Use the right tool

- React Components panel: props, state, context, owners, and rendered tree;
- React Profiler: commit timing and render causes;
- browser Network panel: request order, payloads, cancellation, and cache;
- Performance panel: long tasks, layout, paint, and event timing;
- accessibility tree: role, name, state, and focus behavior;
- source maps and error monitoring: production stack reconstruction.

## Verify the fix

Reproduce the original failure, check adjacent cases, remove diagnostic changes, and add a regression test at the lowest realistic boundary. A disappearing symptom without an explained mechanism is not a reliable fix.

## Common traps

- Changing multiple things before testing the hypothesis.
- Debugging minified symptoms without source maps or context.
- Treating logs during render as committed UI.
- Silencing warnings instead of finding the violated invariant.

## Interview answer

I make the failure reproducible, reduce it to the smallest responsible boundary, and collect evidence with React and browser tools. I trace ownership, identity, update sources, and Effect dependencies, then test one falsifiable hypothesis. Finally I verify the original user scenario and add a regression test at the appropriate boundary.

## Follow-up questions

### Why can a render log be misleading?

React may evaluate a render that never commits, and development checks may evaluate it again. A render log proves calculation, not visible DOM change.

### How do you debug an infinite Effect loop?

Identify the state update inside the Effect, then determine which dependency that update changes. Remove unnecessary synchronization or stabilize the actual external-resource inputs.

### What makes a minimal reproduction valuable?

It removes unrelated variables, clarifies ownership, and shows whether the failure belongs to application code, React, the framework, or another library.

## Check yourself

1. Which identity questions would you ask when a child’s state resets unexpectedly?
2. How would you distinguish a render from a commit?
3. Which tool would expose an out-of-order request?
4. What hypothesis would you test for a stale callback?
5. Where should a regression test be placed after fixing the issue?
