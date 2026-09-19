---
name: addyosmani-perf
description: "Web performance, Core Web Vitals (LCP, INP, CLS), and GPU rendering optimizer based on Addy Osmani's performance principles and Chrome DevTools practices."
repository: "https://github.com/addyosmani/critical"
---

# AddyOsmani-Perf: Web Performance & Core Web Vitals

## Official Ecosystem References
- **Author & Source:** [`addyosmani/critical`](https://github.com/addyosmani/critical), Google Chrome Web Vitals & DevTools Architecture
- **Standards:** Largest Contentful Paint (LCP < 2.5s), Interaction to Next Paint (INP < 200ms), Cumulative Layout Shift (CLS < 0.1).

## Mental Model
High performance is a feature. This skill audits React/Next.js components and browser rendering lifecycles to eliminate main-thread bottlenecks, prevent DOM layout thrashing, and guarantee fluid 60fps / 120fps interactions.

```
[User Action] ──► [Input Delay < 50ms] ──► [Processing / React 19 Transition] ──► [Compositor Presentation < 16ms]
```

## Performance Directives

1. **Interaction to Next Paint (INP) Optimization:**
   - Defer non-urgent state updates using React 19 `useTransition` and `startTransition`.
   - Never block user keystrokes or clicks with expensive synchronous computations; offload to Web Workers or chunk via `requestAnimationFrame`.

2. **Layout Thrashing & Reflow Elimination:**
   - Animate ONLY compositor-friendly CSS properties: `transform`, `opacity`, `filter`.
   - Never animate layout properties: `width`, `height`, `top`, `left`, `margin`, `padding`.
   - Batch DOM read operations before write operations.

3. **Asset & Memory Discipline:**
   - Lazy load heavy below-the-fold components with dynamic imports (`next/dynamic`).
   - Clean up event listeners, intervals, and audio synthesizers in `useEffect` cleanup handlers to eliminate memory leaks.
