import { IdAttributePlugin } from "@11ty/eleventy";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";
import * as pagefind from "pagefind";
import site from "./src/_data/site.js";

// Languages Prism should know about for the {% demo %} shortcode.
loadLanguages(["markup", "css", "javascript", "php", "twig", "json", "bash", "scss"]);

/** Tags that are used for internal collections and should never appear as topics. */
const HIDDEN_TAGS = new Set(["all", "posts", "post"]);

export default async function (eleventyConfig) {
	/* ---------------------------------------------------------------------- */
	/* Plugins                                                                */
	/* ---------------------------------------------------------------------- */
	eleventyConfig.addPlugin(syntaxHighlight, {
		preAttributes: { tabindex: 0 },
	});

	// Adds id="" to headings (used by the "On this page" nav)
	eleventyConfig.addPlugin(IdAttributePlugin);

	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom",
		outputPath: "/feed.xml",
		collection: { name: "feed", limit: 20 }, // plugin expects oldest-first; it outputs the newest 20, newest first
		metadata: {
			language: "en",
			title: site.title,
			subtitle: site.description,
			base: site.url,
			author: { name: site.author.name },
		},
	});

	/* ---------------------------------------------------------------------- */
	/* Static files                                                           */
	/* ---------------------------------------------------------------------- */
	eleventyConfig.addPassthroughCopy("src/assets/img");
	eleventyConfig.addPassthroughCopy("src/assets/js");
	eleventyConfig.addPassthroughCopy("src/assets/css");
	eleventyConfig.addPassthroughCopy({ "src/assets/favicon.svg": "favicon.svg" });

	// Self-hosted variable fonts (Latin subset) from @fontsource-variable — no third-party requests
	eleventyConfig.addPassthroughCopy({
		"node_modules/@fontsource-variable/open-sans/files/open-sans-latin-wght-normal.woff2": "assets/fonts/open-sans.woff2",
		"node_modules/@fontsource-variable/open-sans/files/open-sans-latin-wght-italic.woff2": "assets/fonts/open-sans-italic.woff2",
		"node_modules/@fontsource/ubuntu/files/ubuntu-latin-400-normal.woff2": "assets/fonts/ubuntu-400.woff2",
		"node_modules/@fontsource/ubuntu/files/ubuntu-latin-700-normal.woff2": "assets/fonts/ubuntu-700.woff2",
		"node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2": "assets/fonts/jetbrains-mono.woff2",
	});

	/* ---------------------------------------------------------------------- */
	/* Collections                                                            */
	/* ---------------------------------------------------------------------- */
	// Drafts (`draft: true`) appear in `npm start` and on Netlify deploy previews /
	// branch deploys, but are skipped entirely in production builds.
	const showDrafts =
		process.env.ELEVENTY_RUN_MODE === "serve" ||
		["deploy-preview", "branch-deploy"].includes(process.env.CONTEXT);
	eleventyConfig.addPreprocessor("drafts", "*", (data) => {
		if (data.draft && !showDrafts) return false;
	});

	eleventyConfig.addCollection("posts", (api) =>
		api.getFilteredByGlob("src/posts/**/*.md").reverse()
	);

	// Same posts, oldest first, for the RSS/Atom feed plugin
	eleventyConfig.addCollection("feed", (api) => api.getFilteredByGlob("src/posts/**/*.md"));

	// [{ slug, name, count, posts }] sorted by count desc
	eleventyConfig.addCollection("topics", (api) => {
		const map = new Map();
		for (const post of api.getFilteredByGlob("src/posts/**/*.md")) {
			for (const tag of post.data.tags || []) {
				if (HIDDEN_TAGS.has(tag)) continue;
				if (!map.has(tag)) map.set(tag, []);
				map.get(tag).push(post);
			}
		}
		return [...map.entries()]
			.map(([name, posts]) => ({
				name,
				slug: eleventyConfig.getFilter("slugify")(name),
				count: posts.length,
				posts: posts.sort((a, b) => b.date - a.date),
			}))
			.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
	});

	// Unique list of languages used across posts (front matter `languages`)
	eleventyConfig.addCollection("languages", (api) => {
		const set = new Set();
		for (const post of api.getFilteredByGlob("src/posts/**/*.md")) {
			(post.data.languages || []).forEach((l) => set.add(l));
		}
		return [...set].sort();
	});

	/* ---------------------------------------------------------------------- */
	/* Filters                                                                */
	/* ---------------------------------------------------------------------- */
	eleventyConfig.addFilter("readableDate", (date) =>
		new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(date)
	);
	eleventyConfig.addFilter("shortDate", (date) =>
		new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date)
	);
	eleventyConfig.addFilter("monthDay", (date) =>
		new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date)
	);
	eleventyConfig.addFilter("year", (date) => String(new Date(date).getUTCFullYear()));
	eleventyConfig.addFilter("isoDate", (date) => new Date(date).toISOString().slice(0, 10));

	eleventyConfig.addFilter("readingTime", (content = "") => {
		const words = String(content).replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
		return `${Math.max(1, Math.round(words / 220))} min read`;
	});

	eleventyConfig.addFilter("topicsOnly", (tags = []) => tags.filter((t) => !HIDDEN_TAGS.has(t)));

	eleventyConfig.addFilter("topicMeta", (name) => {
		const meta = site.topics[name] || {};
		return { label: meta.label || name, color: meta.color || "slate", description: meta.description || "" };
	});

	eleventyConfig.addFilter("langGlyph", (lang) => site.languageGlyphs[lang] || "{ }");

	eleventyConfig.addFilter("limit", (arr = [], n) => arr.slice(0, n));
	eleventyConfig.addFilter("exclude", (arr = [], item) => arr.filter((x) => x.url !== item?.url));

	// Posts that share the most topics with the current one
	eleventyConfig.addFilter("related", (posts = [], current, n = 3) => {
		const mine = new Set((current.data?.tags || current.tags || []).filter((t) => !HIDDEN_TAGS.has(t)));
		return posts
			.filter((p) => p.url !== current.url)
			.map((p) => ({ p, score: (p.data.tags || []).filter((t) => mine.has(t)).length }))
			.filter((x) => x.score > 0)
			.sort((a, b) => b.score - a.score || b.p.date - a.p.date)
			.slice(0, n)
			.map((x) => x.p);
	});

	eleventyConfig.addFilter("initials", (name = "") =>
		name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
	);

	eleventyConfig.addFilter("json", (value) => JSON.stringify(value));

	/* ---------------------------------------------------------------------- */
	/* Shortcodes                                                             */
	/* ---------------------------------------------------------------------- */
	eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

	/**
	 * Live demo: renders HTML/CSS/JS inside a sandboxed iframe, with a source tab,
	 * a drag handle to resize the frame, and an Expand button that opens the demo
	 * in a full-screen playground (see src/assets/js/demos.js).
	 *
	 *   {% demo "Accessible disclosure", 260 %}
	 *   <button>…</button>
	 *   <style>…</style>
	 *   <script>…</script>
	 *   {% enddemo %}
	 *
	 * Output contains no blank lines so Markdown leaves it alone.
	 */
	eleventyConfig.addPairedShortcode("demo", (content, title = "Live demo", height = 320) => {
		const src = content.trim();
		const id = "demo-" + Math.random().toString(36).slice(2, 8);
		const doc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${site.demoBaseStyles}</style></head><body>${src}</body></html>`;
		const srcdoc = doc.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/\n/g, "&#10;");
		const highlighted = Prism.highlight(src, Prism.languages.markup, "markup").replace(/\n/g, "&#10;");
		const icon = {
			expand: `<svg aria-hidden="true" viewBox="0 0 20 20" width="14" height="14"><path d="M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
			grip: `<svg aria-hidden="true" viewBox="0 0 6 24" width="6" height="24"><path d="M1.5 4v16M4.5 4v16" stroke="currentColor" stroke-width="1.2"/></svg>`,
		};
		return [
			`<figure class="demo" data-demo data-demo-title="${title}">`,
			`<div class="demo__bar">`,
			`<span class="demo__title"><span class="demo__dot" aria-hidden="true"></span>${title}</span>`,
			`<div class="demo__controls">`,
			`<div class="demo__tabs" role="tablist" aria-label="${title}">`,
			`<button type="button" role="tab" id="${id}-t1" aria-controls="${id}-p1" aria-selected="true">Result</button>`,
			`<button type="button" role="tab" id="${id}-t2" aria-controls="${id}-p2" aria-selected="false" tabindex="-1">Code</button>`,
			`</div>`,
			`<button type="button" class="demo__expand" data-demo-expand aria-haspopup="dialog" hidden>${icon.expand}<span>Expand</span></button>`,
			`</div></div>`,
			`<div class="demo__panel" role="tabpanel" id="${id}-p1" aria-labelledby="${id}-t1">`,
			`<div class="demo__stage" data-demo-stage>`,
			`<div class="demo__frame" data-demo-frame>`,
			`<iframe title="${title} (live demo)" loading="lazy" sandbox="allow-scripts" style="height:${height}px" srcdoc="${srcdoc}"></iframe>`,
			`<div class="demo__handle" data-demo-handle="end" role="separator" aria-orientation="vertical" aria-label="Resize demo width" title="Drag to resize · double-click to reset" tabindex="0" hidden>${icon.grip}</div>`,
			`</div>`,
			`<p class="demo__size" data-demo-size hidden><span data-demo-size-value></span><button type="button" data-demo-reset>Reset</button></p>`,
			`</div>`,
			`</div>`,
			`<div class="demo__panel" role="tabpanel" id="${id}-p2" aria-labelledby="${id}-t2" hidden>`,
			`<pre class="language-html" tabindex="0"><code class="language-html">${highlighted}</code></pre>`,
			`</div>`,
			`</figure>`,
		].join("");
	});

	/** Callout box: {% callout "tip" %}Markdown content{% endcallout %} */
	eleventyConfig.addPairedShortcode("callout", function (content, type = "note", title = "") {
		const labels = { note: "Note", tip: "Tip", warning: "Heads up", a11y: "Accessibility" };
		const md = eleventyConfig.markdownLibrary || null;
		const body = md ? md.render(content.trim()) : content;
		return `<aside class="callout callout--${type}"><p class="callout__label">${title || labels[type] || "Note"}</p>${body.replace(/\n\s*\n/g, "\n")}</aside>`;
	});

	eleventyConfig.amendLibrary("md", (md) => {
		eleventyConfig.markdownLibrary = md;
	});

	/* ---------------------------------------------------------------------- */
	/* Transforms                                                             */
	/* ---------------------------------------------------------------------- */
	// Wrap highlighted code blocks in a figure with a toolbar (language + copy button).
	eleventyConfig.addTransform("codeToolbar", function (content) {
		if (!(this.page.outputPath || "").endsWith(".html")) return content;
		return content.replace(
			/<pre class="language-([\w-]+)"([^>]*)>([\s\S]*?)<\/pre>/g,
			(match, lang, attrs, inner, offset, whole) => {
				// Leave demo source panels alone
				const before = whole.slice(Math.max(0, offset - 120), offset);
				if (before.includes('class="demo__panel"')) return match;
				const label = site.languageLabels[lang] || lang.toUpperCase();
				return `<figure class="code"><div class="code__bar"><span class="code__lang" data-lang="${lang}">${label}</span><button type="button" class="code__copy" data-copy hidden>Copy</button></div><pre class="language-${lang}"${attrs}>${inner}</pre></figure>`;
			}
		);
	});

	/* ---------------------------------------------------------------------- */
	/* Search index (Pagefind) — runs after every build, including --serve     */
	/* ---------------------------------------------------------------------- */
	eleventyConfig.on("eleventy.after", async ({ directories }) => {
		const { index } = await pagefind.createIndex();
		const { errors, page_count } = await index.addDirectory({ path: directories.output });
		if (errors?.length) console.error("[pagefind]", errors);
		await index.writeFiles({ outputPath: `${directories.output}/pagefind` });
		await pagefind.close();
		console.log(`[pagefind] Indexed ${page_count} pages`);
	});

}

export const config = {
	dir: {
		input: "src",
		includes: "_includes",
		data: "_data",
		output: "_site",
	},
	markdownTemplateEngine: "njk",
	htmlTemplateEngine: "njk",
	templateFormats: ["md", "njk", "html"],
};
