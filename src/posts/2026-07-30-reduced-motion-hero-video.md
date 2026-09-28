---
title: A hero video that respects prefers-reduced-motion
description: Autoplaying background video, done responsibly — a pause button that satisfies WCAG 2.2.2, a poster for reduced-motion users, and no wasted bandwidth.
date: 2026-07-30
tags: [accessibility, performance, html]
languages: [html, css, js]
---

Marketing loves a looping campus hero video. WCAG 2.2.2 (Pause, Stop, Hide) says anything that moves for more than five seconds needs a way to stop it. And users who've asked their OS for reduced motion shouldn't get it at all.

## Markup

Start with a poster image and **no** `autoplay` attribute — we decide in JavaScript whether to play.

```html
<div class="hero-video">
  <video muted loop playsinline preload="none" poster="/img/campus-poster.jpg">
    <source src="/video/campus-loop.mp4" type="video/mp4">
  </video>
  <button class="hero-video__toggle" type="button" aria-pressed="false" hidden>
    <span class="visually-hidden">Pause background video</span>
  </button>
</div>
```

## Only play when it's welcome

```js
const wrap = document.querySelector(".hero-video");
const video = wrap.querySelector("video");
const button = wrap.querySelector(".hero-video__toggle");
const label = button.querySelector("span");
const reduce = matchMedia("(prefers-reduced-motion: reduce)");

function setPlaying(playing) {
  playing ? video.play().catch(() => {}) : video.pause();
  button.setAttribute("aria-pressed", String(!playing));
  label.textContent = playing ? "Pause background video" : "Play background video";
}

if (!reduce.matches) {
  video.preload = "auto";
  button.hidden = false;
  setPlaying(true);
}

button.addEventListener("click", () => setPlaying(video.paused));
reduce.addEventListener("change", (e) => e.matches && setPlaying(false));
```

{% callout "a11y" %}
Because `preload="none"` is set in the HTML, reduced-motion users never download the video at all — an accessibility win that's also a performance win.
{% endcallout %}

## The button

```css
.hero-video { position: relative; }
.hero-video video { width: 100%; height: 100%; object-fit: cover; }
.hero-video__toggle {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  width: 2.75rem;
  height: 2.75rem;
  border: 0;
  border-radius: 50%;
  background: rgb(12 35 64 / 0.8);
  color: #fff;
}
.hero-video__toggle::before { content: "❚❚"; }
.hero-video__toggle[aria-pressed="true"]::before { content: "▶"; }
```
