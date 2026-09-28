#!/usr/bin/env node
/**
 * Scaffold a new article:  npm run new -- "My post title"
 * Creates src/posts/YYYY-MM-DD-my-post-title.md with starter front matter.
 */
import { writeFileSync, existsSync } from "node:fs";

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
	console.error('Usage: npm run new -- "Post title"');
	process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const file = `src/posts/${date}-${slug}.md`;

if (existsSync(file)) {
	console.error(`Already exists: ${file}`);
	process.exit(1);
}

writeFileSync(
	file,
	`---
title: ${JSON.stringify(title)}
description: One or two sentences shown on cards and in search results.
date: ${date}
tags: [css]            # topics — see src/_data/site.js for the list
languages: [css]       # first one sets the cover glyph
draft: true            # visible in \`npm start\`, hidden from builds
---

Intro paragraph: what problem this solves and where it came up.

## The code

\`\`\`css
/* your snippet */
\`\`\`
`
);
console.log(`Created ${file}`);
