---
title: Fluid type scales with clamp() — no breakpoints
description: A reusable set of custom properties that scale headings smoothly between a phone and a wide desktop, plus the tiny formula behind them.
date: 2026-09-10
tags: [css, performance]
languages: [css, js]
browserSupport: "clamp() is supported everywhere that matters (Baseline since 2020)."
---

Most of our department sites used to define heading sizes at three or four breakpoints. The result was type that jumped awkwardly as you resized and a lot of duplicated CSS. `clamp()` replaces all of that with one line per step.

## The pattern

`clamp(MIN, PREFERRED, MAX)` picks the preferred value, but never lets it go below the minimum or above the maximum. Mixing `rem` and `vw` in the preferred value keeps text zoomable.

```css
:root {
  --step--1: clamp(0.83rem, 0.80rem + 0.15vw, 0.90rem);
  --step-0:  clamp(1.00rem, 0.96rem + 0.20vw, 1.06rem);
  --step-1:  clamp(1.20rem, 1.10rem + 0.45vw, 1.40rem);
  --step-2:  clamp(1.45rem, 1.25rem + 0.90vw, 1.90rem);
  --step-3:  clamp(1.80rem, 1.45rem + 1.60vw, 2.60rem);
  --step-4:  clamp(2.30rem, 1.70rem + 2.80vw, 3.90rem);
}

h1 { font-size: var(--step-4); }
h2 { font-size: var(--step-3); }
h3 { font-size: var(--step-2); }
body { font-size: var(--step-0); }
```

{% callout "a11y" %}
Never use a **pure** `vw` value for font size. It ignores the user's browser zoom and fails WCAG 1.4.4 (Resize Text). Always include a `rem` component.
{% endcallout %}

## Deriving the numbers

You don't have to eyeball these. Given a minimum and maximum size and the viewport range you care about, this helper spits out the `clamp()` string:

```js
/**
 * @param {number} minPx   smallest font size (px)
 * @param {number} maxPx   largest font size (px)
 * @param {number} minVw   viewport width where scaling starts (px)
 * @param {number} maxVw   viewport width where scaling stops (px)
 */
function fluid(minPx, maxPx, minVw = 360, maxVw = 1280, base = 16) {
  const slope = (maxPx - minPx) / (maxVw - minVw);
  const intercept = minPx - slope * minVw;
  const r = (n) => +n.toFixed(3);
  return `clamp(${r(minPx / base)}rem, ${r(intercept / base)}rem + ${r(slope * 100)}vw, ${r(maxPx / base)}rem)`;
}

fluid(24, 40); // "clamp(1.5rem, 1.109rem + 1.739vw, 2.5rem)"
```

## Watch it scale

Drag your browser window narrower and wider — the demo frame resizes with the article column.

{% demo "Fluid headings", 280 %}
<h1 style="font-size: clamp(1.6rem, 1rem + 4vw, 3.4rem); margin: 0 0 .4em; line-height: 1.05;">Here Come the Irish</h1>
<h2 style="font-size: clamp(1.2rem, 0.9rem + 2vw, 2rem); margin: 0 0 .6em; color: #c99700;">Fluid, not stepped</h2>
<p style="font-size: clamp(1rem, 0.95rem + 0.3vw, 1.125rem); max-width: 40ch; margin: 0;">Every size here is a single <code>clamp()</code> — no media queries anywhere.</p>
{% enddemo %}
