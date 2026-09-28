export default {
	layout: "layouts/post.njk",
	permalink: "/articles/{{ page.fileSlug }}/",
	eleventyComputed: {
		// First language listed drives the cover glyph
		primaryLanguage: (data) => (data.languages && data.languages[0]) || "html",
	},
};
