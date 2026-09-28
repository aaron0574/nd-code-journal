/**
 * Global site settings. Available in every template as `site`.
 * Edit freely — this is the single place to rename/re-brand the blog.
 */
export default {
	title: "Code Journal",
	tagline: "Working code from the web team under the Dome",
	description:
		"Practical, copy-ready code examples from day-to-day web design and development work at the University of Notre Dame — HTML, CSS, JavaScript, and accessibility.",
	/**
	 * Absolute site address, used for canonical URLs and the feed.
	 * On Netlify this is automatic: production builds use URL (your live domain),
	 * previews use DEPLOY_PRIME_URL. SITE_URL overrides both if set.
	 */
	url:
		process.env.SITE_URL ||
		(process.env.CONTEXT === "production" ? process.env.URL : process.env.DEPLOY_PRIME_URL) ||
		"http://localhost:8080",
	language: "en",
	author: {
		name: "Aaron Greene",
		role: "Senior Web Designer & Developer, University of Notre Dame",
		email: "agreene5@nd.edu",
		url: "https://www.nd.edu",
		bio: "I design and build websites for the University of Notre Dame. This journal collects the snippets, patterns, and small tools that come out of that work so they're easy to find again — for me and for you.",
	},
	nav: [
		{ label: "Articles", url: "/articles/" },
		{ label: "Topics", url: "/topics/" },
		{ label: "About", url: "/about/" },
	],

	/**
	 * Topic metadata. Keys match the `tags` used in post front matter.
	 * color is one of: navy, gold, sky, green, rose, violet, orange, slate
	 */
	topics: {
		css: { label: "CSS", color: "sky", description: "Layout, modern selectors, custom properties and the cascade." },
		javascript: { label: "JavaScript", color: "gold", description: "Vanilla JS components, progressive enhancement and browser APIs." },
		accessibility: { label: "Accessibility", color: "green", description: "Patterns that work for everyone — keyboard, screen reader and beyond." },
		components: { label: "Components", color: "violet", description: "Reusable UI building blocks." },
		performance: { label: "Performance", color: "orange", description: "Making pages fast and keeping them that way." },
		tooling: { label: "Tooling", color: "slate", description: "Build scripts, workflows and developer experience." },
		html: { label: "HTML", color: "navy", description: "Semantic markup and native elements." },
	},

	/** Big typographic glyph used on generated post covers, keyed by primary language. */
	languageGlyphs: {
		html: "</>",
		css: "{ }",
		scss: "$ { }",
		js: "=>",
		javascript: "=>",
		php: "<?",
		twig: "{% %}",
		json: "[ ]",
		bash: "$_",
	},

	/** Labels shown in the code block toolbar. */
	languageLabels: {
		html: "HTML",
		markup: "HTML",
		css: "CSS",
		scss: "SCSS",
		js: "JavaScript",
		javascript: "JavaScript",
		php: "PHP",
		twig: "Twig",
		json: "JSON",
		bash: "Shell",
		shell: "Shell",
		yaml: "YAML",
		md: "Markdown",
		markdown: "Markdown",
		njk: "Nunjucks",
		diff: "Diff",
	},

	/** Base styles injected into every {% demo %} iframe so demos look consistent. */
	demoBaseStyles:
		"*,*::before,*::after{box-sizing:border-box}body{margin:0;padding:1.5rem;font:16px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif;color:#0c2340;background:#fff}",
};
