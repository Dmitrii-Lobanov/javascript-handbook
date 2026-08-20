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

## Controlled ownership

A controlled component does not decide whether the proposed change is accepted:

```tsx
function Toggle({ pressed, onPressedChange }: Props) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
    >
      Notifications
    </button>
  );
}
```

The callback communicates intent. The parent may update immediately, validate, synchronize with routing, or reject the proposal.

## Uncontrolled ownership

An uncontrolled component owns current state and accepts only an initial default:

```tsx
function Toggle({ defaultPressed = false, onPressedChange }: Props) {
  const [pressed, setPressed] = useState(defaultPressed);
  // ...
}
```

Changing `defaultPressed` later does not reset state. Use a changed key, an explicit reset API, or controlled mode when the parent must determine current value.

## Supporting both modes

Determine controlledness from whether the controlled value is `undefined`, not from truthiness. Keep the initial mode stable for the component lifetime and always call the semantic change callback.

| Need | Mode |
| --- | --- |
| Parent coordination or validation | Controlled |
| URL-driven selection | Controlled |
| Small isolated disclosure | Uncontrolled |
| Native form submission with minimal rerenders | Often uncontrolled |
| Immediate React validation per keystroke | Often controlled |

For TypeScript APIs, a union can prevent passing both `value` and `defaultValue`.

## Reset behavior is part of the contract

Controlled state resets when the owner supplies a new value. Uncontrolled state can reset through component identity, a documented imperative method, or a semantic reset command. Do not secretly watch a default prop in an Effect.

## Common traps

- Copying a controlled prop into state and creating two owners.
- Expecting changes to a `defaultValue` prop to update current state.
- Switching modes after mount.
- Exposing both APIs without defining which value wins.

## Interview answer

A controlled component delegates state ownership to its parent through a value and change callback, which enables coordination and validation. An uncontrolled component owns state and may accept an initial default, which can simplify isolated use. A component supporting both must choose the current value consistently and never silently switch ownership modes.

## Follow-up questions

### Does a controlled callback guarantee the value changes?

No. It requests a change; the owner decides the next prop.

### Can a component switch modes?

It should not. Switching ownership mid-lifecycle creates ambiguous state and React warnings for native inputs.

### When are uncontrolled native inputs useful?

For forms that rely on native submission, `FormData`, or infrequent reads without React coordinating every keystroke.

## Check yourself

1. Why does `defaultValue` describe initialization?
2. Who decides whether a controlled change is accepted?
3. How should uncontrolled state reset?
4. Why is `value !== undefined` safer than a truthiness check?
5. How can TypeScript prevent ambiguous mixed-mode props?
