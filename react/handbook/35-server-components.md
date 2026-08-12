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

## Common traps

- Marking large trees as client components for one interactive leaf.
- Passing functions or nonserializable objects across the boundary.
- Treating Server Components as secure without authorization checks.
- Equating Server Components with server-rendered HTML.

## Interview answer

Server Components keep data access and noninteractive rendering on the server while Client Components define interactive islands. I keep client boundaries narrow, pass serializable props, and compose server content through them where possible. They complement rather than replace SSR, caching, and secure mutation design.

## Check yourself

Why can moving a client boundary upward increase the browser bundle?
