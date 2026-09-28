---
title: "The spotlight accordion: an accordion that changes the image beside it"
description: Build an exclusive accordion where opening an item cross-fades a matching photo or video, using <details name>, one CSS grid trick, and a few lines of JavaScript that listen for the toggle event.
date: 2026-06-21
tags: [components, accessibility, css]
languages: [html, css, js]
browserSupport: "Exclusive accordions (<details name>) are Baseline 2024. Older browsers let more than one item open at a time, and the image follows whichever item was opened last."
draft: false
---

Our team originally built this component for the nd.edu homepage. We wanted a way to show more photos and video of campus without adding another carousel, and to make the page feel interactive without making it harder to use. You can see a version of it today in the **Notre Dame Values** section on [careers.nd.edu](https://careers.nd.edu/working-at-notre-dame/).

The idea is simple. You have a short list of topics, and each one comes with a picture. When a reader opens a topic, its picture fades in next to it. We call it a **spotlight accordion**, because opening an item puts its image in the spotlight.

Try it first, then we'll build it one step at a time.

{% demo "Spotlight accordion", 460 %}
<div class="spotlight" data-spotlight>
  <div class="spotlight__layout">
    <div class="spotlight__list">
      <details name="values" open data-spotlight-target="media-mission">
        <summary>Catholic Mission</summary>
        <p>Be a force for good and help advance Notre Dame's mission as a global Catholic research university.</p>
      </details>
      <details name="values" data-spotlight-target="media-community">
        <summary>Community</summary>
        <p>Treat every person with dignity and respect.</p>
      </details>
      <details name="values" data-spotlight-target="media-collaboration">
        <summary>Collaboration</summary>
        <p>Work together with honesty, kindness and humility.</p>
      </details>
      <details name="values" data-spotlight-target="media-excellence">
        <summary>Excellence</summary>
        <p>Pursue the highest standards with a commitment to truth and service.</p>
      </details>
      <details name="values" data-spotlight-target="media-innovation">
        <summary>Innovation</summary>
        <p>Embrace opportunities with creativity and dedication.</p>
      </details>
    </div>
    <div class="spotlight__media">
      <figure id="media-mission" class="is-active"><div class="ph" style="--a:#0c2340;--b:#1c4f8f">Mission</div></figure>
      <figure id="media-community"><div class="ph" style="--a:#143865;--b:#3f7cb8">Community</div></figure>
      <figure id="media-collaboration"><div class="ph" style="--a:#8c7535;--b:#ddc278">Collaboration</div></figure>
      <figure id="media-excellence"><div class="ph" style="--a:#0a843d;--b:#35b36a">Excellence</div></figure>
      <figure id="media-innovation"><div class="ph" style="--a:#6b56a6;--b:#a893dd">Innovation</div></figure>
    </div>
  </div>
</div>
<style>
  .spotlight { container-type: inline-size; }
  .spotlight__layout { display: grid; gap: 1.5rem; }
  .spotlight__media { display: grid; aspect-ratio: 3 / 2; order: -1; }
  .spotlight__media > figure {
    grid-area: 1 / 1; margin: 0; border-radius: 6px; overflow: hidden;
    opacity: 0; visibility: hidden;
    transition: opacity .5s ease, visibility 0s linear .5s;
  }
  .spotlight__media > figure.is-active { opacity: 1; visibility: visible; transition: opacity .5s ease, visibility 0s; }
  @media (prefers-reduced-motion: reduce) { .spotlight__media > figure { transition: none; } }
  .spotlight details { border-bottom: 1px solid #d6dadf; padding-inline: 1rem; color: #5f6368; transition: background-color .2s, color .2s; }
  .spotlight details:is([open], :hover, :focus-within) { color: #0c2340; }
  .spotlight details[open] { background: #f1f2f4; }
  .spotlight summary { list-style: none; display: flex; justify-content: space-between; gap: 1rem; padding-block: 1rem; font-size: 1.15rem; font-weight: 700; cursor: pointer; }
  .spotlight summary::-webkit-details-marker { display: none; }
  .spotlight summary::after { content: "+"; font-weight: 400; }
  .spotlight details[open] summary::after { content: "–"; }
  .spotlight summary:focus-visible { outline: 2px solid #d39f10; outline-offset: 2px; }
  .spotlight details p { margin: 0 0 1rem; color: #333; }
  @container (min-width: 36rem) {
    .spotlight__layout { grid-template-columns: 1fr 1fr; gap: 2rem; }
    .spotlight__media { order: 0; aspect-ratio: auto; min-height: 18rem; }
  }
  .ph { display: grid; place-items: center; height: 100%; color: #fff; font: 700 1.4rem/1 system-ui, sans-serif; background: linear-gradient(135deg, var(--a), var(--b)); }
</style>
<script>
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  for (const group of document.querySelectorAll("[data-spotlight]")) {
    const figures = group.querySelectorAll(".spotlight__media > figure");
    const show = (details) => {
      const target = document.getElementById(details.dataset.spotlightTarget);
      if (!target) return;
      for (const figure of figures) {
        const active = figure === target;
        figure.classList.toggle("is-active", active);
        const video = figure.querySelector("video");
        if (video) active && !reduceMotion.matches ? video.play().catch(() => {}) : video.pause();
      }
    };
    group.addEventListener("toggle", (event) => {
      if (event.target.open) show(event.target);
    }, true);
    const initial = group.querySelector("details[open]");
    if (initial) show(initial);
  }
</script>
{% enddemo %}

Open a few items, then press **Expand** and try the **Phone** preset. On a narrow screen the image moves above the list instead of disappearing.

## What we're building

Before writing any code, it helps to name the parts. A spotlight accordion has three:

1. **A list of disclosures.** Each one has a short title the reader clicks and a bit of text that opens underneath.
2. **A stack of media.** One photo or video for each item, all sitting in the same spot.
3. **A connection between them.** When an item opens, its media becomes the visible one.

We'll handle each part with the simplest tool that does the job: HTML for the accordion, CSS for the stacking and fading, and JavaScript only for the connection.

## Step 1: Start with an exclusive accordion

The accordion is built with `<details>` and `<summary>`. You get keyboard support, screen reader announcements and find-in-page from the browser without writing any JavaScript.

Giving every `<details>` the **same `name`** turns them into a group where only one can be open at a time. That matters here, because only one image can be in the spotlight.

```html
<div class="spotlight__list">
  <details name="values" open data-spotlight-target="media-mission">
    <summary>Catholic Mission</summary>
    <p>Be a force for good and help advance Notre Dame's mission…</p>
  </details>
  <details name="values" data-spotlight-target="media-community">
    <summary>Community</summary>
    <p>Treat every person with dignity and respect.</p>
  </details>
  <!-- …one <details> per item… -->
</div>
```

Put `open` on the first item so the component never starts empty.

## Step 2: Pair each item with its media

Each item needs to know which image belongs to it. The most reliable way is to say so directly: give every `<figure>` an `id`, and point to it from the matching `<details>` with a `data-spotlight-target` attribute.

```html
<div class="spotlight__media">
  <figure id="media-mission" class="is-active">
    <img src="mission.jpg" alt="A priest talks with two staff members outside." width="600" height="400">
  </figure>
  <figure id="media-community">
    <img src="community.jpg" alt="A volunteer installs siding on a Habitat for Humanity house." width="600" height="400">
  </figure>
  <!-- …one <figure> per item… -->
</div>
```

{% callout "tip" %}
You could match items and images by their position ("the third item shows the third image"), but that breaks as soon as someone adds, removes or reorders an item in the CMS. An explicit `id` keeps each pair together no matter what happens around it.
{% endcallout %}

Give the first figure the `is-active` class in the HTML. If JavaScript fails to load, readers still see an image, and the accordion keeps working on its own.

## Step 3: Stack the media in one grid cell

Every figure needs to sit in the same place so they can fade into one another. The usual approach is `position: absolute`, but there's a simpler way. Make the media container a grid, and put every figure in the **same cell**:

```css
.spotlight__media {
  display: grid;
}

.spotlight__media > figure {
  grid-area: 1 / 1;   /* every figure sits in row 1, column 1 */
  margin: 0;
}

.spotlight__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;  /* fill the space without stretching the photo */
}
```

Because the figures are still in normal layout, the container sizes itself correctly. There are no heights to calculate and nothing to overlap by accident.

## Step 4: Cross-fade with opacity and visibility

Now hide every figure except the active one. Fading `opacity` gives us a smooth transition, and pairing it with `visibility` makes the hidden images truly hidden from screen readers.

```css
.spotlight__media > figure {
  opacity: 0;
  visibility: hidden;
  /* fade out, and only become hidden once the fade has finished */
  transition: opacity 0.5s ease, visibility 0s linear 0.5s;
}

.spotlight__media > figure.is-active {
  opacity: 1;
  visibility: visible;
  /* become visible right away, then fade in */
  transition: opacity 0.5s ease, visibility 0s;
}

@media (prefers-reduced-motion: reduce) {
  .spotlight__media > figure { transition: none; }
}
```

The two `transition` lines look almost the same, but the order matters. When a figure hides, `visibility` waits until the half-second fade is over. When it shows, `visibility` changes immediately so the fade-in is visible.

{% callout "a11y" %}
It's tempting to dim closed accordion items with `opacity`, but that also lowers the text contrast, sometimes below WCAG's 4.5:1 minimum. Change the text `color` instead: a mid gray for closed items and your heading color for the open one. You get the same effect without the contrast problem.
{% endcallout %}

```css
.spotlight details { color: #5f6368; }
.spotlight details:is([open], :hover, :focus-within) { color: #0c2340; }
.spotlight details[open] { background: #f1f2f4; }
```

## Step 5: Wire it up with the toggle event

This is the only JavaScript we need. Every `<details>` fires a `toggle` event when it opens or closes, however that happens: a click, the keyboard, find-in-page, or another item in the group closing it.

```js/9-11
for (const group of document.querySelectorAll("[data-spotlight]")) {
  const figures = group.querySelectorAll(".spotlight__media > figure");

  const show = (details) => {
    const target = document.getElementById(details.dataset.spotlightTarget);
    if (!target) return;
    figures.forEach((figure) => figure.classList.toggle("is-active", figure === target));
  };

  group.addEventListener("toggle", (event) => {
    if (event.target.open) show(event.target);
  }, true);

  // Match the image to whichever item starts open
  const initial = group.querySelector("details[open]");
  if (initial) show(initial);
}
```

Two details are worth slowing down for:

- **Why `toggle` and not `click`?** A `click` listener only notices mouse clicks and keyboard presses on the summary. If a reader opens an item another way, such as searching the page with ⌘F, the image would fall out of sync. `toggle` catches every case.
- **Why the `true` at the end?** Unlike `click`, the `toggle` event doesn't bubble up to parent elements. Passing `true` listens during the *capture* phase instead, so one listener on the group hears every item. We then check `event.target.open`, because closing an item also fires `toggle` and we only care about the one that opened.

## Step 6: Make it work on small screens

On a phone there isn't room for two columns. Rather than hiding the images (and losing the whole point of the component), we stack them above the list. A container query decides when there's room for two columns, so the component adapts to wherever it's placed, not just to the screen width.

```css
.spotlight { container-type: inline-size; }

.spotlight__layout { display: grid; gap: 1.5rem; }

/* Narrow: the image sits above the list with a fixed shape */
.spotlight__media { aspect-ratio: 3 / 2; order: -1; }

/* Wide: two columns, and the image stretches to the list's height */
@container (min-width: 36rem) {
  .spotlight__layout { grid-template-columns: 1fr 1fr; gap: 2rem; }
  .spotlight__media  { order: 0; aspect-ratio: auto; min-height: 18rem; }
}
```

`order: -1` moves the image to the top visually while leaving the text first in the HTML, so screen readers still reach the content before the pictures.

## Bonus: using video instead of a photo

The nd.edu homepage version mixes photos with short, silent video loops. The markup is the same idea: put a `<video>` in the figure instead of an `<img>`.

```html
<figure id="media-innovation">
  <video src="innovation-loop.mp4" poster="innovation.jpg" muted loop playsinline preload="none"></video>
</figure>
```

Then let `show()` play the active video and pause the rest, and skip playback entirely for readers who have asked for reduced motion:

```js
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

figures.forEach((figure) => {
  const active = figure === target;
  figure.classList.toggle("is-active", active);

  const video = figure.querySelector("video");
  if (!video) return;
  if (active && !reduceMotion.matches) video.play().catch(() => {});
  else video.pause();
});
```

`preload="none"` means a video isn't downloaded until its item is opened, so a list of five videos doesn't cost five downloads on page load.

## Recap

- `<details name>` gives you an accessible, one-at-a-time accordion with no JavaScript.
- An explicit `id` connects each item to its media, so reordering content never breaks the pairing.
- Stacking figures in one grid cell (`grid-area: 1 / 1`) is simpler than absolute positioning.
- Fading `opacity` together with `visibility` gives a smooth cross-fade and keeps hidden images away from screen readers.
- Listening for `toggle` in the capture phase keeps the image in sync, however an item is opened.
- A container query moves the image above the list on narrow layouts instead of hiding it.

<!-- ✏️ DRAFT: closing. Add a note from the team, e.g. what content works best in the spotlight (strong single-subject photos, 4–6 items), or where else on campus sites it's being used. -->
