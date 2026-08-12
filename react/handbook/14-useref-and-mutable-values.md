# Chapter 14 — useRef and Mutable Values

## Quick refresher

A ref is a stable object whose `.current` value persists between renders. Changing it does not trigger a render.

## Why this matters

Refs are the correct escape hatch for DOM nodes and mutable values that participate in behavior but not in the rendered output.

## Core mental model

Use state for information that affects rendering. Use a ref for information React does not need to display:

```tsx
function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
    </>
  );
}
```

Refs also store timer IDs, previous integration instances, or mutable values required by external callbacks:

```tsx
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

Do not read or write refs during render except for predictable initialization patterns. Render must remain pure, and ref mutations are invisible to React. DOM access belongs in event handlers or Effects; layout measurement that must happen before paint typically belongs in `useLayoutEffect`.

Passing refs through component boundaries is part of API design. Expose the smallest imperative surface necessary rather than leaking an entire internal DOM structure.

## Common traps

- Storing visible UI state in a ref and wondering why the UI does not update.
- Using a ref to avoid correct Effect dependencies.
- Mutating or reading DOM nodes during render.
- Exposing more imperative methods than consumers require.

## Interview answer

`useRef` returns a stable mutable container that survives renders without scheduling new ones. I use it for DOM access and non-rendering values such as timer handles or external instances. If a value affects what the component displays, it belongs in state instead. Refs are an escape hatch, not an alternative state system.

## Check yourself

Should the current search query live in state or a ref, and why?
