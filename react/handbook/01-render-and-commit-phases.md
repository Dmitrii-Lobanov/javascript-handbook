# Chapter 1 — Render and Commit Phases

## Quick refresher

- **Render** calculates what the UI should look like. React calls components and compares the resulting element trees.
- **Commit** applies the necessary changes to the DOM and runs commit-related work.
- Rendering should be pure: the same inputs should produce the same output without side effects.
- A render can be paused, restarted, or discarded; a commit is the visible mutation.

## Why this matters

Interviewers use this topic to check whether you distinguish “React called my component” from “the DOM changed.” A component may render while React ultimately commits little or nothing.

## Core mental model

```text
update → render tree → reconcile → commit DOM changes → browser paints
```

During render, React calls components and builds the next description of the UI. Reconciliation matches it against the previous tree. During commit, React performs mutations, updates refs, and runs layout Effects. The browser can then paint; regular Effects generally run afterward.

```tsx
function Price({ value }: { value: number }) {
  // Runs during render. Do not mutate the DOM or start requests here.
  const formatted = new Intl.NumberFormat("en-US").format(value);
  return <span>{formatted}</span>;
}
```

Render-phase code must tolerate repeated execution. Side effects belong in event handlers when caused by an interaction, or in Effects when synchronizing with an external system.

## Common traps

- Treating every render as a DOM update.
- Starting network requests or mutating shared state during render.
- Assuming Effects run as part of rendering.
- Using an Effect to calculate data that could be derived during render.

## Interview answer

React first renders by calling components to calculate the next UI tree. It then reconciles that tree with the previous one. In the commit phase React applies the required host changes, updates refs, and runs layout Effects. Because rendering may be repeated or abandoned, it must stay pure. A render does not necessarily mean that React changed the DOM.

## Check yourself

Why can logging inside a component show multiple renders even when the visible DOM appears unchanged?
