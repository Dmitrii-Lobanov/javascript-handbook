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

## Start with use cases and invariants

Write the common consumer examples before finalizing props. Identify what must always remain true—for a dialog: one accessible name, contained focus, predictable dismissal, and restoration.

The component should own behavior that every consumer needs. The caller should own product decisions such as whether dismissal is accepted or what content is shown.

## Encode valid combinations

Use unions instead of loosely related optional props:

```tsx
type LinkButtonProps =
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void };
```

Types cannot guarantee runtime accessibility, but they can eliminate ambiguous ownership and impossible prop combinations.

## Preserve native contracts

Forward appropriate HTML attributes, event handlers, and refs when consumers need them. Merge behavior rather than silently replacing consumer handlers, and do not expose props that allow required roles or IDs to be overridden.

Prefer native elements and semantic prop names. A `disabled` button should behave like a disabled button, not merely look muted.

## Defaults and escape hatches

Defaults should make the common correct path short. Escape hatches should be narrow:

- `className` or style tokens for presentation;
- renderable slots for content;
- refs for legitimate imperative commands;
- lower-level primitives when markup control is truly required.

Avoid a generic `as` prop if changing the element can silently remove essential semantics.

## API review checklist

| Question | Goal |
| --- | --- |
| Who owns each value? | One source of truth |
| Which combinations are valid? | Type them explicitly |
| What behavior is guaranteed? | Keep it inside the primitive |
| What can consumers customize? | Expose deliberate slots |
| How does it reset? | Define identity and defaults |
| How will it evolve? | Avoid leaking internals |

## Common traps

- Passing internal setters directly to consumers.
- Adding props for isolated product-specific exceptions.
- Accepting arbitrary markup that breaks keyboard or ARIA relationships.
- Hiding ownership by maintaining a second internal copy of controlled state.

## Interview answer

I start a reusable API from the consumer’s states and events. I define one owner for each value, encode closed variants in types, provide composition where structure must vary, and keep accessibility behavior inside the primitive. Escape hatches should extend presentation without invalidating semantic guarantees.

## Follow-up questions

### Should a reusable component expose internal state setters?

Usually no. Semantic events keep the implementation replaceable and express user intent.

### Why can an `as` prop be dangerous?

Consumers may replace a semantic element without recreating its keyboard and accessibility behavior.

### When should a component forward a ref?

When consumers have a legitimate imperative requirement such as focus, measurement, or integration.

## Check yourself

1. Why is `onOpenChange` better than exposing `setOpen`?
2. How can types prevent invalid prop combinations?
3. Which behavior should a dialog primitive own?
4. What makes an escape hatch safe?
5. Why should native semantics influence API design?
