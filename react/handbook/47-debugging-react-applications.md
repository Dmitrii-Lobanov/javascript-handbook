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

## Common traps

- Changing multiple things before testing the hypothesis.
- Debugging minified symptoms without source maps or context.
- Treating logs during render as committed UI.
- Silencing warnings instead of finding the violated invariant.

## Interview answer

I make the failure reproducible, reduce it to the smallest responsible boundary, and collect evidence with React and browser tools. I trace ownership, identity, update sources, and Effect dependencies, then test one falsifiable hypothesis. Finally I verify the original user scenario and add a regression test at the appropriate boundary.

## Check yourself

Which identity questions would you ask when a child’s state resets unexpectedly?
