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

## Match the waiting primitive to the outcome

| Expected behavior | Typical approach |
| --- | --- |
| Element appears | `findBy...` |
| Element disappears | Wait for removal |
| Existing element changes | `waitFor` a focused assertion |
| User interaction | Await the interaction call |
| Debounce or retry timer | Controlled fake timer advancement |

`waitFor` retries until its callback stops throwing. It should contain an assertion, not trigger the behavior repeatedly.

## Test the state sequence

A request test should often verify more than final data:

```text
user action → pending feedback → resolved content
                         ↘ error and retry
                         ↘ empty success
```

Assert pending UI only when it is part of the product contract. Very fast operations may intentionally avoid flashing an indicator.

## Control requests, not implementation

Use a request interceptor so the component exercises its actual client, parsing, cache, and error handling. Hold and resolve requests explicitly to test overlapping responses:

1. start request for `a`;
2. start request for `ab`;
3. resolve `ab`;
4. resolve `a`;
5. assert that results still belong to `ab`.

## Keep `act` warnings meaningful

Modern render and user-event utilities handle normal updates. An `act` warning often means the test ended before an update, a timer was advanced incorrectly, or work occurred outside the test's control. Do not silence it with a broad wrapper without finding the missing awaited outcome.

## Common traps

- Adding sleeps to make a test pass.
- Wrapping everything in `waitFor`.
- Forgetting to await user interactions.
- Testing only the successful response.

## Interview answer

I trigger async UI through user interactions, assert immediate pending feedback, and wait for a specific observable outcome. I control network and timer boundaries deterministically, test failure and stale-response cases, and avoid arbitrary sleeps or implementation-specific state assertions.

## Follow-up questions

### When should you use `findBy` instead of `getBy`?

Use `findBy` when the element is expected to appear asynchronously. Use `getBy` when it should exist immediately and absence should fail at once.

### Why is a fixed sleep flaky?

The required time varies across machines and load. A sleep can be both unnecessarily slow and still too short; waiting for a specific condition tracks the actual contract.

### What should an `act` warning prompt you to inspect?

Look for an unawaited interaction, unresolved promise, uncontrolled timer, subscription update, or assertion that ends before the component settles.

## Check yourself

1. How would you test that an older autocomplete response cannot replace a newer query?
2. When is `waitFor` preferable to `findBy`?
3. Why should behavior not be triggered inside `waitFor`?
4. Which tests genuinely need fake timers?
5. What user-visible states should a failed request test assert?
