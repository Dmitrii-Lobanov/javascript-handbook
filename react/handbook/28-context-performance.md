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

## Common traps

- Assuming consumers subscribe only to fields they read.
- Wrapping consumers in `memo` and expecting context updates to stop.
- Putting unrelated application state into one provider.
- Replacing prop passing with context without an ownership reason.

## Interview answer

Context updates are based on the provider value’s identity, and consumers do not select individual object fields automatically. I reduce fan-out by splitting cohesive domains, scoping providers, and avoiding needless value changes. For high-frequency selective subscriptions, I prefer a store designed around selectors rather than forcing context to be a full state-management system.

## Check yourself

Why does memoizing a provider object not help when one of its dependencies changes on every keystroke?
