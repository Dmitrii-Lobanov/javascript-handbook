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

## Choose the smallest flexibility mechanism

```tsx
// One content region
<Panel><Report /></Panel>

// A few named regions
<Page header={<Header />} sidebar={<Filters />} />

// Consumer needs internal state
<List renderItem={(item, selected) => <Row item={item} active={selected} />} />
```

Use ordinary children first, named slots for explicit layout regions, render callbacks when internal data must reach custom rendering, and compound components when pieces coordinate behavior.

## Configuration is appropriate for closed choices

Typed variants make supported design choices predictable:

```tsx
<Alert tone="danger" size="compact" />
```

Do not require consumers to reconstruct a danger alert through arbitrary slots when the design system already defines that semantic variant.

## Boolean combinations signal a missing model

```tsx
<Button primary secondary destructive loading />
```

Replace mutually exclusive booleans with a union such as `variant="primary" | "secondary" | "danger"`. Use composition for independent structural content such as icons or actions.

## Composition needs constraints

Flexibility must not allow invalid DOM or inaccessible relationships. A tabs API may permit custom labels and panels while still owning roles, IDs, focus, and keyboard navigation.

| Requirement | Prefer |
| --- | --- |
| Small closed visual variants | Typed props |
| One arbitrary content area | `children` |
| Several named layout regions | Element props/slots |
| Consumer renders using internal data | Render callback |
| Cooperating flexible pieces | Compound components |

## Common traps

- Replacing every prop with a compound component.
- Creating many boolean props that produce invalid combinations.
- Using a render prop when static children are sufficient.
- Allowing arbitrary composition that breaks required semantics or accessibility.

## Interview answer

I use configuration for a small, stable set of variants and composition when consumers need structural flexibility. Children, named slots, or compound components let callers assemble UI without teaching one component every possible layout. The API should still enforce important semantic and accessibility constraints.

## Follow-up questions

### Is composition always more reusable?

No. Excessive flexibility can make common usage verbose and invalid combinations easy.

### When is a render prop justified?

When custom rendering needs state or data owned by the reusable component.

### What should remain internal in a composable widget?

Behavioral and accessibility invariants that consumers should not have to reconstruct.

## Check yourself

1. When is `variant="danger"` clearer than a slot?
2. What indicates a Boolean-prop explosion?
3. When are named slots preferable to children?
4. Why can render callbacks add unnecessary complexity?
5. Which accessibility rules should composition preserve?
