# Chapter 43 — Testing Asynchronous UI

## Quick refresher

Async UI tests trigger behavior, wait for an observable outcome, and control external nondeterminism without depending on arbitrary time delays.

## Why this matters

Incorrect waiting produces flaky tests, missed race conditions, and false positives wrapped in React update warnings.

## Core mental model

```tsx
await user.click(screen.getByRole("button", { name: /load/i }));
expect(screen.getByRole("status")).toHaveTextContent(/loading/i);
expect(await screen.findByText("Ada Lovelace")).toBeVisible();
```

Use `findBy` for elements that will appear and `waitFor` for retrying an assertion. Mock network behavior at the request boundary and test success, empty, error, cancellation, and out-of-order responses where relevant.

Use fake timers only for timer-owned behavior such as debounce, and advance them intentionally. Do not combine timer control and unresolved promises without understanding both queues.

## Common traps

- Adding sleeps to make a test pass.
- Wrapping everything in `waitFor`.
- Forgetting to await user interactions.
- Testing only the successful response.

## Interview answer

I trigger async UI through user interactions, assert immediate pending feedback, and wait for a specific observable outcome. I control network and timer boundaries deterministically, test failure and stale-response cases, and avoid arbitrary sleeps or implementation-specific state assertions.

## Check yourself

How would you test that an older autocomplete response cannot replace a newer query?
