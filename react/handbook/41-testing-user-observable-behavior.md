# Chapter 41 — Testing User-Observable Behavior

## Quick refresher

Test what users can perceive and do: rendered content, accessible roles and names, interactions, navigation, and outcomes.

## Why this matters

Tests coupled to component internals resist refactoring while missing real accessibility and integration problems.

## Core mental model

```tsx
render(<Login />);
await user.type(screen.getByLabelText(/email/i), "a@example.com");
await user.click(screen.getByRole("button", { name: /sign in/i }));
expect(await screen.findByText(/welcome/i)).toBeVisible();
```

Prefer role, label, and visible-text queries because they resemble user access and expose missing semantics. Mock at system boundaries such as network requests, not internal Hooks. Assert outcomes rather than state variables or function call sequences.

Implementation tests remain appropriate for pure algorithms or stable library contracts, but UI confidence comes primarily from behavior.

## Query the way a user navigates

Prefer queries in roughly this order:

1. accessible role and name;
2. associated label;
3. visible text;
4. semantic alternatives such as placeholder or display value;
5. test ID only when no meaningful semantic query exists.

This is not merely testing-library style. If a button cannot be found by role and accessible name, keyboard and assistive-technology users may also struggle to identify it.

## Test the contract, not the wiring

```text
weak:  expect(setOpen).toHaveBeenCalledWith(true)
strong: expect(screen.getByRole("dialog")).toBeVisible()
```

The stronger assertion remains valid if state moves to a reducer, Context, or a parent. Assert emitted callbacks when the callback itself is the public contract of a reusable component, but do not expose internal callbacks only for tests.

## Interact realistically

Use an interaction utility that performs the event sequence a browser user would trigger. Typing includes focus and keyboard events; clicking includes pointer and focus behavior. Directly calling `fireEvent.change` or a component handler can skip bugs in that sequence.

## Mock at stable boundaries

Intercept HTTP or other external systems rather than mocking a data Hook's implementation. Render with realistic providers and routing when those are part of the behavior. Too many mocks prove only that the mocks agree with the component.

## Common traps

- Selecting elements by CSS class or test ID first.
- Calling event handlers directly.
- Asserting internal component state.
- Mocking so much that no real integration remains.

## Interview answer

I test UI through accessible queries and realistic interactions, then assert user-visible outcomes. I mock external boundaries rather than internal implementation and keep pure logic tests separate. This produces refactor-resistant tests and makes accessibility failures more visible.

## Follow-up questions

### Are test IDs always wrong?

No. They are useful when an element has no meaningful user-facing identity, but they should not replace available roles, labels, or text.

### When should a callback invocation be asserted?

When the callback is part of the component's public contract—for example, a reusable controlled component's `onChange`. For application UI, the resulting behavior is usually more valuable.

### Why avoid testing Hook state directly?

State is an implementation detail. The user experiences rendered behavior, and the same behavior can be implemented with different state mechanisms.

## Check yourself

1. Why is `getByRole("button", { name: "Save" })` usually better than a test ID?
2. What makes a UI test resistant to refactoring?
3. Where should network behavior be mocked?
4. When is visible text a weaker query than a role and name?
5. What can realistic user events reveal that direct handler calls cannot?
