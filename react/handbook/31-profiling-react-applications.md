# Chapter 31 — Profiling React Applications

## Quick refresher

The React Profiler records commits, component render durations, and update causes. Browser performance tools show the wider main-thread, layout, paint, and network picture.

## Why this matters

Optimization without a reproducible profile is guessing. React timing must also be connected to the user interaction and browser work that users experience.

## Core mental model

Use a controlled workflow:

1. Define the slow interaction and success measure.
2. Reproduce with realistic data and hardware.
3. Record a baseline in a production-like build.
4. Locate the relevant commit.
5. Inspect the flamegraph or ranked view and render reasons.
6. Form one hypothesis and make one targeted change.
7. repeat the same recording and compare.

The Profiler distinguishes **actual duration**, the work performed for a commit, from **base duration**, an estimate of rendering the subtree without memoization. A component appearing in a flamegraph does not prove it is the bottleneck; inspect its duration and whether it lies on the delayed interaction path.

Use the browser Performance panel when React finishes quickly but the frame remains slow. Layout, paint, garbage collection, event handlers, third-party scripts, or network waits may dominate.

The `<Profiler>` API can collect targeted timings in code, but production instrumentation should be sampled carefully because profiling itself has overhead.

## Read the evidence correctly

| Signal | What it tells you |
| --- | --- |
| Commit duration | Time React spent completing a particular update |
| Component actual duration | Time spent rendering that subtree in this update |
| Component base duration | Estimated cost without successful memoization |
| Render reason | Which prop, state, or Hook change contributed |
| Browser long task | Main-thread work blocked responsiveness beyond React alone |

Profiles are comparative evidence, not exact universal timings. Hardware, build mode, browser extensions, data size, cache state, and recording overhead affect results.

## Connect to user-facing metrics

For an interaction, measure latency from input to the next meaningful paint. For loading, consider Core Web Vitals and route-specific milestones. A faster React commit is useful only if it improves the experience or creates enough main-thread headroom to do so.

## Form a falsifiable hypothesis

Prefer “moving query state into `SearchPanel` will prevent the chart subtree from rendering on each keypress” over “add memoization.” The first predicts a trace change and identifies the mechanism. Change one important variable, repeat the same scenario, and keep the optimization only if the evidence improves.

## Development caveats

Strict Mode deliberately repeats certain development work to expose unsafe logic. Development includes warnings and instrumentation absent from optimized production builds. Use development profiles for debugging render causes, then confirm performance conclusions in a production-like environment.

## Common traps

- Profiling only development behavior.
- Recording many unrelated interactions in one trace.
- Comparing runs with different inputs or cache state.
- Optimizing the tallest-looking component without checking duration.
- Declaring success without repeating the user-visible measurement.

## Interview answer

I profile a specific slow interaction with representative data, identify the relevant commit, and inspect component duration and render causes. I correlate React work with the browser timeline so I do not mistake layout or scripting for React cost. After one targeted change, I repeat the same scenario and compare both the profile and user-facing latency.

## Follow-up questions

### What is the difference between actual and base duration?

Actual duration is the measured render cost for this update. Base duration estimates the cost if the entire subtree rendered without successful memoization.

### Why profile a production-like build?

Development warnings, instrumentation, and Strict Mode behavior can distort timings. Production-like profiling better represents shipped performance.

### What if the React commit is fast but the interaction is slow?

Inspect the browser trace for event-handler work, layout, paint, garbage collection, network dependencies, and third-party scripts.

## Check yourself

1. What should you investigate when React commits are short but the browser still misses frames?
2. Why should a profile contain one controlled interaction?
3. How do actual duration and base duration differ?
4. What makes a performance hypothesis falsifiable?
5. Why can development render counts be misleading?
