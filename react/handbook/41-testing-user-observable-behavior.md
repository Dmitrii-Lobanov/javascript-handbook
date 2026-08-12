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

## Common traps

- Selecting elements by CSS class or test ID first.
- Calling event handlers directly.
- Asserting internal component state.
- Mocking so much that no real integration remains.

## Interview answer

I test UI through accessible queries and realistic interactions, then assert user-visible outcomes. I mock external boundaries rather than internal implementation and keep pure logic tests separate. This produces refactor-resistant tests and makes accessibility failures more visible.

## Check yourself

Why is `getByRole("button", { name: "Save" })` usually better than a test ID?
