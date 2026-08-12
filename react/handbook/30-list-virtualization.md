# Chapter 30 — List Virtualization

## Quick refresher

Virtualization renders only the visible window of a large collection plus a small overscan region, while preserving the scrollable size.

## Why this matters

Large DOM trees increase React rendering, browser style and layout work, memory use, and update cost. Virtualization bounds that work, but adds scrolling and accessibility complexity.

## Core mental model

```text
10,000 data items
      ↓
scroll position + viewport size
      ↓
render items 240–280
      ↓
offset them within a full-height container
```

Use a proven library unless the interview explicitly asks for implementation. The essential inputs are item count, viewport size, scroll offset, estimated or measured row sizes, overscan, and stable item identity.

Fixed-height rows are simpler. Variable heights require measurement, cache invalidation, and scroll-position correction. Overscan reduces blank flashes during fast scrolling but increases rendered work.

Virtualization affects keyboard navigation, focus, browser find, screen-reader navigation, printing, and scroll restoration. Focused items should not disappear unexpectedly, and list position can be communicated with appropriate semantics such as `aria-posinset` and `aria-setsize` when needed.

Pagination or incremental rendering may be better when users need shareable pages, complete document semantics, or server-side query boundaries.

## Common traps

- Virtualizing small lists without evidence.
- Using array indices as identities for changing data.
- Ignoring variable row height and focus behavior.
- Optimizing React rendering while expensive cell work remains unchanged.

## Interview answer

Virtualization limits rendering and DOM work to the visible range plus overscan. I use it for genuinely large collections, preferably through a tested library, and account for stable keys, variable measurement, focus, accessibility, and scroll restoration. I compare it with pagination because virtualization is not automatically the best product behavior.

## Check yourself

What new correctness problems appear when the focused row scrolls outside the virtualized window?
