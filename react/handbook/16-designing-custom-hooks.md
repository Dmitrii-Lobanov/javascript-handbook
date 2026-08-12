# Chapter 16 — Designing Custom Hooks

## Quick refresher

A custom Hook extracts reusable stateful behavior. It shares logic, not state: each call receives its own Hook state unless the Hook connects to a shared external source.

## Why this matters

Interviewers look for abstractions with clear ownership and useful contracts—not merely code moved into a function.

## Core mental model

```tsx
function useOnlineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}
```

The component consumes a meaningful value without owning browser subscription details. The Hook still follows all Hook rules and must provide correct cleanup.

Design around a behavior or capability, not a lifecycle wrapper. Prefer a focused API with explicit inputs and outputs. Return the smallest stable contract callers need, and avoid hiding important application ownership or turning every Effect into a generic `useMount` abstraction.

Not all reused code needs a Hook. Pure calculations should remain ordinary functions. A function becomes a Hook when it needs React Hooks or should compose other stateful behavior.

## Common traps

- Assuming two calls to a custom Hook share state.
- Creating vague wrappers such as `useEffectOnce` that hide dependency semantics.
- Returning a large unstable object without considering consumers.
- Using a Hook for a pure formatting or transformation function.

## Interview answer

A custom Hook packages reusable stateful behavior behind a domain-focused contract. It should make ownership clearer, expose explicit inputs and useful outputs, and correctly handle synchronization and cleanup. Calls share implementation but normally not state. Pure reusable logic remains an ordinary function.

## Check yourself

When should filtering data be a normal function, and when might a `useFilteredResults` Hook be justified?
