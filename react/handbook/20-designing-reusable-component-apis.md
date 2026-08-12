# Chapter 20 — Designing Reusable Component APIs

## Quick refresher

A reusable component API defines ownership, allowed variants, event semantics, accessibility behavior, defaults, and escape hatches.

## Why this matters

Reusability is not maximum flexibility. Good APIs make common correct usage easy and invalid or inaccessible combinations difficult.

## Core mental model

Design from consumer intent rather than internal implementation:

```tsx
type DialogProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: ReactNode;
  children: ReactNode;
};
```

`onOpenChange` describes the proposed state transition without exposing which internal button was clicked. The component owns focus management, Escape handling, and dialog semantics; consumers own whether the dialog is open.

Useful API questions:

- Who owns the state?
- What are the valid states and combinations?
- Which semantics must the component guarantee?
- Which HTML props should be forwarded?
- Does the escape hatch preserve the contract?
- Can the API evolve without breaking callers?

Prefer explicit names such as `onValueChange` when the callback reports a semantic value. Keep callbacks stable only when performance evidence or an external subscription requires it—not as a blanket API promise.

## Common traps

- Passing internal setters directly to consumers.
- Adding props for isolated product-specific exceptions.
- Accepting arbitrary markup that breaks keyboard or ARIA relationships.
- Hiding ownership by maintaining a second internal copy of controlled state.

## Interview answer

I start a reusable API from the consumer’s states and events. I define one owner for each value, encode closed variants in types, provide composition where structure must vary, and keep accessibility behavior inside the primitive. Escape hatches should extend presentation without invalidating semantic guarantees.

## Check yourself

Why is `onOpenChange(nextOpen)` often a better public contract than exposing `setOpen`?
