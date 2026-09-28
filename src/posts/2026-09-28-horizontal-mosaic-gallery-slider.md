---
title: A horizontally scrolling mosaic gallery with CSS Grid
description: How the photo gallery on the nd.edu homepage turns CSS Grid on its side to make a scrolling mosaic, with a 12-tile repeating pattern, scroll snapping and about 20 lines of JavaScript for the arrows.
date: 2026-09-28
tags: [css, components, javascript]
languages: [css, html, js]
browserSupport: "CSS Grid, container queries and scroll snap are Baseline in all evergreen browsers. The @media (scripting) query is Baseline 2023; older browsers just skip the arrow buttons and keep the scrollbar."
draft: false
---

<!-- ✏️ DRAFT: intro. Swap in your own voice and details. -->
Late summer on the nd.edu homepage, our team ran a "How was your summer?" feature: fourteen photos of campus life, from a poet reading outside Hesburgh Library to a tiny tree frog in a biology lab. We didn't want a carousel that hides thirteen of them, and we didn't want a static grid that pushes the rest of the page down. The answer was a **mosaic that scrolls sideways**: tiles of different sizes packed into a band you can swipe, trackpad through, or page with arrow buttons.

It ships in the Notre Dame Web Theme as the `.gallery--slider` modifier. This post takes the idea apart and rebuilds it as a portable component you can use on any site.

{% demo "Mosaic slider (drag, swipe, or use the arrows)", 420 %}
<section class="mosaic" data-mosaic aria-label="Summer photo gallery">
  <ul class="mosaic__track" tabindex="0">
    <li><span class="ph">1</span></li><li><span class="ph">2</span></li>
    <li><span class="ph">3</span></li><li><span class="ph">4</span></li>
    <li><span class="ph">5</span></li><li><span class="ph">6</span></li>
    <li><span class="ph">7</span></li><li><span class="ph">8</span></li>
    <li><span class="ph">9</span></li><li><span class="ph">10</span></li>
    <li><span class="ph">11</span></li><li><span class="ph">12</span></li>
    <li><span class="ph">13</span></li><li><span class="ph">14</span></li>
    <li><span class="ph">15</span></li><li><span class="ph">16</span></li>
    <li><span class="ph">17</span></li><li><span class="ph">18</span></li>
    <li><span class="ph">19</span></li><li><span class="ph">20</span></li>
    <li><span class="ph">21</span></li><li><span class="ph">22</span></li>
    <li><span class="ph">23</span></li><li><span class="ph">24</span></li>
  </ul>
  <button class="mosaic__btn mosaic__btn--prev" type="button" aria-label="Previous photos" data-prev>‹</button>
  <button class="mosaic__btn mosaic__btn--next" type="button" aria-label="Next photos" data-next>›</button>
</section>
<style>
  body { padding: 1rem 0; overflow: hidden; }
  .mosaic { --cell: 33cqi; --rows: 2; --gap: .5rem; container-type: inline-size; position: relative; }
  .mosaic::after { content: ""; position: absolute; inset: auto 0 5px; border-top: 1px solid rgb(0 0 0 / .12); z-index: -1; }
  .mosaic__track {
    display: grid; grid-auto-flow: column dense;
    grid-template-rows: repeat(var(--rows), var(--cell)); grid-auto-columns: var(--cell);
    gap: var(--gap); list-style: none; margin: 0; padding: 0 1rem 1.75rem;
    overflow-x: auto; overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory; scroll-padding-inline: 1rem;
    scrollbar-width: thin; scrollbar-color: #c99700 transparent;
  }
  .mosaic__track:focus-visible { outline: 3px solid #c99700; outline-offset: -3px; }
  .mosaic__track > li { scroll-snap-align: start; border-radius: 6px; overflow: hidden; }
  @container (min-width: 36rem) {
    .mosaic__track { --rows: 4; --cell: clamp(4.5rem, 11cqi, 10rem); }
    .mosaic__track > :nth-child(12n+1), .mosaic__track > :nth-child(12n+2) { grid-area: span 2 / span 2; }
    .mosaic__track > :nth-child(12n+3), .mosaic__track > :nth-child(12n+9) { grid-area: span 1 / span 2; }
    .mosaic__track > :nth-child(12n+5) { grid-area: span 2 / span 3; }
    .mosaic__track > :nth-child(12n+7), .mosaic__track > :nth-child(12n+10) { grid-area: span 2 / span 1; }
    .mosaic__track > :nth-child(12n+8) { grid-area: span 3 / span 2; }
  }
  .ph { display: grid; place-items: center; height: 100%; font: 700 1.25rem/1 ui-monospace, monospace; color: #fff; }
  li:nth-child(6n+1) .ph { background: #0c2340; } li:nth-child(6n+2) .ph { background: #2a7ab8; }
  li:nth-child(6n+3) .ph { background: #c99700; color: #0c2340; } li:nth-child(6n+4) .ph { background: #217a55; }
  li:nth-child(6n+5) .ph { background: #6a4cb3; } li:nth-child(6n) .ph { background: #b83a5b; }
  .mosaic__btn {
    display: none; position: absolute; top: calc(50% - .875rem); translate: 0 -50%;
    width: 44px; height: 44px; border-radius: 50%; border: 1px solid rgb(255 255 255 / .5);
    background: #0a1f3a; color: #fff; font-size: 1.6rem; line-height: 1; cursor: pointer;
    transition: opacity .3s;
  }
  .mosaic__btn--prev { left: 1.5rem; } .mosaic__btn--next { right: 1.5rem; }
  .mosaic__btn:disabled { opacity: 0; pointer-events: none; }
  .mosaic__btn:focus-visible { outline: 3px solid #c99700; outline-offset: 2px; }
  @media (scripting: enabled) { .mosaic__btn { display: block; } }
</style>
<script>
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  for (const gallery of document.querySelectorAll("[data-mosaic]")) {
    const track = gallery.querySelector(".mosaic__track");
    const prev = gallery.querySelector("[data-prev]");
    const next = gallery.querySelector("[data-next]");
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= max - 1;
    };
    const page = (dir) => track.scrollBy({
      left: dir * track.clientWidth * 0.8,
      behavior: reduceMotion.matches ? "auto" : "smooth",
    });
    prev.addEventListener("click", () => page(-1));
    next.addEventListener("click", () => page(1));
    track.addEventListener("scroll", update, { passive: true });
    new ResizeObserver(update).observe(track);
    update();
  }
</script>
{% enddemo %}

The numbers are there so you can follow the pattern. Tiles 1 and 13 have the same shape, and so do 2 and 14, because the layout repeats every twelve tiles.

## Turn the grid on its side

A normal CSS grid fixes the columns and adds rows as content arrives. Here we flip that: we **fix the rows** and let the grid add **columns** forever. Three declarations do it:

```css
.mosaic__track {
  display: grid;
  grid-auto-flow: column;                   /* fill top-to-bottom, then move right */
  grid-template-rows: repeat(4, var(--cell)); /* a fixed number of rows… */
  grid-auto-columns: var(--cell);           /* …and as many columns as it takes */
  overflow-x: auto;                         /* the band scrolls sideways */
}
```

Because the rows and columns share one `--cell` size, every grid cell is square. A tile's shape then depends only on how many rows and columns it spans, so you never need `aspect-ratio`, and `object-fit: cover` crops each photo to fit.

## The 12-tile recipe

The mosaic is one repeating pattern, set with `:nth-child(12n + k)`. Remember that `grid-area: span R / span C` puts the **row** span first:

| Tile | `grid-area` | Shape |
| --- | --- | --- |
| 1, 2 | `span 2 / span 2` | Big square |
| 3, 9 | `span 1 / span 2` | Wide strip (2:1) |
| 5 | `span 2 / span 3` | Landscape (3:2) |
| 7, 10 | `span 2 / span 1` | Tall strip (1:2) |
| 8 | `span 3 / span 2` | Portrait (2:3) |
| 4, 6, 11, 12 | *(default)* | Small square |

```css
.mosaic__track > :nth-child(12n+1),
.mosaic__track > :nth-child(12n+2)  { grid-area: span 2 / span 2; }
.mosaic__track > :nth-child(12n+3),
.mosaic__track > :nth-child(12n+9)  { grid-area: span 1 / span 2; }
.mosaic__track > :nth-child(12n+5)  { grid-area: span 2 / span 3; }
.mosaic__track > :nth-child(12n+7),
.mosaic__track > :nth-child(12n+10) { grid-area: span 2 / span 1; }
.mosaic__track > :nth-child(12n+8)  { grid-area: span 3 / span 2; }
```

{% callout "tip" %}
Add `dense` to `grid-auto-flow: column dense`. When a big tile can't fit in the space left at the bottom of a column, the grid moves it to the next column and leaves a gap. `dense` lets a later small tile fill that gap.
{% endcallout %}

On small screens, the whole recipe goes away. The track switches to **two rows** of plain squares, each about a third of the width, so about three columns show at a time and the last one is cut off at the edge, which hints that the band scrolls.

## Size it from the container, not the viewport

In production the breakpoint is a media query at `60em`, and the cells are sized in `vw` (`min(11vw, 10rem)`). That works on nd.edu because the gallery always runs full-bleed. For a component that could land in a sidebar or a two-column CMS region, make the wrapper a query container and size everything in `cqi`:

```css
.mosaic {
  container-type: inline-size;
  --rows: 2;
  --cell: 33cqi;                 /* mobile: 3 squares across */
}

@container (min-width: 36rem) {
  .mosaic__track {
    --rows: 4;
    --cell: clamp(4.5rem, 11cqi, 10rem);
  }
  /* …the 12-tile recipe goes here… */
}
```

## Scrolling that feels right

```css
.mosaic__track {
  overscroll-behavior-x: contain;   /* don't trigger back/forward swipe at the ends */
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 1rem;
  scrollbar-width: thin;
  scrollbar-color: #c99700 transparent;
}
.mosaic__track > li { scroll-snap-align: start; }
```

{% callout "note", "Something we caught while writing this up" %}
The production CSS sets `scroll-snap-type: x mandatory` on the list but never gives the tiles a `scroll-snap-align`, so snapping never actually happens. Scroll snap needs both halves: the container opts in, and each child says where it lands.
{% endcallout %}

The thin gold scrollbar sits on a hairline rule that's drawn with an `::after` pseudo-element behind the track. It's a small touch, but it makes the scrollbar look like part of the design. The production version also styles `::-webkit-scrollbar` for older Safari. The standard `scrollbar-color` covers current browsers.

## The arrow buttons

Trackpads and touch screens don't need buttons, but mouse users do. The script does three things: it pages the track by most of its visible width, it disables each button at the matching end, and it rechecks when the layout changes size.

```js
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

for (const gallery of document.querySelectorAll("[data-mosaic]")) {
  const track = gallery.querySelector(".mosaic__track");
  const prev = gallery.querySelector("[data-prev]");
  const next = gallery.querySelector("[data-next]");

  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
  };

  const page = (dir) => track.scrollBy({
    left: dir * track.clientWidth * 0.8,   // keep ~20% overlap for context
    behavior: reduceMotion.matches ? "auto" : "smooth",
  });

  prev.addEventListener("click", () => page(-1));
  next.addEventListener("click", () => page(1));
  track.addEventListener("scroll", update, { passive: true });
  new ResizeObserver(update).observe(track);
  update();
}
```

This version changes a few things from what runs on nd.edu:

- **`disabled` instead of `display: none`.** If a button disappears while it has keyboard focus, focus drops back to the top of the page. A disabled button stays where it is.
- **Per-gallery lookups, no IDs.** The theme markup gives the buttons `id="previous"` and `id="next"`, which causes duplicate IDs when a page has two galleries.
- **Reduced motion.** Smooth scrolling is skipped for people who've asked their OS for less motion.

We kept one trick from the theme. The buttons are `display: none` until `@media (scripting: enabled)` matches, so visitors without JavaScript never see arrows that do nothing.

```css
.mosaic__btn { display: none; }
@media (scripting: enabled) { .mosaic__btn { display: block; } }
.mosaic__btn:disabled { opacity: 0; pointer-events: none; }
```

## The markup

```html
<section class="mosaic" data-mosaic aria-label="Summer photo gallery">
  <ul class="mosaic__track" tabindex="0">
    <li>
      <a href="/photos/sunglasses-1600.webp">
        <img src="/photos/sunglasses-600.webp" width="300" height="300" loading="lazy"
             alt="A student in white sunglasses reads a book outdoors.">
      </a>
    </li>
    <!-- …more tiles… -->
  </ul>
  <button class="mosaic__btn mosaic__btn--prev" type="button" aria-label="Previous photos" data-prev>‹</button>
  <button class="mosaic__btn mosaic__btn--next" type="button" aria-label="Next photos" data-next>›</button>
</section>
```

```css
.mosaic__track a   { display: block; height: 100%; }
.mosaic__track img { width: 100%; height: 100%; object-fit: cover; }
```

`tabindex="0"` on the track lets keyboard users focus the band and scroll it with the arrow keys. Load the thumbnails at 600×600 so the biggest 2×2 tiles stay sharp, and link each one to the full-size image for a lightbox.

<!-- ✏️ DRAFT: closing. Add a real-world note, e.g. how editors pick the photo order so the big tiles get the strongest images. -->
