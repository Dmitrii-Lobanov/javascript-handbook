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

## Fixed-size window calculation

For equal-height rows, the core calculation is small:

```ts
const startIndex = Math.floor(scrollTop / rowHeight);
const visibleCount = Math.ceil(viewportHeight / rowHeight);
const from = Math.max(0, startIndex - overscan);
const to = Math.min(itemCount, startIndex + visibleCount + overscan);
```

Render `items.slice(from, to)` inside a container representing the total height, and offset the visible window by `from * rowHeight`. Production implementations must also schedule scroll updates efficiently and handle resizing.

## Stable identity is not the row index

The virtualization index describes a position in the current window; it is not durable item identity. Use the item's stable ID as its React key, especially when sorting, filtering, inserting, or loading more data.

## Choose the collection strategy

| Strategy | Best fit | Main trade-off |
| --- | --- | --- |
| Ordinary rendering | Small or moderate collections | DOM work grows with the collection |
| Pagination | Shareable, server-queryable result sets | Navigation interrupts continuous browsing |
| Infinite loading | Continuous discovery | Position, recovery, and footer access become harder |
| Virtualization | Very large interactive collections | Focus, measurement, and accessibility complexity |

Infinite loading and virtualization solve different problems: one controls how data is fetched, while the other controls how many rendered nodes exist. They can be used together.

## Preserve user experience

Define how focus, selection, scroll restoration, deep linking, browser search, and assistive technology should behave. If a focused row must remain mounted, include it in the rendered range or move focus intentionally before unmounting it.

## Common traps

- Virtualizing small lists without evidence.
- Using array indices as identities for changing data.
- Ignoring variable row height and focus behavior.
- Optimizing React rendering while expensive cell work remains unchanged.

## Interview answer

Virtualization limits rendering and DOM work to the visible range plus overscan. I use it for genuinely large collections, preferably through a tested library, and account for stable keys, variable measurement, focus, accessibility, and scroll restoration. I compare it with pagination because virtualization is not automatically the best product behavior.

## Follow-up questions

### What is overscan?

It is an extra range rendered before and after the visible window. It reduces blank flashes during scrolling but increases work.

### Why are variable-height rows difficult?

The offset of every later row depends on earlier measurements. A height change invalidates cached positions and may require correcting the scroll offset.

### Does infinite scrolling imply virtualization?

No. Infinite scrolling controls data loading. Without virtualization, the DOM can still grow for the entire session.

## Check yourself

1. What new correctness problems appear when the focused row leaves the virtualized window?
2. How do you calculate the visible range for fixed-height rows?
3. Why should item IDs be used instead of virtual indexes as keys?
4. When is pagination preferable to virtualization?
5. What trade-off does overscan control?
