---
title: An accessible accordion that starts with <details>
description: Native disclosure widgets get you 90% of the way there. Here's the CSS and ten lines of JavaScript that cover the last 10% — including exclusive "only one open" groups.
date: 2026-09-21
tags: [accessibility, components, html]
languages: [html, css, js]
browserSupport: "<details name> (exclusive accordions) ships in all evergreen browsers as of 2024. Older browsers simply allow multiple panels open."
---

Accordions are everywhere on university sites: FAQs, admissions requirements, course listings. For years we reached for a JavaScript plugin with a pile of ARIA. These days the `<details>` and `<summary>` elements do almost all of the work for us — keyboard support, screen reader announcements, and find-in-page all come free.

## The markup

Each panel is a `<details>` element. Adding the same `name` attribute to a group makes it *exclusive*: opening one closes the others, no script required.

```html
<div class="accordion">
  <details name="faq" open>
    <summary>When is the application deadline?</summary>
    <div class="accordion__panel">
      <p>Regular decision applications are due January 1.</p>
    </div>
  </details>
  <details name="faq">
    <summary>Is there an application fee?</summary>
    <div class="accordion__panel">
      <p>Yes — $75, with waivers available.</p>
    </div>
  </details>
</div>
```

{% callout "a11y" %}
Don't put headings *inside* `<summary>` expecting them to be navigable — `<summary>` has an implicit button role that flattens its children. If you need panels in the heading outline, add a visually-hidden heading before each `<details>`.
{% endcallout %}

## Styling the marker

The default triangle is hard to style consistently, so hide it and draw our own with a pseudo-element. The `[open]` attribute is our state hook.

```css/12-19
.accordion details {
  border-bottom: 1px solid #d9d4c7;
}
.accordion summary {
  list-style: none;          /* Firefox */
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  font-weight: 700;
  cursor: pointer;
}
.accordion summary::-webkit-details-marker { display: none; } /* Safari */
.accordion summary::after {
  content: "+";
  transition: rotate 0.2s ease;
}
.accordion details[open] > summary::after {
  rotate: 45deg;
}
```

## Try it

{% demo "Exclusive accordion", 300 %}
<div class="accordion">
  <details name="faq" open>
    <summary>When is the application deadline?</summary>
    <div class="accordion__panel"><p>Regular decision applications are due January 1.</p></div>
  </details>
  <details name="faq">
    <summary>Is there an application fee?</summary>
    <div class="accordion__panel"><p>Yes — $75, with fee waivers available on request.</p></div>
  </details>
  <details name="faq">
    <summary>Can I visit campus?</summary>
    <div class="accordion__panel"><p>Tours run Monday through Saturday during the academic year.</p></div>
  </details>
</div>
<style>
  .accordion { max-width: 36rem; }
  .accordion details { border-bottom: 1px solid #d9d4c7; }
  .accordion summary { list-style: none; display: flex; justify-content: space-between; gap: 1rem; padding: 1rem 0; font-weight: 700; cursor: pointer; }
  .accordion summary::-webkit-details-marker { display: none; }
  .accordion summary::after { content: "+"; font-size: 1.4rem; line-height: 1; color: #c99700; transition: rotate .2s ease; }
  .accordion details[open] > summary::after { rotate: 45deg; }
  .accordion summary:focus-visible { outline: 3px solid #c99700; outline-offset: 2px; }
  .accordion__panel { padding-bottom: 1rem; color: #3a4658; }
  .accordion__panel p { margin: 0; }
</style>
{% enddemo %}

## Opening a panel from the URL

Content editors love linking straight to one answer (`/faq/#fee`). A tiny script opens the matching `<details>` when the hash targets it or anything inside it:

```js
function openFromHash() {
  const target = location.hash && document.getElementById(location.hash.slice(1));
  const details = target?.closest("details");
  if (details) {
    details.open = true;
    target.scrollIntoView({ block: "start" });
  }
}

addEventListener("hashchange", openFromHash);
openFromHash();
```

That's it. No dependencies, fully keyboard accessible, and it degrades to plain content if CSS fails to load.
