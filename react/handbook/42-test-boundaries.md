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

## Compare the boundaries

| Boundary | Best at finding | Main limitation |
| --- | --- | --- |
| Unit | Pure logic and edge cases | Low confidence in integration |
| Component/integration | UI behavior, providers, routing, and requests | Simulated browser environment may differ |
| Contract | Frontend/API shape incompatibility | Does not prove complete user behavior |
| E2E | Critical browser and system journeys | Slower, costlier, and harder to diagnose |
| Visual regression | Unintended appearance changes | Cannot establish interaction correctness |

A component test that renders real child components and intercepts only the network is often more valuable than isolated tests for every component in the tree.

## Choose from the failure mode

Ask where the likely defect lives and what environment is required to expose it. Keyboard logic may fit an integration test; focus behavior involving a portal may require a real browser; payment completion may need a focused E2E journey plus lower-level tests for validation logic.

## Avoid duplicated coverage

Do not repeat every happy-path assertion at all layers. Use unit tests for combinatorial pure cases, integration tests for most UI branches, and E2E tests as a thin protection around revenue, authentication, critical creation flows, and infrastructure wiring.

## Make E2E tests deterministic

Create isolated data, use stable user-visible locators, wait for observable conditions instead of sleeps, and control third-party dependencies where appropriate. A flaky test that teams ignore provides little protection.

## Common traps

- Testing every component in isolation.
- Recreating browser behavior in unit mocks.
- Covering all edge cases only through slow E2E tests.
- Treating line coverage as confidence.

## Interview answer

I choose boundaries by failure risk. Pure decision logic gets unit tests, most React behavior gets integration tests through public UI, and a focused E2E suite protects critical journeys and infrastructure integration. I avoid duplicating identical assertions at every layer.

## Follow-up questions

### Is a component test a unit test?

The label matters less than the boundary. A rendered component with real children, providers, and intercepted HTTP behaves as an integration test even if it runs quickly in one process.

### What belongs in E2E coverage?

Critical journeys whose risk crosses browser, routing, backend, authentication, or deployment boundaries—not every validation permutation.

### What does code coverage miss?

It shows which code executed, not whether assertions were meaningful, requirements were covered, or realistic integrations worked.

## Check yourself

1. Which boundary best verifies that a form displays a server validation error beside the correct field?
2. When does focus behavior require a real browser test?
3. Which cases should be moved out of an expensive E2E test?
4. How do contract tests complement UI tests?
5. Why is a target coverage percentage not a testing strategy?
