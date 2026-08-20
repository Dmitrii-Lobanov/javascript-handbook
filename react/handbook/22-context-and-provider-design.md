# Chapter 22 — Context and Provider Design

## Quick refresher

Context lets descendants read a value from the nearest matching provider without passing it through every intermediate component.

## Why this matters

Context solves value distribution, not state modeling, caching, or high-frequency update performance by itself.

## Core mental model

```tsx
const ThemeContext = createContext<ThemeContextValue | null>(null);

function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used within ThemeProvider");
  return value;
}
```

The provider establishes ownership and lifetime; context distributes access. Good candidates include theme, locale, authenticated identity, or state shared by a compound component.

All consumers are notified when a provider’s `value` changes according to `Object.is`. Avoid creating needless identities and avoid combining unrelated, frequently changing values into one large context:

```tsx
const value = useMemo(() => ({ theme, setTheme }), [theme]);
```

Memoization helps only if the provider’s parent can render without `theme` changing and consumer work matters. Splitting state and actions or separate domains can produce clearer boundaries. For frequent selective subscriptions, an external store with selectors may fit better.

## Provider placement defines lifetime

A provider remount resets state it owns. Place it high enough to survive required navigation, but low enough to avoid exposing and updating unrelated subtrees.

```tsx
<AppShell>
  <ProjectProvider projectId={projectId}>
    <ProjectRoutes />
  </ProjectProvider>
</AppShell>
```

Changing `projectId` may intentionally reset project-scoped state, especially when the provider is keyed by project identity.

## Avoid misleading defaults

A meaningful static default is appropriate when operating without a provider is valid, such as a default visual theme. For required application dependencies, use `null` and throw from a custom Hook so missing configuration fails near its cause.

## Separate domains, not arbitrary fields

One application context containing auth, theme, notifications, routing, and feature state creates hidden coupling and broad update fan-out. Split providers by ownership, lifetime, and update frequency.

Do not split every field mechanically. Cohesive values that always change together can remain one context.

## State and actions

Providing a stable dispatch function separately from changing state can let command-only consumers avoid state updates:

```tsx
const StateContext = createContext<State | null>(null);
const DispatchContext = createContext<Dispatch<Action> | null>(null);
```

This helps only when components genuinely consume one side independently.

## Context versus external stores

| Requirement | Context | External store |
| --- | --- | --- |
| Subtree configuration | Strong fit | Usually unnecessary |
| Nearest-provider semantics | Built in | Custom |
| Selective high-frequency subscriptions | Limited | Strong fit |
| Updates outside React | Awkward | Natural |
| Simple compound-component state | Strong fit | Excessive |

## Common traps

- Using context as a universal global state solution.
- Providing a fake default that hides a missing provider.
- Putting unrelated values into one provider object.
- Memoizing the value without measuring or understanding update fan-out.

## Interview answer

Context distributes a value through a subtree; it does not decide how that value is modeled. I scope providers by ownership and lifetime, expose a focused custom Hook, and keep values cohesive. Because provider changes notify consumers, I split high-frequency domains or use selector-based external stores when update granularity matters.

## Follow-up questions

### Does `memo` stop a consumed Context update?

No. A component that reads a changed Context must receive the new value independently of its prop comparison.

### Why does provider placement matter?

It determines which subtree can access the value, how long owned state survives, and how broadly updates propagate.

### When should Context be replaced by an external store?

When updates originate outside React or many consumers need fine-grained selector subscriptions.

## Check yourself

1. Why can one large Context cause broad rerenders?
2. When is a non-null default appropriate?
3. How does provider placement affect state lifetime?
4. Why might state and dispatch use separate contexts?
5. Which use case favors an external store?
