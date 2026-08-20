# Chapter 34 — Hydration

## Quick refresher

Hydration attaches React behavior to server-rendered HTML by rendering the same initial tree on the client and connecting it to existing DOM.

## Why this matters

The page may look ready before it can respond. Hydration mismatches can cause warnings, discarded work, incorrect UI, and layout shifts.

## Core mental model

The server and first client render must agree. Avoid nondeterministic render output:

```tsx
// Risky during initial render
return <span>{new Date().toLocaleTimeString()}</span>;
```

Differences can come from time, random values, locale, browser-only APIs, invalid HTML, or data changing between server and client. Provide deterministic initial data, defer browser-only synchronization to an Effect, or isolate client-only UI deliberately.

Hydration also has a performance cost because React must load code and recreate the component tree. Suspense boundaries can allow selective hydration and prioritize interaction with ready regions.

## Separate deterministic markup from browser state

When a value exists only in the browser, render a deterministic initial state and synchronize after hydration:

```tsx
function ThemeLabel() {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    setTheme(localStorage.getItem("theme") ?? "system");
  }, []);

  return <span>Theme: {theme}</span>;
}
```

This avoids a mismatch but may visibly change after hydration. For appearance-critical preferences, an earlier server-readable cookie or carefully designed pre-paint script may provide a better experience.

## Diagnose a mismatch

Compare the server HTML with the first client render, not with the UI after Effects. Check:

- time, randomness, locale, and time-zone formatting;
- browser-only branches and persisted state;
- changing API data or inconsistent cache snapshots;
- invalid HTML nesting that the browser repairs;
- generated IDs from non-hydration-safe mechanisms;
- extensions or edge transformations that modify markup.

`useId` is designed to generate IDs that coordinate across server and client rendering; a random ID created during render is not.

## Hydration performance

Large interactive trees require JavaScript download, parsing, component evaluation, and event attachment. Reduce client code, narrow interactive boundaries, avoid expensive initial renders, and use framework-supported streaming or selective hydration where appropriate.

## Common traps

- Using `typeof window` branches that change initial markup.
- Suppressing mismatch warnings instead of fixing the cause.
- Confusing visible HTML with usable UI.
- Rendering the whole page as client-only to avoid one mismatch.

## Interview answer

Hydration connects client React to server HTML, so the initial output must be deterministic and equivalent. I eliminate time, random, locale, and browser-only differences or isolate them behind intentional boundaries. I also measure hydration as JavaScript and main-thread work, not merely correctness.

## Follow-up questions

### Should `suppressHydrationWarning` be the normal fix?

No. It is an escape hatch for an intentionally different value and works only one level deep. It does not repair application logic or make arbitrary mismatches safe.

### Why can invalid HTML cause a React mismatch?

The browser may repair the parsed DOM, so the DOM React hydrates differs structurally from the HTML the component tree expected.

### What is the difference between hydration and an Effect?

Hydration connects React to existing server DOM. Effects run after a client commit and are used for synchronization, not for attaching React itself.

## Check yourself

1. How would you render a browser-local preference without producing a hydration mismatch?
2. Why is `Math.random()` unsafe during the initial render?
3. How would you investigate a mismatch that occurs only in one locale?
4. Why can a page look ready before hydration finishes?
5. When is `suppressHydrationWarning` defensible?
