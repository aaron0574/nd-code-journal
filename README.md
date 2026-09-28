# Code Journal

A searchable, filterable blog of code examples, built with [Eleventy 3](https://www.11ty.dev/) and [Pagefind](https://pagefind.app/).

## Quick start

```bash
npm install
npm start          # dev server at http://localhost:8080 (search index rebuilds on every save)
npm run build      # production build → _site/
npm run new -- "My post title"   # scaffold a new article (starts as a draft)
```

Requires Node 20+ (`.nvmrc` pins 22).

## Project layout

```
eleventy.config.js         Plugins, collections, filters, shortcodes, Pagefind hook
src/
  _data/site.js            Site title, author, nav, topic colours, language labels  ← start here
  _includes/
    layouts/base.njk       HTML shell (head, header, footer)
    layouts/post.njk       Article template (hero, sidebar, TOC, related posts, search metadata)
    layouts/page.njk       Simple page template
    partials/              header, footer, card
  pages/                   Home, articles (filterable), topics, topic/[slug], search, about, 404
  posts/                   Your articles — one Markdown file each
  assets/css/main.css      All styles, organised by section, design tokens at the top
  assets/js/               main.js (theme, copy, tabs, TOC) · filters.js · search.js
scripts/new-post.js        `npm run new` helper
```

## Writing an article

Create `src/posts/YYYY-MM-DD-slug.md` (or use `npm run new`). URL becomes `/articles/slug/`.

```yaml
---
title: Cards that lay themselves out with container queries
description: Shown on cards, in search results and as the meta description.
date: 2026-08-27
tags: [css, components]      # topics — add metadata for new ones in site.js
languages: [css, html]       # used for filtering; the first sets the cover glyph
browserSupport: "Optional note shown in the sidebar."
draft: true                  # optional — shown in `npm start`, excluded from builds
---
```

### Code blocks

Fenced code blocks are highlighted at build time (Prism) and get a language label + Copy button automatically.

````md
```css/2-3          ← highlight lines 2–3 (0-based)
.card { … }
```
````

### Live demos

Renders HTML/CSS/JS in a sandboxed iframe with a Result / Code toggle:

```njk
{% demo "Container-aware cards", 420 %}
<div class="card">…</div>
<style>…</style>
<script>…</script>
{% enddemo %}
```

The second argument is the iframe height in px.

Every demo is resizable, so readers can watch container queries and media queries respond:

- **Inline:** drag the handle on the demo's right edge (or focus it and use ←/→, Shift for bigger steps). A width readout and **Reset** appear while it's narrowed. Double-click the handle to reset.
- **Expand:** opens the demo in a full-screen playground on the same page (a native `<dialog>`, no redirect). It has Phone / Tablet / Laptop / Fit presets, handles on both sides, a live width readout, and a **Code** toggle that shows the source underneath with a Copy button. Esc, Close, or clicking the backdrop returns to the article.

The logic lives in `src/assets/js/demos.js`, which `main.js` loads only on pages that contain a demo.

### Callouts

```njk
{% callout "tip" %}Markdown **works** in here.{% endcallout %}
```

Types: `note`, `tip`, `warning`, `a11y`. An optional second argument overrides the label.

### ⚠️ Twig, Nunjucks, Vue, Handlebars…

Markdown is pre-processed with Nunjucks (so shortcodes work), which means `{{ }}` and `{% %}` inside your code samples will be interpreted. Wrap those blocks:

````njk
{% raw %}
```twig
{{ entry.title }}
```
{% endraw %}
````

Or, for a post that uses no shortcodes, add `templateEngineOverride: md` to its front matter.

## Search & filtering

- **Articles page** (`/articles/`): instant client-side filtering by keyword, topic (multi-select), language and sort. State is kept in the URL (`?topic=css,accessibility&lang=js`) so filtered views are shareable.
- **Search page** (`/search/`): Pagefind full-text search over article bodies *and code*, with Topic and Language facets. Accepts `?q=`, `?topic=`, `?language=`.
- The index is generated in the `eleventy.after` hook in `eleventy.config.js`, so it's always fresh in dev and build — no separate step.
- Only article pages are indexed (`data-pagefind-body` on the article). Anything with `data-pagefind-ignore` is skipped.

## Customising the design

- **Brand:** colours, fonts, spacing and the type scale are CSS custom properties at the top of `main.css`. Dark mode overrides sit right below.
- **Topic colours:** set in `site.js` (`navy`, `gold`, `sky`, `green`, `rose`, `violet`, `orange`, `slate`); the values live in the `[data-color]` rules in `main.css`.
- **Fonts** are self-hosted variable fonts (Ubuntu for headings, Open Sans for body text, JetBrains Mono for code) copied from `@fontsource-variable` packages at build time — no third-party requests.
- **Colour** follows the Notre Dame palette (navy, metallic gold, warm white). Topic colours appear only as small markers and thin rules, never as large fills.

## Comments (Giscus)

Comments and reactions use [Giscus](https://giscus.app), which stores each article's thread as a GitHub Discussion in this repo. The comment section only appears once the IDs in `site.comments` (`src/_data/site.js`) are filled in, and it's left off drafts.

One-time setup:

1. Repo **Settings → General → Features**: tick **Discussions**.
2. In the repo's **Discussions** tab, add a category named **Comments** with the **Announcement** format, so only you and Giscus can start threads.
3. Install the Giscus app on this repo: <https://github.com/apps/giscus>.
4. On <https://giscus.app>, enter `aaron0574/nd-code-journal` and pick the **Comments** category. Copy `data-repo-id` and `data-category-id` into `repoId` and `categoryId` in `site.js`.

Each article gets its own thread (matched by URL path) the first time someone comments. You can moderate, edit or lock threads from GitHub. The embed loads only when readers scroll near it, and it switches light/dark with the site's theme toggle.

## Deploying to Netlify

Everything Netlify needs is in `netlify.toml` (build command, publish folder, Node version, headers).

**One-time setup**

1. Put the project in a GitHub repository (the `.gitignore` already leaves out `node_modules/` and `_site/`):
   ```bash
   git init && git add . && git commit -m "Initial commit"
   # create an empty repo on GitHub, then:
   git remote add origin git@github.com:YOUR-USER/nd-code-journal.git
   git push -u origin main
   ```
2. In Netlify: **Add new site → Import an existing project → GitHub**, and pick the repo. The build settings fill in from `netlify.toml`, so there's nothing to change. Click **Deploy**.
3. Optional: **Domain management → Add a domain** for a custom address. Netlify provides HTTPS automatically.
4. Check the live site: search works, `/feed.xml` shows your real domain in its links, and the 404 page appears for a bad URL.

**How it behaves**

- Every push to `main` publishes the site. Search, the feed and the fonts are all built on Netlify, so nothing in `_site/` needs committing.
- The site address is automatic: production uses your live domain, previews use their own preview URL. Set a `SITE_URL` environment variable only if you need to override it.
- **Drafts:** open a pull request (or push a branch) and Netlify builds a deploy preview that *includes* `draft: true` articles, marked with a "Draft" flag, so you can review or share them. Production never includes drafts.

Building somewhere else? `npm run build` and publish `_site/` on any static host, with `SITE_URL` set to the live address.

## Accessibility notes

Skip link, visible focus styles, `prefers-reduced-motion` and `prefers-color-scheme` support, keyboard-operable demo tabs (arrow keys), live-region result counts on filter/search, and everything works without JavaScript except search and filtering (which fall back to the full archive list).
