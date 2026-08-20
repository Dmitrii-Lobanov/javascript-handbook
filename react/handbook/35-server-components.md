# Chapter 35 — Server Components

## Quick refresher

Server Components execute on the server and send a serialized UI representation rather than their component JavaScript to the browser. Client Components provide state, Effects, event handlers, and browser APIs.

## Why this matters

The boundary changes bundle composition, data access, component APIs, and where interactivity belongs.

## Core mental model

Server Components can access server data directly and compose Client Components:

```tsx
async function ProductPage({ id }: { id: string }) {
  const product = await db.product.find(id);
  return <AddToCart productId={product.id} />;
}
```

Values crossing into a Client Component must be serializable. A client boundary pulls its imported client-side dependency graph into the browser, so keep it as narrow as practical. Server Components are not the same as SSR: SSR produces HTML, while Server Components define a server/client module and data boundary; frameworks may use both.

They cannot use client Hooks or handle browser events. Mutations require an explicit server action or API mechanism with authorization and validation.

## Understand the boundary

| Capability | Server Component | Client Component |
| --- | --- | --- |
| Direct server data access | Yes | Through an API or server mechanism |
| State and Effects | No | Yes |
| Event handlers | No | Yes |
| Browser APIs | No | Yes |
| Contributes component code to client bundle | Normally no | Yes |

“Client Component” does not necessarily mean client-only rendering. Frameworks may use it to produce initial server HTML and later hydrate it in the browser.

## Compose across the boundary

A Client Component cannot directly import a Server Component into its client module graph. A server parent can instead pass already composed server content through a serializable slot such as `children`:

```tsx
<InteractiveShell>
  <ServerRenderedDetails productId={id} />
</InteractiveShell>
```

This preserves server rendering for the details while the shell owns browser interaction.

## Choose the boundary deliberately

Move the client boundary down to the smallest meaningful interactive region, but do not fragment a cohesive widget merely to minimize directives. Consider bundle size, prop serialization, state ownership, and how often server data must be refreshed.

Server Components can remove client-side fetch waterfalls by accessing data near the source, but slow sequential server awaits still create a server waterfall. Start independent work in parallel and place Suspense boundaries around meaningful regions.

## Common traps

- Marking large trees as client components for one interactive leaf.
- Passing functions or nonserializable objects across the boundary.
- Treating Server Components as secure without authorization checks.
- Equating Server Components with server-rendered HTML.

## Interview answer

Server Components keep data access and noninteractive rendering on the server while Client Components define interactive islands. I keep client boundaries narrow, pass serializable props, and compose server content through them where possible. They complement rather than replace SSR, caching, and secure mutation design.

## Follow-up questions

### Can a Server Component pass an event handler to a Client Component?

Not as a normal serializable prop. Interaction logic belongs in the client graph, or the framework must provide an explicit server-function mechanism.

### Are Server Components automatically cached?

No universal React rule makes every Server Component result permanently cached. Rendering and data-cache behavior depend on the framework and resource configuration.

### Can a Client Component receive server-rendered children?

Yes, when a Server Component composes the tree and passes the server content through a supported serializable slot such as `children`.

## Check yourself

1. Why can moving a client boundary upward increase the browser bundle?
2. How do Server Components differ from SSR?
3. Which values can cross into a Client Component?
4. How can server rendering still create a data waterfall?
5. Where should authorization occur for a mutation initiated by this UI?
