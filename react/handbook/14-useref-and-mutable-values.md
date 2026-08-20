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

## State versus ref

Use this test:

| Question | State | Ref |
| --- | --- | --- |
| Should changing it update visible UI? | Yes | No |
| Must it persist between renders? | Yes | Yes |
| Does React observe mutations? | Through setter | No |
| Safe for DOM nodes or timer handles? | Usually no | Yes |

Examples that belong in refs include an interval ID, an `AbortController`, an observer instance, and the last pointer position used only by an external callback.

## Refs and event handlers

DOM operations caused directly by an interaction can happen in the handler:

```tsx
function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);

  function clearAndFocus() {
    inputRef.current?.focus();
  }

  return <button onClick={clearAndFocus}>Focus search</button>;
}
```

An Effect is not required merely because a DOM node is involved.

## Refs and commit timing

React assigns DOM refs during commit and clears them when nodes are removed. Do not read `ref.current` during initial render and expect a DOM node—it does not exist yet.

Use a layout Effect when measurement must influence the frame before paint, and a passive Effect for ordinary third-party setup that can happen later.

## Predictable lazy initialization

Creating an expensive object as an argument runs the constructor on every render even though React keeps only the first ref value:

```tsx
const playerRef = useRef<VideoPlayer | null>(null);

if (playerRef.current === null) {
  playerRef.current = new VideoPlayer();
}
```

This render-time write is acceptable only because it is predictable, runs once for the component identity, and does not affect another object. External synchronization still belongs outside render.

## Exposing an imperative API

When a parent needs a command, expose a narrow handle:

```tsx
type EditorHandle = {
  focus: () => void;
  reset: () => void;
};
```

`useImperativeHandle` can map an internal DOM structure to that small capability. Prefer declarative props and callbacks for ordinary data flow.

## Common traps

- Storing visible UI state in a ref and wondering why the UI does not update.
- Using a ref to avoid correct Effect dependencies.
- Mutating or reading DOM nodes during render.
- Exposing more imperative methods than consumers require.

## Interview answer

`useRef` returns a stable mutable container that survives renders without scheduling new ones. I use it for DOM access and non-rendering values such as timer handles or external instances. If a value affects what the component displays, it belongs in state instead. Refs are an escape hatch, not an alternative state system.

## Follow-up questions

### Why does changing a ref not render?

React does not track `.current` mutations. The ref is intentionally an imperative mutable container.

### When should a DOM ref be read?

After commit—in an event handler, Effect, or layout Effect—not while rendering the node that will receive it.

### Is a ref a solution for frequently changing visible data?

No. Visible data belongs in state; a ref mutation would leave rendered output stale.

## Check yourself

1. Should a visible search query live in state or a ref?
2. Why does mutating `ref.current` not update the screen?
3. When can DOM access happen directly in an event handler?
4. Why is predictable lazy ref initialization a special case?
5. What should a component expose through an imperative handle?
