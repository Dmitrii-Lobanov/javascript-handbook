# Chapter 18 — Controlled and Uncontrolled Components

## Quick refresher

A controlled component receives its important value from a parent and reports changes. An uncontrolled component owns the value internally, often accepting an initial default.

## Why this matters

This distinction affects API design, reset behavior, validation, coordination, and integration with native forms or third-party code.

## Core mental model

```tsx
// Controlled
<Accordion expanded={open} onExpandedChange={setOpen} />

// Uncontrolled
<Accordion defaultExpanded />
```

A reusable component can support both modes, but must define a consistent contract:

```tsx
function Accordion({ expanded, defaultExpanded = false, onExpandedChange }: Props) {
  const [internal, setInternal] = useState(defaultExpanded);
  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : internal;

  function update(next: boolean) {
    if (!isControlled) setInternal(next);
    onExpandedChange?.(next);
  }
}
```

`defaultExpanded` is read as an initial value; changing it later should not normally control the component. Avoid switching between controlled and uncontrolled modes during a component’s lifetime.

Native form controls are uncontrolled when read through form submission or refs, and controlled when React supplies their current `value` or `checked`.

## Common traps

- Copying a controlled prop into state and creating two owners.
- Expecting changes to a `defaultValue` prop to update current state.
- Switching modes after mount.
- Exposing both APIs without defining which value wins.

## Interview answer

A controlled component delegates state ownership to its parent through a value and change callback, which enables coordination and validation. An uncontrolled component owns state and may accept an initial default, which can simplify isolated use. A component supporting both must choose the current value consistently and never silently switch ownership modes.

## Check yourself

Why does `defaultValue` describe initialization rather than ongoing synchronization?
