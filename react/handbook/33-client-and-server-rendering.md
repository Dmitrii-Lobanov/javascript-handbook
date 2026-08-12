# Chapter 33 — Client and Server Rendering

## Quick refresher

Client rendering builds UI in the browser. Server rendering produces initial HTML on the server; client JavaScript can then hydrate it. Modern applications commonly combine strategies by route and component.

## Why this matters

Rendering location affects startup cost, SEO, caching, data access, interactivity, and operational complexity.

## Core mental model

```text
CSR: shell → JavaScript → data → UI
SSR: request → server HTML → browser display → hydration
```

CSR supports rich navigation but can delay useful content behind JavaScript and data waterfalls. SSR can show content earlier and access server resources directly, but adds server work, hydration cost, and consistency requirements. Static generation moves rendering to build or revalidation time.

Choose per route: public content may favor server or static output; highly interactive authenticated screens may rely more on client behavior. Measure complete navigation and interaction, not only HTML arrival.

## Common traps

- Calling SSR automatically faster.
- Treating the application as entirely client- or server-rendered.
- Ignoring hydration and client JavaScript cost.
- Fetching the same data again unnecessarily after hydration.

## Interview answer

I choose rendering boundaries from user journeys, data location, cacheability, and interaction needs. Server rendering can improve initial delivery, while client rendering supports continued interaction. Hybrid architectures usually work best, provided we measure HTML, JavaScript, hydration, and navigation together.

## Check yourself

Why can fast server HTML still lead to a slow interactive experience?
