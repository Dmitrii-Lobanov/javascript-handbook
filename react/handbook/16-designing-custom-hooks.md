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

## Start from duplicated behavior

Extract a custom Hook after you can name the repeated capability:

```tsx
function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
```

The name communicates synchronization ownership. A vague `useMount(callback)` hides dependencies and cleanup semantics instead of clarifying them.

## Design explicit inputs and outputs

Prefer domain values over configuration bags full of callbacks:

```tsx
function useSearchResults(query: string, options: SearchOptions) {
  // Return result state and explicit operations.
}
```

Return the smallest contract consumers need. A tuple works for a small conventional pair; an object is often clearer when several named values and commands are exposed.

```tsx
return {
  results,
  status,
  retry,
};
```

Do not expose internal setters when callers should use meaningful commands such as `retry`, `reset`, or `select`.

## Custom Hooks share logic, not state

```tsx
const first = useCounter();
const second = useCounter();
```

These calls have independent Hook state. To share one value, lift the Hook call to a common owner, provide it through Context, or connect the Hook to the same external store.

## Preserve ownership visibility

A custom Hook should make important effects and dependencies understandable at its call site. Avoid a Hook that silently installs global listeners, writes storage, starts polling, and performs analytics under an innocent name.

Document:

- who owns the returned state;
- what external resources are synchronized;
- when requests or subscriptions start and stop;
- whether inputs require stable identity;
- what errors and loading states mean.

## Avoid premature generic Hooks

Extracting `useAutocomplete`, `useModal`, or `useDataTable` before the component behavior is understood can produce a large configuration API that is harder than the original component. First complete one clear implementation. Extract only behavior that has a coherent reusable contract.

## Test through a component contract

Hooks depend on React’s render and commit lifecycle. Test them through a small component or a Hook-rendering utility, and assert observable results, cleanup, rerender behavior, and provider integration. Pure helper functions extracted from the Hook can be tested directly.

## Hook or ordinary function?

| Responsibility | Abstraction |
| --- | --- |
| Format, filter, parse, validate | Ordinary function |
| Compose state or other Hooks | Custom Hook |
| Render semantic structure | Component |
| Share one mutable value across consumers | Context or external store integration |
| Call a remote system | Service, often coordinated by a Hook or framework |

## Common traps

- Assuming two calls to a custom Hook share state.
- Creating vague wrappers such as `useEffectOnce` that hide dependency semantics.
- Returning a large unstable object without considering consumers.
- Using a Hook for a pure formatting or transformation function.

## Interview answer

A custom Hook packages reusable stateful behavior behind a domain-focused contract. It should make ownership clearer, expose explicit inputs and useful outputs, and correctly handle synchronization and cleanup. Calls share implementation but normally not state. Pure reusable logic remains an ordinary function.

## Follow-up questions

### Do custom Hooks share state?

No. Each call has independent state unless the implementation subscribes to one shared external source.

### When should logic remain a utility?

When it is a pure calculation and does not need React state, Context, refs, or synchronization lifecycle.

### Should a Hook return raw state setters?

Only when setter semantics are genuinely the public contract. Domain operations often communicate ownership and valid transitions more clearly.

## Check yourself

1. When should filtering remain an ordinary function?
2. Why do two calls to one custom Hook normally have independent state?
3. What makes a Hook name and return contract useful?
4. Why can `useMount(callback)` be a harmful abstraction?
5. When should shared state use Context or an external store instead?
