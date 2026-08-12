# Chapter 39 — Forms and Actions

## Quick refresher

Forms combine field ownership, validation, submission, pending state, errors, and accessibility. Native form semantics provide submission, keyboard behavior, and progressive enhancement.

## Why this matters

Form architecture is a frequent interview topic because naive controlled state can create complexity without improving the user experience.

## Core mental model

Use the platform first:

```tsx
<form action={saveProfile}>
  <label htmlFor="name">Name</label>
  <input id="name" name="name" required />
  <button type="submit">Save</button>
</form>
```

Uncontrolled native fields are often sufficient when values are needed at submission. Use controlled fields when rendering depends on each change or values must coordinate live. Validate at appropriate layers: native constraints for immediate basics, client logic for UX, and server validation as the authority.

Actions can coordinate submission and pending state with framework support, but authorization, validation, and idempotency remain server responsibilities. Preserve user input on failure and connect errors to fields through accessible descriptions.

## Common traps

- Controlling every field by default.
- Validating only in the browser.
- Disabling submission without explaining pending state.
- Clearing input after a failed request.

## Interview answer

I start from semantic HTML forms, choose controlled state only when live coordination requires it, and keep the server authoritative for validation and permissions. The UI represents idle, pending, success, and error states, prevents duplicate submissions, preserves input on failure, and associates messages with their fields.

## Check yourself

When is an uncontrolled input simpler and more robust than controlled state?
