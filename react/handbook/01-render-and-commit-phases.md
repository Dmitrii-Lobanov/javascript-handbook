# Chapter 1 — Render and Commit Phases

## Quick refresher

React updates the screen in two main phases:

1. **Render:** React calls components and calculates the next UI tree.
2. **Commit:** React applies the required changes to the host environment, such as the DOM.

A render is a calculation. It does **not** guarantee that the DOM changes. React may render a component, compare the result with the previous tree, and conclude that no host mutation is necessary.

```text
trigger update → render → reconcile → commit → browser paint
```

## Why this matters

This distinction explains many common React questions:

- Why did the component function run when the DOM did not change?
- Why must rendering be pure?
- When is it safe to read or modify the DOM?
- Why can development logs appear twice in Strict Mode?
- When do `useLayoutEffect` and `useEffect` run?
- How can React pause or abandon work without corrupting the application?

Interviewers are usually testing your mental model, not whether you remember internal implementation details.

## Core mental model

### 1. An update triggers rendering

The initial root render, a state update, a parent render, a changed context value, or an external-store notification can schedule work. React begins calculating what the UI should look like next.

### 2. Render calculates the next tree

During render, React calls function components and evaluates their Hooks. The returned React elements are descriptions of UI, not DOM nodes.

```tsx
type PriceProps = {
  value: number;
};

function Price({ value }: PriceProps) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

  return <span>{formatted}</span>;
}
```

Formatting the value is safe because it only calculates output from the current props. Rendering must be **pure and idempotent**: given the same props, state, and context, the component should return the same result without changing anything outside itself.

Do not perform these operations during render:

- mutate the DOM;
- modify props, state objects, or shared module state;
- start subscriptions or timers;
- make uncontrolled network requests;
- call a state setter unconditionally;
- depend on how many times the component function has run.

React may prioritize, pause, restart, or discard render work. None of those attempts should leave observable side effects behind.

### 3. Reconciliation determines what changed

React compares the next element tree with the previous one. Component type, position, and keys help React decide whether to preserve an existing component instance and its state or replace it.

Reconciliation belongs to the render work. It produces the set of host changes required for the commit. It is not the same thing as directly comparing every DOM node.

```tsx
function Status({ online }: { online: boolean }) {
  return <p className="status">{online ? "Online" : "Offline"}</p>;
}
```

When `online` changes, React can reuse the existing `<p>` and update only its text. If a render produces the same relevant output as before, React may have nothing to mutate in the DOM.

### 4. Commit makes the result observable

Once React has a completed tree, it commits the result. Commit work is synchronous for that tree because the user must not see a partially applied UI.

During commit, React can:

- insert, update, or remove DOM nodes;
- detach and attach refs;
- run `useLayoutEffect` cleanup and setup at the appropriate points;
- make the committed tree the current UI.

`useLayoutEffect` runs after DOM mutations but before the browser paints. It is useful when code must measure layout and synchronously adjust the UI before the user sees it.

```tsx
function Tooltip() {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const rect = tooltipRef.current?.getBoundingClientRect();
    // Measure the committed DOM and position the tooltip.
  }, []);

  return <div ref={tooltipRef}>Details</div>;
}
```

Use layout Effects sparingly because synchronous work there delays painting.

### 5. The browser paints, then passive Effects normally run

After the commit, the browser can paint the updated screen. React generally runs `useEffect` after paint, although interaction-related scheduling can affect the exact timing. The important interview distinction is that an Effect runs **after a commit**, never during render.

```tsx
function ChatRoom({ roomId }: { roomId: string }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();

    return () => connection.disconnect();
  }, [roomId]);

  return <h1>Room: {roomId}</h1>;
}
```

This Effect synchronizes the committed component with an external system. Its cleanup runs before the Effect is set up again for changed dependencies and when the component unmounts.

## Render versus commit

| Question | Render phase | Commit phase |
| --- | --- | --- |
| Main purpose | Calculate the next UI | Apply the finished result |
| Calls component functions | Yes | No |
| May be interrupted or discarded | Yes | No, not for a commit already in progress |
| May mutate the DOM | No | Yes |
| Must remain pure | Yes | Commit-related Effects may synchronize externally |
| User can observe the intermediate work | No | The committed result becomes observable |

## Effect timing at a glance

```text
render
  ↓
DOM mutations and ref updates
  ↓
useLayoutEffect cleanup/setup
  ↓
browser paint
  ↓
useEffect cleanup/setup (generally)
```

Do not reach for an Effect merely because some calculation follows a render. If a value can be derived from props and state, calculate it during render. Use an Effect when the component must synchronize with something outside React, such as a network connection, browser API, timer, or third-party widget.

## Mount, update, and unmount

- **Mount:** React renders a component for the first time and commits its host nodes.
- **Update:** React renders an existing component again and commits only the necessary differences.
- **Unmount:** React removes the component, runs relevant cleanup, and clears its refs.

The component function running is not itself a mount. A function can run multiple times for one eventual committed update, and an attempted render may never commit.

## Strict Mode in development

In development, Strict Mode intentionally performs extra work to expose impure rendering and missing Effect cleanup. You may see component functions called more than once, or an Effect setup followed by cleanup and setup again.

This does not mean production renders everything twice. It means the code should remain correct when render logic is repeated and Effects are properly cleaned up.

```tsx
let nextId = 0;

function BadExample() {
  // Bug: rendering mutates module state, so repeated renders change behavior.
  const id = nextId++;
  return <p>Item {id}</p>;
}
```

Generate stable identifiers through React APIs such as `useId`, or create data identifiers when the data itself is created—not as a side effect of rendering.

## Common traps

- Saying “React re-rendered the DOM.” React renders components, then may commit DOM changes.
- Assuming a component render always leads to a commit.
- Mutating an object or global value during render.
- Reading a ref during render to make UI decisions about the current DOM.
- Starting requests, timers, or subscriptions in the component body.
- Using `useEffect` for derived data and causing an avoidable second render.
- Saying `useEffect` is guaranteed to run immediately after paint. Exact scheduling is more nuanced.
- Treating extra Strict Mode development calls as a production bug.
- Confusing reconciliation with the commit phase.

## Interview answer

React processes an update in a render phase and a commit phase. During render, it calls components to calculate the next element tree and reconciles that tree with the previous one. Render work must stay pure because React may repeat, pause, or discard it. Once React has a completed result, the commit phase applies the required DOM mutations, updates refs, and runs layout Effects. The browser can then paint, and passive Effects generally run afterward. Therefore, a component rendering does not necessarily mean the DOM changed, and side effects must not happen during render.

## Follow-up questions

### Does every render update the DOM?

No. React may render and reconcile a component but find that its host output does not require a DOM mutation.

### Why can React safely discard a render?

Rendering is expected to be pure. Until commit, React has calculated a possible next tree without making that result visible through host mutations.

### Where should an API request happen?

If a user action directly causes it, an event handler is often the clearest place. If the component must synchronize with an external resource because it is mounted or an input changed, use an Effect or a framework data-fetching mechanism. Never start an uncontrolled request during render.

### When would you choose `useLayoutEffect` over `useEffect`?

Use `useLayoutEffect` when code must read the committed layout and synchronously adjust the UI before paint, such as positioning a tooltip. Prefer `useEffect` when the synchronization does not need to block paint.

### Are Effects part of rendering?

No. Effects run only after React commits. A render that is abandoned does not run its Effects.

## Check yourself

1. Why may a `console.log` in a component run even when the DOM remains unchanged?
2. What makes a calculation safe to perform during render?
3. Why must subscriptions return cleanup from an Effect?
4. Which Hook would you use to measure layout before paint, and what is its cost?
5. What does Strict Mode reveal by repeating development-only work?
