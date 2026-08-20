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

## Conditional behavior versus conditional Hook calls

Keep the Hook call unconditional and put the condition inside its callback or returned behavior:

```tsx
function Chat({ roomId, enabled }: Props) {
  useEffect(() => {
    if (!enabled) return;

    const connection = connect(roomId);
    return () => connection.disconnect();
  }, [enabled, roomId]);
}
```

If an entire branch has independent Hooks, extract a component:

```tsx
function Page({ signedIn }: { signedIn: boolean }) {
  return signedIn ? <AuthenticatedPage /> : <SignInPage />;
}
```

Each component then has its own stable Hook sequence.

## Early returns can change call order

This is unsafe:

```tsx
function Profile({ user }: { user: User | null }) {
  if (!user) return <SignInPrompt />;

  const [editing, setEditing] = useState(false);
  // ...
}
```

When `user` changes, the component switches between zero and one Hook calls. Move Hooks above the return or split the branches into components.

An early return after all Hook calls is safe because the sequence has already remained stable.

## Hooks in loops and collections

Do not call a Hook once per array item:

```tsx
// Wrong
items.map(item => useItemState(item));
```

Render an `Item` component and call the Hook inside it. React can then associate each component’s Hooks with its keyed identity.

## The special `use` API

React’s `use` API may read a supported Promise or Context conditionally or in a loop. It still must run while React is rendering a component or custom Hook, and it cannot be wrapped in `try`/`catch` for rejected resources.

This is a documented exception to the normal top-level call rule; it does not make conditional `useState`, `useEffect`, or other Hooks safe.

## Tooling and naming

Custom Hook names begin with `use` so lint tooling can recognize their call sites. A function that performs a pure calculation should not be renamed to `useSomething`; keep it an ordinary function.

Use the current `eslint-plugin-react-hooks` rules. They catch call-order, dependency, purity, static-component, and compiler-related problems that can otherwise appear as confusing runtime behavior.

## Common traps

- Calling a Hook after an early return that occurs only on some renders.
- Calling Hooks from event handlers or module-level helpers.
- Assuming a custom Hook creates a separate component or state store.
- Naming a normal function `useSomething` even though it is not a Hook.

## Interview answer

Hooks must be called unconditionally at the top level of components or custom Hooks because React tracks Hook state by call order. If a conditional changes that order, later state slots no longer correspond to the same calls. Conditions should normally move inside the Hook or into a separate component.

## Follow-up questions

### Why can custom Hooks call other Hooks?

They execute while a component renders and contribute their calls to that component’s stable Hook sequence.

### Can Hooks be called from event handlers?

No. Event handlers run outside render and cannot participate in render-time Hook identity.

### How should conditional Hook-heavy UI be structured?

Extract each branch into a component so every mounted component has its own unconditional Hook sequence.

## Check yourself

1. Why is a Hook after a conditional early return unsafe?
2. How should a list give every row independent Hook state?
3. Where should a condition go when an Effect is only sometimes active?
4. Why must a custom Hook name start with `use`?
5. How does the `use` API differ from ordinary Hooks?
