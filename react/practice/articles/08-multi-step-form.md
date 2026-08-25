# Multi-step Form

## The interview prompt

Build a multi-step account form. Users must be able to move forward and backward without losing values, validate each step before continuing, review their data, and submit the complete form.

This tutorial starts with navigation and value preservation. Validation, accessible focus, and asynchronous submission are added only after the basic wizard works.

## What we will build

```text
Model steps and values
  ↓
Render the current step
  ↓
Add Back and Continue
  ↓
First working implementation
  ↓
Validate the current step
  ↓
Connect errors accessibly
  ↓
Add review and submission
  ↓
Handle server errors
  ↓
Complete interview solution
```

For a 40–55 minute interview, finish navigation, preserved values, and per-step validation first. Draft persistence, conditional steps, async field validation, and complex state machines are follow-up topics.

## Clarify the requirements

Ask before coding:

1. How many steps exist, and can their order change?
2. Which fields belong to each step?
3. Should users be able to jump directly to earlier or later steps?
4. When should validation run?
5. Must values survive Back navigation?
6. Is there a review step?
7. What does the submit API return on validation failure?
8. Should an unfinished draft survive refresh or navigation?
9. Are any steps conditional?

For this tutorial:

- the flow has Account, Profile, and Review steps;
- Continue validates only the current editable step;
- Back never discards values;
- users cannot skip forward through unfinished steps;
- the review step displays the complete draft;
- server field errors return a keyed error object;
- submission can be retried without clearing values;
- browser persistence and conditional steps are discussed afterward.

## Requirements and deliberate non-requirements

### Required in the interview version

- Controlled field values
- Back and Continue navigation
- Preserved values across steps
- Per-step validation
- Accessible field errors
- Review step
- Pending, success, and server-error submission states
- Focus movement after navigation or validation failure
- Prevention of duplicate submission

### Explain, but do not necessarily finish

- Conditional or dynamically inserted steps
- Saving drafts locally or remotely
- Asynchronous field validation
- File uploads
- Browser navigation and URL synchronization
- Cross-device draft recovery
- Analytics and abandonment tracking
- Complex schema-library integration

## System design before implementation

Use GreatFrontEnd's [RADIO framework](https://www.greatfrontend.com/front-end-system-design-playbook/framework) to establish the design before defining TypeScript types.

```text
R — Requirements
A — Architecture
D — Data model
I — Interfaces
O — Optimizations and deep dives
```

For a live-coding interview, the design pass should be short: agree on ownership, transitions, and validation boundaries, then build a complete vertical slice.

### R — Requirements

The core journey is:

```text
enter account data
  → validate
  → enter profile data
  → validate
  → review complete draft
  → submit
  → show success or recoverable errors
```

Important non-functional requirements are:

- **Correctness:** navigation never loses committed input or bypasses required validation.
- **Accessibility:** steps, errors, progress, focus changes, and pending state are understandable.
- **Recoverability:** failed submission retains the draft and allows correction.
- **Maintainability:** field values, errors, navigation, and submission have distinct ownership.
- **Interview scope:** the core flow must work without requiring a form or state-machine library.

### A — Architecture

Keep coordination in one form component and split visual steps only when that improves readability:

```text
AccountSetupForm
├── step/progress navigation
├── shared draft state
├── validation coordinator
├── submission coordinator
└── current step
    ├── AccountStep
    ├── ProfileStep
    └── ReviewStep
```

Responsibilities:

| Boundary | Responsibility |
| --- | --- |
| Form coordinator | Owns step index, complete draft, errors, and submission status |
| Step components | Render fields and report value changes without owning duplicate drafts |
| Validation functions | Convert draft data into structured field errors |
| Submit function | Sends the complete valid draft and returns authoritative errors or success |
| Progress UI | Communicates location without becoming an unrestricted navigation API |

Use unidirectional flow:

```text
field change
  → update one property in the shared draft
  → optionally clear that field's stale error

Continue
  → validate current step
  → show and focus first error
  → otherwise increment step

Submit
  → validate complete draft
  → enter pending state
  → reconcile success or server errors
```

One component is acceptable during live coding. Extract steps after the state flow is clear; component splitting does not require splitting the source of truth.

### D — Data model

Separate the draft, navigation, validation, and asynchronous status:

| Data | Owner | Stored or derived? |
| --- | --- | --- |
| Complete form values | Form coordinator | State |
| Current step index | Form coordinator | State |
| Field errors | Form coordinator | State |
| Submission status | Form coordinator | State union |
| Current step definition | Steps and index | Derived |
| Is first/last step | Current index | Derived |
| Progress percentage | Index and step count | Derived |
| Current step fields | Step definition | Derived |

Do not create an independent values object inside every step and synchronize it upward later. One shared draft naturally preserves values when step components unmount.

Use structured errors keyed by field:

```ts
type FieldErrors = Partial<Record<keyof FormValues, string>>;
```

Maintain these invariants:

1. The current step index always identifies an existing step.
2. Moving backward never requires validation and never clears values.
3. Moving forward occurs only when the current step has no errors.
4. Submission occurs only from the final step with a valid complete draft.
5. Pending submission cannot be started twice.
6. Failed submission preserves the user's draft.
7. Every displayed field error is associated with its input.

### I — Interfaces

The form accepts an asynchronous submission function:

```ts
type SubmitResult =
  | { ok: true }
  | {
      ok: false;
      fieldErrors?: FieldErrors;
      formError?: string;
    };

type MultiStepFormProps = {
  submitForm: (values: FormValues) => Promise<SubmitResult>;
  initialValues?: Partial<FormValues>;
};
```

Step components can use a small controlled contract:

```ts
type StepProps = {
  values: FormValues;
  errors: FieldErrors;
  onChange: <K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) => void;
};
```

This keeps validation and navigation in the coordinator while steps remain reusable render boundaries.

The server interface should return structured field errors rather than prose that the client must parse. The server remains authoritative for validation, uniqueness, permissions, and persistence even when the client validates first for responsiveness.

### O — Optimizations and deep dives

#### Validate at the right boundary

Validate the current step on Continue and the full draft before final submission. Immediate validation on every keystroke can be noisy; blur or submit-driven validation is often easier to understand.

#### Preserve values without preserving every component

Unmounting inactive steps is safe when their values live in the coordinator. If a step owns other local UI state such as an expanded picker or upload progress, decide explicitly whether that state should survive navigation.

#### Model conditional steps from stable IDs

When steps appear conditionally, identify them by stable IDs rather than relying only on indexes. If the active step disappears, move to a valid neighboring step and revalidate fields affected by the condition.

#### Protect asynchronous validation

Username or email availability checks can finish out of order. Debounce external work, cancel obsolete requests where possible, and associate results with the value that initiated them.

#### Persist drafts deliberately

Local storage can recover accidental refreshes but may retain sensitive values or stale schemas. Define allowed fields, expiration, versioning, migration, and explicit clearing after success. Never persist passwords in this example.

#### Keep progress semantic

Use an ordered list or descriptive text such as “Step 2 of 3.” A visual progress bar alone does not communicate step names or validation state.

#### Avoid premature global state

A form coordinator is already a natural owner. Introduce Context or an external store only when deeply nested, dynamic step composition makes explicit props impractical—not merely because the form has several fields.

With RADIO covered, define the concrete draft and error types before rendering the first step.

## Define the types first

```tsx
export type FormValues = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type FieldErrors = Partial<
  Record<keyof FormValues, string>
>;

export type SubmitResult =
  | { ok: true }
  | {
      ok: false;
      fieldErrors?: FieldErrors;
      formError?: string;
    };

type MultiStepFormProps = {
  submitForm: (values: FormValues) => Promise<SubmitResult>;
  initialValues?: Partial<FormValues>;
};

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "success" };
```

Use an explicit status union so submitting, error, and success cannot contradict one another.

Define the ordered steps once:

```tsx
const steps = [
  { id: "account", title: "Account" },
  { id: "profile", title: "Profile" },
  { id: "review", title: "Review" },
] as const;
```

## Step 1 — Model the shared draft

Start with one values object owned by the form:

```tsx
const emptyValues: FormValues = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
};

const [values, setValues] = useState<FormValues>({
  ...emptyValues,
  ...initialValues,
});

function updateField<K extends keyof FormValues>(
  field: K,
  value: FormValues[K],
) {
  setValues(current => ({
    ...current,
    [field]: value,
  }));
}
```

The generic function preserves the relationship between a field name and its value type. The functional update uses the latest draft when React processes the change.

## Step 2 — Render the current step

Store only the current index and derive the step:

```tsx
const [stepIndex, setStepIndex] = useState(0);
const currentStep = steps[stepIndex];
```

Render fields from the current step ID:

```tsx
{currentStep.id === "account" && (
  <fieldset>
    <legend>Account details</legend>

    <label htmlFor="email">Email</label>
    <input
      id="email"
      type="email"
      value={values.email}
      onChange={event => updateField("email", event.target.value)}
    />

    <label htmlFor="password">Password</label>
    <input
      id="password"
      type="password"
      value={values.password}
      onChange={event => updateField("password", event.target.value)}
    />
  </fieldset>
)}

{currentStep.id === "profile" && (
  <fieldset>
    <legend>Profile details</legend>

    <label htmlFor="firstName">First name</label>
    <input
      id="firstName"
      value={values.firstName}
      onChange={event => updateField("firstName", event.target.value)}
    />

    <label htmlFor="lastName">Last name</label>
    <input
      id="lastName"
      value={values.lastName}
      onChange={event => updateField("lastName", event.target.value)}
    />
  </fieldset>
)}
```

Because the values live above the conditional step markup, unmounting a step does not discard its input.

## Step 3 — Add Back and Continue

For the first checkpoint, navigation is intentionally simple:

```tsx
function goBack() {
  setStepIndex(current => Math.max(0, current - 1));
}

function goForward() {
  setStepIndex(current =>
    Math.min(steps.length - 1, current + 1),
  );
}
```

Render navigation outside the step fields:

```tsx
<div>
  {stepIndex > 0 && (
    <button type="button" onClick={goBack}>
      Back
    </button>
  )}

  {stepIndex < steps.length - 1 && (
    <button type="button" onClick={goForward}>
      Continue
    </button>
  )}
</div>
```

Buttons that do not submit must use `type="button"` when rendered inside a form.

## First working implementation

This checkpoint proves navigation and value preservation:

```tsx
import { useState } from "react";

type FormValues = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

const steps = ["Account", "Profile", "Review"] as const;

const emptyValues: FormValues = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
};

export function BasicMultiStepForm() {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState(emptyValues);

  function updateField<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues(current => ({ ...current, [field]: value }));
  }

  return (
    <form onSubmit={event => event.preventDefault()}>
      <p>Step {stepIndex + 1} of {steps.length}: {steps[stepIndex]}</p>

      {stepIndex === 0 && (
        <fieldset>
          <legend>Account details</legend>
          <label htmlFor="basic-email">Email</label>
          <input
            id="basic-email"
            type="email"
            value={values.email}
            onChange={event => updateField("email", event.target.value)}
          />
          <label htmlFor="basic-password">Password</label>
          <input
            id="basic-password"
            type="password"
            value={values.password}
            onChange={event => updateField("password", event.target.value)}
          />
        </fieldset>
      )}

      {stepIndex === 1 && (
        <fieldset>
          <legend>Profile details</legend>
          <label htmlFor="basic-first-name">First name</label>
          <input
            id="basic-first-name"
            value={values.firstName}
            onChange={event => updateField("firstName", event.target.value)}
          />
          <label htmlFor="basic-last-name">Last name</label>
          <input
            id="basic-last-name"
            value={values.lastName}
            onChange={event => updateField("lastName", event.target.value)}
          />
        </fieldset>
      )}

      {stepIndex === 2 && (
        <dl>
          <dt>Email</dt><dd>{values.email}</dd>
          <dt>Name</dt><dd>{values.firstName} {values.lastName}</dd>
        </dl>
      )}

      <div>
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={() => setStepIndex(current => current - 1)}
          >
            Back
          </button>
        )}
        {stepIndex < steps.length - 1 && (
          <button
            type="button"
            onClick={() => setStepIndex(current => current + 1)}
          >
            Continue
          </button>
        )}
      </div>
    </form>
  );
}
```

Its remaining limitations are explicit:

- Continue does not validate;
- errors are not modeled;
- focus does not move after step changes;
- review cannot submit;
- server failure is not represented.

## Step 4 — Validate one step at a time

Use pure functions so validation is easy to test:

```tsx
function validateAccount(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.email.trim()) {
    errors.email = "Enter an email address.";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (values.password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  return errors;
}

function validateProfile(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "Enter your first name.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Enter your last name.";
  }

  return errors;
}
```

Choose the validator from the current step:

```tsx
function validateStep(stepId: string, values: FormValues) {
  if (stepId === "account") return validateAccount(values);
  if (stepId === "profile") return validateProfile(values);
  return {};
}

function continueToNextStep() {
  const nextErrors = validateStep(currentStep.id, values);
  setErrors(nextErrors);

  if (Object.keys(nextErrors).length > 0) return;

  setStepIndex(current => current + 1);
}
```

Back navigation does not validate because it does not claim that the current step is complete.

## Step 5 — Render and clear field errors

Associate every message with its field:

```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  value={values.email}
  aria-invalid={Boolean(errors.email)}
  aria-describedby={errors.email ? "email-error" : undefined}
  onChange={event => updateField("email", event.target.value)}
/>
{errors.email && (
  <p id="email-error">{errors.email}</p>
)}
```

Clear a stale field error when the user edits that field:

```tsx
function updateField<K extends keyof FormValues>(
  field: K,
  value: FormValues[K],
) {
  setValues(current => ({ ...current, [field]: value }));
  setErrors(current => {
    if (!current[field]) return current;
    const next = { ...current };
    delete next[field];
    return next;
  });
}
```

Clearing does not assert that the new value is valid. It removes a message about the previous value; validation runs again on Continue.

## Step 6 — Manage focus after transitions

After successful navigation, focus the new step heading. After validation failure, focus the first invalid field.

```tsx
const stepHeadingRef = useRef<HTMLHeadingElement>(null);

useEffect(() => {
  stepHeadingRef.current?.focus();
}, [stepIndex]);
```

Render the heading as a programmatic focus target:

```tsx
<h2 ref={stepHeadingRef} tabIndex={-1}>
  {currentStep.title}
</h2>
```

For errors, keep refs by field or query the form through a safe field mapping:

```tsx
const fieldRefs = useRef(
  new Map<keyof FormValues, HTMLInputElement>(),
);

function focusFirstError(errors: FieldErrors) {
  const field = Object.keys(errors)[0] as keyof FormValues | undefined;
  if (field) fieldRefs.current.get(field)?.focus();
}
```

Call `focusFirstError(nextErrors)` after storing validation errors. Focus communicates the failed transition immediately; the inline messages provide persistent explanation.

## Step 7 — Add review and submission

The review step contains a real submit button:

```tsx
{currentStep.id === "review" && (
  <>
    <dl>
      <dt>Email</dt>
      <dd>{values.email}</dd>
      <dt>Name</dt>
      <dd>{values.firstName} {values.lastName}</dd>
    </dl>

    <button
      type="submit"
      disabled={submission.status === "submitting"}
    >
      {submission.status === "submitting"
        ? "Creating account…"
        : "Create account"}
    </button>
  </>
)}
```

Submit through the form event:

```tsx
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if (currentStep.id !== "review") return;
  if (submission.status === "submitting") return;

  const allErrors = {
    ...validateAccount(values),
    ...validateProfile(values),
  };

  if (Object.keys(allErrors).length > 0) {
    setErrors(allErrors);
    return;
  }

  setSubmission({ status: "submitting" });
  const result = await submitForm(values);

  if (result.ok) {
    setSubmission({ status: "success" });
    return;
  }

  setErrors(result.fieldErrors ?? {});
  setSubmission({
    status: "error",
    message: result.formError ?? "Account creation failed.",
  });
}
```

If the server returns a field error from an earlier step, navigate to that step and focus the field. The complete solution includes a helper for that mapping.

## Complete solution

```tsx
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

export type FormValues = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

type SubmitResult =
  | { ok: true }
  | {
      ok: false;
      fieldErrors?: FieldErrors;
      formError?: string;
    };

type MultiStepFormProps = {
  submitForm: (values: FormValues) => Promise<SubmitResult>;
  initialValues?: Partial<FormValues>;
};

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "success" };

const steps = [
  { id: "account", title: "Account", fields: ["email", "password"] },
  { id: "profile", title: "Profile", fields: ["firstName", "lastName"] },
  { id: "review", title: "Review", fields: [] },
] as const;

const emptyValues: FormValues = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
};

function validateAccount(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.email.trim()) {
    errors.email = "Enter an email address.";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (values.password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  return errors;
}

function validateProfile(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!values.lastName.trim()) errors.lastName = "Enter your last name.";
  return errors;
}

function validateStep(stepId: string, values: FormValues): FieldErrors {
  if (stepId === "account") return validateAccount(values);
  if (stepId === "profile") return validateProfile(values);
  return {};
}

function getStepIndexForField(field: keyof FormValues) {
  return field === "email" || field === "password" ? 0 : 1;
}

export function MultiStepForm({
  submitForm,
  initialValues = {},
}: MultiStepFormProps) {
  const [values, setValues] = useState<FormValues>({
    ...emptyValues,
    ...initialValues,
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submission, setSubmission] = useState<SubmissionState>({
    status: "idle",
  });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fieldRefs = useRef(new Map<keyof FormValues, HTMLInputElement>());
  const pendingFocusFieldRef = useRef<keyof FormValues | null>(null);
  const hasMountedRef = useRef(false);

  const currentStep = steps[stepIndex];

  useEffect(() => {
    // Do not steal focus when the form first appears on the page.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const pendingField = pendingFocusFieldRef.current;

    if (pendingField) {
      pendingFocusFieldRef.current = null;
      fieldRefs.current.get(pendingField)?.focus();
      return;
    }

    headingRef.current?.focus();
  }, [stepIndex]);

  function updateField<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues(current => ({ ...current, [field]: value }));
    setErrors(current => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (submission.status === "error") {
      setSubmission({ status: "idle" });
    }
  }

  function registerField(
    field: keyof FormValues,
    element: HTMLInputElement | null,
  ) {
    if (element) fieldRefs.current.set(field, element);
    else fieldRefs.current.delete(field);
  }

  function focusFirstError(nextErrors: FieldErrors) {
    const field = Object.keys(nextErrors)[0] as
      | keyof FormValues
      | undefined;
    if (field) fieldRefs.current.get(field)?.focus();
  }

  function continueToNextStep() {
    const nextErrors = validateStep(currentStep.id, values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }

    setStepIndex(current => current + 1);
  }

  function goBack() {
    setErrors({});
    setStepIndex(current => Math.max(0, current - 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (currentStep.id !== "review") return;
    if (submission.status === "submitting") return;

    const nextErrors = {
      ...validateAccount(values),
      ...validateProfile(values),
    };

    if (Object.keys(nextErrors).length > 0) {
      const firstField = Object.keys(nextErrors)[0] as keyof FormValues;
      setErrors(nextErrors);
      pendingFocusFieldRef.current = firstField;
      setStepIndex(getStepIndexForField(firstField));
      return;
    }

    setSubmission({ status: "submitting" });

    try {
      const result = await submitForm(values);

      if (result.ok) {
        setSubmission({ status: "success" });
        return;
      }

      const serverErrors = result.fieldErrors ?? {};
      const firstField = Object.keys(serverErrors)[0] as
        | keyof FormValues
        | undefined;

      setErrors(serverErrors);
      setSubmission({
        status: "error",
        message: result.formError ?? "Account creation failed.",
      });

      if (firstField) {
        pendingFocusFieldRef.current = firstField;
        setStepIndex(getStepIndexForField(firstField));
      }
    } catch {
      setSubmission({
        status: "error",
        message: "The request failed. Try again.",
      });
    }
  }

  if (submission.status === "success") {
    return (
      <section aria-labelledby="account-created-title">
        <h2 id="account-created-title">Account created</h2>
        <p>Your account is ready.</p>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p aria-live="polite">
        Step {stepIndex + 1} of {steps.length}
      </p>
      <h2 ref={headingRef} tabIndex={-1}>
        {currentStep.title}
      </h2>

      {currentStep.id === "account" && (
        <fieldset>
          <legend>Account details</legend>

          <label htmlFor="email">Email</label>
          <input
            ref={element => registerField("email", element)}
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            onChange={event => updateField("email", event.target.value)}
          />
          {errors.email && <p id="email-error">{errors.email}</p>}

          <label htmlFor="password">Password</label>
          <input
            ref={element => registerField("password", element)}
            id="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            onChange={event => updateField("password", event.target.value)}
          />
          {errors.password && <p id="password-error">{errors.password}</p>}
        </fieldset>
      )}

      {currentStep.id === "profile" && (
        <fieldset>
          <legend>Profile details</legend>

          <label htmlFor="firstName">First name</label>
          <input
            ref={element => registerField("firstName", element)}
            id="firstName"
            autoComplete="given-name"
            value={values.firstName}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
            onChange={event => updateField("firstName", event.target.value)}
          />
          {errors.firstName && (
            <p id="firstName-error">{errors.firstName}</p>
          )}

          <label htmlFor="lastName">Last name</label>
          <input
            ref={element => registerField("lastName", element)}
            id="lastName"
            autoComplete="family-name"
            value={values.lastName}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
            onChange={event => updateField("lastName", event.target.value)}
          />
          {errors.lastName && <p id="lastName-error">{errors.lastName}</p>}
        </fieldset>
      )}

      {currentStep.id === "review" && (
        <section aria-labelledby="review-title">
          <h3 id="review-title">Review your details</h3>
          <dl>
            <dt>Email</dt>
            <dd>{values.email}</dd>
            <dt>Name</dt>
            <dd>{values.firstName} {values.lastName}</dd>
          </dl>
        </section>
      )}

      {submission.status === "error" && (
        <p role="alert">{submission.message}</p>
      )}

      <div>
        {stepIndex > 0 && (
          <button
            type="button"
            disabled={submission.status === "submitting"}
            onClick={goBack}
          >
            Back
          </button>
        )}

        {stepIndex < steps.length - 1 ? (
          <button type="button" onClick={continueToNextStep}>
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={submission.status === "submitting"}
          >
            {submission.status === "submitting"
              ? "Creating account…"
              : "Create account"}
          </button>
        )}
      </div>
    </form>
  );
}
```

## Example usage

```tsx
async function createAccount(
  values: FormValues,
): Promise<SubmitResult> {
  const response = await fetch("/api/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (response.ok) return { ok: true };

  if (response.status === 409) {
    return {
      ok: false,
      fieldErrors: {
        email: "An account already uses this email.",
      },
    };
  }

  return {
    ok: false,
    formError: "Account creation failed.",
  };
}

export function AccountPage() {
  return <MultiStepForm submitForm={createAccount} />;
}
```

The client improves feedback, but the server still validates all values and permissions.

## Minimal CSS

```css
.multi-step-form {
  display: grid;
  gap: 1rem;
  max-width: 36rem;
}

.multi-step-form fieldset {
  display: grid;
  gap: 0.5rem;
  border: 0;
  padding: 0;
}

.multi-step-form input[aria-invalid="true"] {
  border-color: #b91c1c;
}

.multi-step-form__actions {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}
```

The complete JSX can add these class names without changing its behavior. Do not remove visible focus styles.

## Complexity

Let `f` be the number of fields and `s` the number of steps:

- field update: `O(f)` because the draft object is copied;
- current-step validation: `O(fields in step)`;
- complete validation: `O(f)`;
- step lookup by index: `O(1)`;
- stored draft and errors: `O(f)`.

For ordinary forms, clarity dominates these small costs. Schema compilation or field-level subscriptions matter only for unusually large, dynamic forms.

## Testing strategy

### Navigation and values

1. The first step renders initially.
2. Continue moves to the next valid step.
3. Back returns without clearing values.
4. Users cannot continue past invalid fields.
5. Review displays values from all steps.

### Validation and accessibility

6. Errors are associated with their inputs.
7. The first invalid field receives focus.
8. Editing clears the stale error for that field.
9. A new step heading receives focus after navigation.
10. Progress communicates the current position.

### Submission

11. Submit receives the complete draft once.
12. Pending state prevents duplicate submission.
13. A form-level server error retains values.
14. A server field error navigates to its owning step.
15. Success replaces the form with confirmation.

Mock only the `submitForm` boundary. Interact through labels and buttons, then assert visible steps, errors, focus, pending UI, and submitted values.

## Common interview mistakes

- Giving each step an independent draft and synchronizing on navigation.
- Storing the current step component in state.
- Validating every future step before users reach it.
- Clearing values when a step unmounts.
- Allowing Continue to submit the form accidentally.
- Using contradictory `isLoading`, `isError`, and `isSuccess` booleans.
- Displaying errors without `aria-describedby` and `aria-invalid`.
- Moving steps without managing focus.
- Clearing the form before the server confirms success.
- Trusting client validation as the security boundary.
- Adding Context, reducers, schemas, and persistence before navigation works.

## Senior follow-up discussion

### Would you use a reducer?

Use one when transitions become numerous or conditional: `fieldChanged`, `continued`, `wentBack`, `submitted`, `serverRejected`, and `succeeded`. A reducer centralizes transition rules but does not replace validation or make state global.

### How would you support browser Back?

Put the step ID in the URL and derive the active step from routing state. Define whether invalid forward navigation is redirected, how drafts survive route remounts, and whether every step is shareable.

### How would you save drafts?

Debounce persistence of allowed fields, version the stored shape, show save status, reconcile server drafts, and clear the draft after success. Exclude secrets such as passwords.

### How would you add conditional steps?

Derive a list of active step definitions from the current draft. Track the active step by stable ID, remove errors for fields that no longer apply, and choose a valid next step when conditions change.

### Why not use a form library in the interview?

The exercise evaluates state ownership, validation, transitions, and accessibility. A library is reasonable in production, especially for large forms, but should not hide the reasoning the interviewer asked to observe.

## Interview-ready explanation

I keep one complete draft in the form coordinator so unmounting steps never loses values. The current step is an index into stable step definitions; the rendered step, progress, and navigation flags are derived. Continue validates only the current step, Back never validates, and errors are structured by field and connected to their controls. After navigation I focus the new heading; after failure I focus the first invalid field. The final submit validates the complete draft, prevents duplicate requests, preserves values on failure, and maps server field errors back to the correct step. Conditional steps, draft persistence, async validation, and a reducer are production extensions rather than prerequisites for the first working interview solution.

## Final checklist

- [ ] One shared draft owns all step values.
- [ ] Back navigation preserves input.
- [ ] Continue validates only the current step.
- [ ] Field errors are structured and associated accessibly.
- [ ] Focus moves after navigation and validation failure.
- [ ] Review derives from the complete draft.
- [ ] Submit validates everything again.
- [ ] Pending state prevents duplicate submission.
- [ ] Server errors preserve values and support retry.
- [ ] Production extensions remain separate from the baseline.
