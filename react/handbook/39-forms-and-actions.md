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

## Choose field ownership deliberately

| Requirement | Prefer |
| --- | --- |
| Read values only on submission | Uncontrolled native fields and `FormData` |
| Live preview or dependent fields | Controlled state |
| Large complex form with field subscriptions | Focused form library |
| Server mutation with progressive enhancement | Form Action when supported |

Controlled and uncontrolled are ownership models, not quality levels. A form can mix them when the contract is clear.

## Model submission as a state machine

```text
idle → submitting → success
                 ↘ validation error
                 ↘ unexpected error
```

Disable or deduplicate only the action that must not repeat, retain useful values, move focus when necessary, and announce status changes. A pending state should not erase the form before success is confirmed.

## React form Actions

An Action can receive `FormData`, and React APIs can expose its result and pending state. A simplified client-side shape is:

```tsx
async function saveProfile(previous: FormResult, formData: FormData) {
  // Validate, authorize, persist, and return the next FormResult.
}

const [result, submitAction, isPending] = useActionState(saveProfile, initialState);

return <form action={submitAction}>{/* fields */}</form>;
```

`useFormStatus` reads the status of a parent form submission from a descendant submit component. `useOptimistic` can display an expected result before confirmation. These APIs coordinate UI state; server validation and authorization are still mandatory.

## Return useful validation errors

Use stable field names and return structured errors rather than parsing prose:

```ts
type FormResult = {
  fieldErrors?: Partial<Record<"name" | "email", string>>;
  formError?: string;
};
```

Associate a field error with its control using `aria-describedby`, set `aria-invalid` when appropriate, and provide a summary or focus strategy for failed submission.

## Common traps

- Controlling every field by default.
- Validating only in the browser.
- Disabling submission without explaining pending state.
- Clearing input after a failed request.

## Interview answer

I start from semantic HTML forms, choose controlled state only when live coordination requires it, and keep the server authoritative for validation and permissions. The UI represents idle, pending, success, and error states, prevents duplicate submissions, preserves input on failure, and associates messages with their fields.

## Follow-up questions

### What does `useActionState` provide?

It connects an Action's returned state to the UI and exposes the dispatching Action plus pending status. It does not replace server-side validation or access control.

### Why prefer a real `<form>` over a click handler?

Forms provide Enter-key submission, browser semantics, validation integration, `FormData`, and potential progressive enhancement.

### Should every field be disabled while submitting?

Not automatically. Prevent unsafe duplicate operations while preserving readability, focus, and cancellation or editing behavior required by the product.

## Check yourself

1. When is an uncontrolled input simpler and more robust than controlled state?
2. Which validation must always happen on the server?
3. How do `useActionState` and `useFormStatus` differ?
4. How should field errors be connected accessibly?
5. What should happen to entered values after a failed submission?
