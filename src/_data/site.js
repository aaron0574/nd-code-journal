/**
 * Global site settings. Available in every template as `site`.
 * Edit freely — this is the single place to rename/re-brand the blog.
 */
export default {
	title: "Code Journal",
	tagline: "From the web team at Notre Dame",
	description:
		"Accessible components, CSS, and hard-won solutions from building websites at the University of Notre Dame, shared so you can use them on your own sites.",
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
		role: "Senior Designer, University of Notre Dame",
		/** Profile photo for the About page, e.g. "/assets/img/aaron.jpg" (square works best). Leave empty to show initials. */
		photo: "",
		links: {
			coffee: "https://buymeacoffee.com/aarongreene",
			instagram: "https://www.instagram.com/aarons_sketchbook",
			linkedin: "https://www.linkedin.com/in/agreene15/",
		},
		email: "agreene5@nd.edu",
		url: "https://www.nd.edu",
		bio: "Components, CSS, and solutions from building the University of Notre Dame's websites. Accessible, usable, and understandable first, then pushed further.",
	},
	/**
	 * Comments via Giscus (GitHub Discussions) — https://giscus.app
	 * The comment box only appears once repoId and categoryId are filled in.
	 */
	comments: {
		repo: "aaron0574/nd-code-journal",
		repoId: "R_kgDOUwr_yw",
		category: "Comments",
		categoryId: "DIC_kwDOUwr_y84DGmM-",
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
