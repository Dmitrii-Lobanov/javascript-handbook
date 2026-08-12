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

## Common traps

- Using context as a universal global state solution.
- Providing a fake default that hides a missing provider.
- Putting unrelated values into one provider object.
- Memoizing the value without measuring or understanding update fan-out.

## Interview answer

Context distributes a value through a subtree; it does not decide how that value is modeled. I scope providers by ownership and lifetime, expose a focused custom Hook, and keep values cohesive. Because provider changes notify consumers, I split high-frequency domains or use selector-based external stores when update granularity matters.

## Check yourself

Why can one large application context cause broad rerenders even when a consumer reads only one field?
