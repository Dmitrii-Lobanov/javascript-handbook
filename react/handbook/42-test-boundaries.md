# Chapter 42 — Unit, Integration, and E2E Boundaries

## Quick refresher

Unit tests isolate small logic, integration tests combine cooperating UI and services, and end-to-end tests exercise critical journeys in a real browser and deployed-like system.

## Why this matters

Confidence comes from choosing the cheapest boundary that can reveal the relevant failure.

## Core mental model

Use many fast tests for pure complex logic, integration tests for component behavior and data flow, and a smaller E2E suite for critical cross-system journeys. Avoid rigid ratios; risk determines coverage.

```text
formatting rule → unit
autocomplete request and keyboard behavior → integration
sign-in through redirected dashboard → E2E
```

Contract tests can verify boundaries between frontend and APIs. Visual regression tests help with appearance but do not replace behavioral assertions.

## Common traps

- Testing every component in isolation.
- Recreating browser behavior in unit mocks.
- Covering all edge cases only through slow E2E tests.
- Treating line coverage as confidence.

## Interview answer

I choose boundaries by failure risk. Pure decision logic gets unit tests, most React behavior gets integration tests through public UI, and a focused E2E suite protects critical journeys and infrastructure integration. I avoid duplicating identical assertions at every layer.

## Check yourself

Which test boundary best verifies that a form displays a server validation error beside the correct field?
