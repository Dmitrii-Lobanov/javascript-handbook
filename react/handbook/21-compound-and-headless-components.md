# Chapter 21 — Compound and Headless Components

## Quick refresher

Compound components expose cooperating pieces under one conceptual API. Headless components provide state and behavior while leaving most rendering and styling to consumers.

## Why this matters

These patterns support flexible design systems, but they require careful state sharing, semantic constraints, and documentation.

## Core mental model

```tsx
<Tabs defaultValue="profile">
  <Tabs.List aria-label="Account">
    <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
    <Tabs.Trigger value="security">Security</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="profile">...</Tabs.Panel>
  <Tabs.Panel value="security">...</Tabs.Panel>
</Tabs>
```

The root owns or receives the active value. Descendants communicate through a focused context. Triggers and panels remain composable while the implementation coordinates IDs, selection, keyboard navigation, and ARIA relationships.

A headless API might instead expose a Hook or render function that returns state and prop-getters. This offers more markup control but transfers more responsibility to consumers and can make correct accessibility harder.

Keep context private to the component family, fail clearly when a child is outside its provider, and split contexts when frequently changing state should not rerender unrelated consumers.

## Anatomy of a compound component

The root owns shared state and provides a private contract:

```tsx
type TabsContextValue = {
  value: string;
  select: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);
```

Each child reads only the behavior it needs. A custom `useTabsContext` Hook throws a clear error when a child is rendered outside the root.

Compound components are more than a naming convention such as `Card.Header`. The pattern is valuable when pieces cooperate through shared state, identity, or semantics.

## Headless abstraction tradeoffs

A headless Hook may return prop getters:

```tsx
const {
  getTabProps,
  getPanelProps,
  selectedValue,
} = useTabs(options);
```

This allows custom markup, but consumers must apply every returned prop correctly and merge their handlers. A component primitive can enforce more of the DOM contract.

## Preserve semantic ownership

Even a visually headless tabs primitive should own:

- selected value rules;
- stable trigger/panel IDs;
- roving focus;
- arrow-key behavior;
- disabled-item handling;
- ARIA relationships.

Presentation is flexible; the interaction model is not optional.

## Context and render performance

A single context value update renders all consumers that read it. Split stable actions from frequently changing state only when fan-out is meaningful. Do not add multiple providers before measuring or understanding which descendants actually update.

## Pattern selection

| Need | Pattern |
| --- | --- |
| Fixed semantic markup | Styled component |
| Flexible cooperating pieces | Compound components |
| Maximum markup control | Headless Hook/prop getters |
| One custom content region | Children/slot |
| Simple closed variants | Props |

## Common traps

- Treating compound components as styling-only namespaces.
- Exposing context internals as a public API.
- Allowing flexible markup that breaks required DOM relationships.
- Using a headless abstraction when a styled semantic primitive would be safer.

## Interview answer

Compound components provide flexible structure while a shared owner coordinates state and semantics. Headless components separate behavior from presentation more aggressively. I use them when consumers need real structural control, but keep accessibility invariants, ownership, and context scope explicit so flexibility does not make correct usage fragile.

## Follow-up questions

### Are all namespaced components compound components?

No. They become compound when related pieces coordinate through a shared owner or contract.

### What is the main cost of headless APIs?

Responsibility shifts to consumers, increasing the chance of missing semantics, handlers, or prop merging.

### Should compound Context be public?

Usually no. Keeping it private allows the implementation to evolve without callers depending on internal shape.

## Check yourself

1. What behavior should a customizable `Tabs` keep internal?
2. When is a compound API better than ordinary props?
3. What responsibility does a headless API transfer?
4. Why should provider errors be explicit?
5. When might splitting compound contexts help?
