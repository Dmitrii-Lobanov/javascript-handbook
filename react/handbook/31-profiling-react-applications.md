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

## Common traps

- Profiling only development behavior.
- Recording many unrelated interactions in one trace.
- Comparing runs with different inputs or cache state.
- Optimizing the tallest-looking component without checking duration.
- Declaring success without repeating the user-visible measurement.

## Interview answer

I profile a specific slow interaction with representative data, identify the relevant commit, and inspect component duration and render causes. I correlate React work with the browser timeline so I do not mistake layout or scripting for React cost. After one targeted change, I repeat the same scenario and compare both the profile and user-facing latency.

## Check yourself

What should you investigate when React commits are short but the browser still misses frames?
