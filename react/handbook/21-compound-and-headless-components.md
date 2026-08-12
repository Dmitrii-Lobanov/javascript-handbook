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

## Common traps

- Treating compound components as styling-only namespaces.
- Exposing context internals as a public API.
- Allowing flexible markup that breaks required DOM relationships.
- Using a headless abstraction when a styled semantic primitive would be safer.

## Interview answer

Compound components provide flexible structure while a shared owner coordinates state and semantics. Headless components separate behavior from presentation more aggressively. I use them when consumers need real structural control, but keep accessibility invariants, ownership, and context scope explicit so flexibility does not make correct usage fragile.

## Check yourself

What behavior should `Tabs` keep internal even when its visual presentation is fully customizable?
