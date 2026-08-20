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

## Compare the strategies

| Strategy | Render time | Strong fit | Main cost |
| --- | --- | --- | --- |
| Client-side rendering | In the browser | Highly interactive application shells | Content waits for JavaScript and often data |
| Server-side rendering | Per request | Personalized or request-dependent HTML | Server latency, capacity, and hydration |
| Static generation | Build or revalidation time | Cacheable public content | Staleness and rebuild/revalidation design |
| Hybrid rendering | Per route or boundary | Most production applications | More architectural decisions |

Rendering HTML on the server does not remove the client application. If the screen is interactive, the browser still downloads, parses, and executes its JavaScript and React hydrates the markup.

## Think in navigation phases

Evaluate the full path:

```text
request → server/data work → HTML arrives → content paints
        → JavaScript loads → hydration → interaction works
```

SSR may improve early content while leaving interaction blocked by a large bundle or long hydration task. CSR may have a slower first visit but fast subsequent client navigations. Cache behavior and user geography can change both conclusions.

## Keep data ownership clear

Serialize the data needed for the first client render so it does not immediately refetch the same resource. Do not expose secrets merely because rendering happens on a server: only serialized output crosses to the browser, and every request still needs authorization.

## Common traps

- Calling SSR automatically faster.
- Treating the application as entirely client- or server-rendered.
- Ignoring hydration and client JavaScript cost.
- Fetching the same data again unnecessarily after hydration.

## Interview answer

I choose rendering boundaries from user journeys, data location, cacheability, and interaction needs. Server rendering can improve initial delivery, while client rendering supports continued interaction. Hybrid architectures usually work best, provided we measure HTML, JavaScript, hydration, and navigation together.

## Follow-up questions

### Are SSR and Server Components the same?

No. SSR produces initial HTML. Server Components define a module and serialization boundary that can keep component code and data access on the server. A framework can use both together.

### When is static output preferable to request-time SSR?

When content can be shared across users and tolerate a defined freshness window. It removes request-time rendering work and is easier to cache globally.

### Does CSR mean the server is unnecessary?

No. The browser may still call servers for data, authentication, mutations, and assets. CSR describes where UI rendering occurs, not the whole system.

## Check yourself

1. Why can fast server HTML still lead to a slow interactive experience?
2. Which route properties favor static generation?
3. What data must be transferred to avoid an immediate duplicate fetch?
4. Which measurements capture both presentation and interactivity?
5. Why is a per-route strategy usually better than one global choice?
