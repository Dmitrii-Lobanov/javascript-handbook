# Chapter 10 — Rules of Hooks

## Quick refresher

- Call Hooks only at the top level of a component or custom Hook.
- Call Hooks only from React components or custom Hooks.
- Do not call Hooks conditionally, in loops, event handlers, or ordinary utility functions.

## Why this matters

React associates Hook state with call order. The rules preserve that order across renders and allow React and its tooling to reason about component behavior.

## Core mental model

Conceptually, React matches Hook calls by position:

```text
first call  → first state slot
second call → second Effect slot
third call  → third ref slot
```

This is unsafe because the call order changes:

```tsx
if (enabled) {
  const [value, setValue] = useState(0);
}
```

Move the condition inside the Hook’s behavior instead:

```tsx
useEffect(() => {
  if (!enabled) return;
  return subscribe();
}, [enabled]);
```

Custom Hooks can call other Hooks because they participate in the same ordered component execution. Their names start with `use` so lint tooling can recognize and enforce Hook semantics.

Modern lint rules also enforce purity and dependency requirements beyond the two foundational rules. The core reason remains predictable render-time composition.

## Common traps

- Calling a Hook after an early return that occurs only on some renders.
- Calling Hooks from event handlers or module-level helpers.
- Assuming a custom Hook creates a separate component or state store.
- Naming a normal function `useSomething` even though it is not a Hook.

## Interview answer

Hooks must be called unconditionally at the top level of components or custom Hooks because React tracks Hook state by call order. If a conditional changes that order, later state slots no longer correspond to the same calls. Conditions should normally move inside the Hook or into a separate component.

## Check yourself

Why is a Hook after a conditional early return unsafe even though it is not visibly inside an `if` block?
