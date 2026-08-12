# Chapter 19 — Composition Over Configuration

## Quick refresher

Composition lets consumers supply elements or behavior through children and slots. Configuration asks one component to understand every possible variation through props.

## Why this matters

Senior interviews assess whether component APIs can grow without becoming a large collection of conditional branches and conflicting boolean props.

## Core mental model

Configuration becomes difficult when combinations multiply:

```tsx
<Card showHeader compact hasFooter elevated loading />
```

Composition gives structure to the caller:

```tsx
<Card>
  <Card.Header><UserSummary /></Card.Header>
  <Card.Body><Activity /></Card.Body>
  <Card.Footer><Actions /></Card.Footer>
</Card>
```

Use ordinary `children` for one flexible content region. Use named props such as `header` and `footer` for a few explicit slots. Use compound components when related pieces need coordinated state and semantics.

Composition is not automatically better. A small closed set of variants is clearer as a typed prop. The goal is to expose meaningful choices while preventing invalid combinations.

Prefer elements or components over render callbacks unless the consumer needs internal state to produce its content.

## Common traps

- Replacing every prop with a compound component.
- Creating many boolean props that produce invalid combinations.
- Using a render prop when static children are sufficient.
- Allowing arbitrary composition that breaks required semantics or accessibility.

## Interview answer

I use configuration for a small, stable set of variants and composition when consumers need structural flexibility. Children, named slots, or compound components let callers assemble UI without teaching one component every possible layout. The API should still enforce important semantic and accessibility constraints.

## Check yourself

When is `variant="danger"` clearer than supplying a custom component through a slot?
