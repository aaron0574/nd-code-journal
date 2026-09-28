---
title: Cards that lay themselves out with container queries
description: One card component that switches between stacked and side-by-side based on the space it's given — not the viewport. Perfect for CMS regions of unknown width.
date: 2026-08-27
tags: [css, components]
languages: [css, html]
browserSupport: "Size container queries are Baseline (2023) in Chrome, Edge, Firefox and Safari."
---

In a CMS, the same "news card" gets dropped into a full-width region, a two-column row, and a narrow sidebar. Media queries only know about the viewport, so the card can't adapt on its own. Container queries fix exactly that.

## Declare a container

The wrapper opts in to being measured. `inline-size` is almost always what you want.

```css
.card-wrap {
  container: card / inline-size;
}
```

## Style the card from its container's width

```css/0-6
@container card (min-width: 34rem) {
  .card {
    grid-template-columns: 14rem 1fr;
    align-items: center;
  }
  .card__img { aspect-ratio: 1; height: 100%; }
}

.card {
  display: grid;
  gap: 1rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
}
.card__img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
```

{% callout "tip" %}
Container query units (`cqi`) let text scale with the card too: `font-size: clamp(1rem, 4cqi, 1.5rem)`.
{% endcallout %}

## Same card, two slots

{% demo "Container-aware cards", 520 %}
<div class="layout">
  <div class="card-wrap wide">
    <article class="card"><div class="card__img"></div><div class="card__body"><h3>Wide slot</h3><p>With 34rem+ available, the card goes horizontal.</p></div></article>
  </div>
  <div class="card-wrap narrow">
    <article class="card"><div class="card__img"></div><div class="card__body"><h3>Narrow slot</h3><p>Same markup, stacked.</p></div></article>
  </div>
</div>
<style>
  .layout { display: grid; grid-template-columns: minmax(0, 2.2fr) minmax(0, 1fr); gap: 1rem; align-items: start; }
  .card-wrap { container: card / inline-size; }
  .card { display: grid; border: 1px solid #e0dbcd; border-radius: 12px; overflow: hidden; background: #fff; }
  .card__img { aspect-ratio: 16/9; background: linear-gradient(135deg, #0c2340, #2a7ab8); }
  .card__body { padding: 1rem; }
  .card h3 { margin: 0 0 .3rem; font-size: clamp(1rem, 5cqi, 1.5rem); }
  .card p { margin: 0; color: #5b6678; font-size: .9rem; }
  @container card (min-width: 30rem) {
    .card { grid-template-columns: 12rem 1fr; align-items: center; }
    .card__img { aspect-ratio: auto; height: 100%; min-height: 9rem; }
  }
</style>
{% enddemo %}
