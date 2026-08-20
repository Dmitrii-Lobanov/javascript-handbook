# Chapter 28 — Context Performance

## Quick refresher

When a provider value changes, React notifies components that consume that context. `memo` does not block a context update inside a consumer.

## Why this matters

A broad provider containing frequently changing data can create large update fan-out even when each consumer reads only one field.

## Core mental model

```tsx
<AppContext.Provider value={{ user, theme, notifications, setTheme }}>
  <App />
</AppContext.Provider>
```

The object is new whenever the provider renders, and any changed field changes the complete context value. Improve the model before optimizing identities:

```tsx
<AuthContext.Provider value={user}>
  <ThemeContext.Provider value={theme}>
    <NotificationsProvider>{children}</NotificationsProvider>
  </ThemeContext.Provider>
</AuthContext.Provider>
```

Split providers by domain and update frequency, place them near the subtree that needs them, and keep state and dispatch APIs focused. Memoizing a provider value can prevent notifications caused only by a parent render, but cannot prevent legitimate updates when a dependency changes.

For high-frequency data or many consumers that need slices, use an external store with selector-based subscriptions. Also consider whether composition or ordinary props would make dependencies clearer.

## Stabilize only after shaping the context

Once the context contains the right domain, avoid notifications caused only by unrelated provider renders:

```tsx
const actions = useMemo(() => ({ signOut, updateProfile }), [signOut, updateProfile]);

return (
  <UserContext.Provider value={user}>
    <UserActionsContext.Provider value={actions}>
      {children}
    </UserActionsContext.Provider>
  </UserContext.Provider>
);
```

Separating state from actions can help components that need only stable commands. Do this when it reflects real consumption patterns, not as a mechanical rule.

## Select the right distribution mechanism

| Need | Prefer |
| --- | --- |
| A few explicit descendants need data | Props or composition |
| A subtree needs a low-frequency ambient value | Context |
| Many consumers need different slices of frequent updates | Selector-based external store |
| Server-owned cached data | Server-state/query library |

Context distributes a value; it does not define where the state should live or provide field-level subscriptions.

## Diagnose context fan-out

Use the Profiler to confirm that provider updates overlap the slow interaction. Then identify which value changed, how often it changes, and which consumers actually need it. Splitting a provider is valuable only if consumers can avoid subscribing to the frequently changing context.

## Common traps

- Assuming consumers subscribe only to fields they read.
- Wrapping consumers in `memo` and expecting context updates to stop.
- Putting unrelated application state into one provider.
- Replacing prop passing with context without an ownership reason.

## Interview answer

Context updates are based on the provider value’s identity, and consumers do not select individual object fields automatically. I reduce fan-out by splitting cohesive domains, scoping providers, and avoiding needless value changes. For high-frequency selective subscriptions, I prefer a store designed around selectors rather than forcing context to be a full state-management system.

## Follow-up questions

### Does `memo` protect a component from its context changing?

No. `memo` compares props. A component consuming a changed context value still needs to render.

### Should every provider value be wrapped in `useMemo`?

No. It matters only when unrelated provider renders recreate a composite value and avoiding those consumer notifications is useful. It cannot hide a genuine dependency change.

### Why might splitting state and actions help?

Action-only consumers can subscribe to a stable actions context rather than rerender whenever state changes.

## Check yourself

1. Why does memoizing a provider object not help when one dependency changes on every keystroke?
2. Why does reading one field not create a field-level context subscription?
3. When are props clearer than Context?
4. What evidence suggests moving to a selector-based store?
5. How would you verify that splitting a provider helped?
