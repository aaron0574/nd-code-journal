/* Site-wide progressive enhancements. Everything here is optional:
   the site works without JavaScript. */

/* Theme toggle ------------------------------------------------------------ */
const toggle = document.querySelector("[data-theme-toggle]");
if (toggle) {
	toggle.hidden = false;
	const root = document.documentElement;
	const systemDark = matchMedia("(prefers-color-scheme: dark)");
	const current = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");
	const sync = () => toggle.setAttribute("aria-pressed", String(current() === "dark"));
	sync();
	toggle.addEventListener("click", () => {
		const next = current() === "dark" ? "light" : "dark";
		root.dataset.theme = next;
		try { localStorage.setItem("theme", next); } catch (e) {}
		sync();
		setGiscusTheme();
	});
	systemDark.addEventListener("change", sync);
}

/* Comments (Giscus) ------------------------------------------------------
   Loaded once the page is idle (or sooner if the reader scrolls near it), so
   the reaction summary under the byline can show live counts. Kept in step
   with the site's light/dark theme. */
const giscusHost = document.querySelector("[data-giscus]");
const giscusTheme = () => {
	const t = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
	return t === "dark" ? "dark_dimmed" : "light";
};
const setGiscusTheme = () => {
	const frame = document.querySelector("iframe.giscus-frame");
	frame?.contentWindow.postMessage({ giscus: { setConfig: { theme: giscusTheme() } } }, "https://giscus.app");
};
if (giscusHost) {
	const load = () => {
		const s = document.createElement("script");
		s.src = "https://giscus.app/client.js";
		s.async = true;
		s.crossOrigin = "anonymous";
		const attrs = {
			repo: giscusHost.dataset.repo,
			"repo-id": giscusHost.dataset.repoId,
			category: giscusHost.dataset.category,
			"category-id": giscusHost.dataset.categoryId,
			mapping: "pathname",
			strict: "1",
			"reactions-enabled": "1",
			"emit-metadata": "1",
			"input-position": "top",
			theme: giscusTheme(),
			lang: "en",
		};
		for (const [k, v] of Object.entries(attrs)) s.setAttribute(`data-${k}`, v);
		giscusHost.append(s);
	};
	let loaded = false;
	const loadOnce = () => { if (!loaded) { loaded = true; io.disconnect(); load(); } };
	const io = new IntersectionObserver((entries) => {
		if (entries.some((e) => e.isIntersecting)) loadOnce();
	}, { rootMargin: "600px 0px" });
	io.observe(giscusHost);
	// Don't compete with the article itself: wait until the page has settled
	addEventListener("load", () => (window.requestIdleCallback || ((cb) => setTimeout(cb, 1500)))(loadOnce, { timeout: 4000 }));

	/* Reaction summary under the byline ------------------------------------ */
	const summary = document.querySelector("[data-reaction-summary]");
	if (summary) {
		summary.hidden = false;
		const counts = summary.querySelector("[data-reaction-counts]");
		const cta = summary.querySelector("[data-reaction-cta]");
		const EMOJI = { THUMBS_UP: "👍", HEART: "❤️", HOORAY: "🎉", ROCKET: "🚀", LAUGH: "😄", EYES: "👀", CONFUSED: "😕", THUMBS_DOWN: "👎" };
		const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

		addEventListener("message", (e) => {
			if (e.origin !== "https://giscus.app" || !e.data?.giscus) return;
			const d = e.data.giscus.discussion;
			if (!d) return; // no thread yet (nobody has commented) — keep the plain call to action
			const shown = Object.entries(d.reactions || {})
				.filter(([, r]) => r.count > 0)
				.sort((a, b) => b[1].count - a[1].count)
				.slice(0, 4);
			counts.replaceChildren(...shown.map(([key, r]) => {
				const el = document.createElement("span");
				el.className = "reaction-summary__item";
				el.innerHTML = `<span aria-hidden="true">${EMOJI[key] || "•"}</span>${r.count}`;
				return el;
			}));
			const comments = (d.totalCommentCount || 0) + (d.totalReplyCount || 0);
			cta.textContent = comments ? plural(comments, "comment") : "React or comment";
			summary.setAttribute("aria-label", `${plural(d.reactionCount || 0, "reaction")} and ${plural(comments, "comment")}. Jump to the discussion.`);
		});
	}
	matchMedia("(prefers-color-scheme: dark)").addEventListener("change", setGiscusTheme);
}

/* Press "/" to jump to search --------------------------------------------- */
document.addEventListener("keydown", (e) => {
	if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
	const t = e.target;
	if (t.closest("input, textarea, select, [contenteditable]")) return;
	const field = document.querySelector("[data-search-input]") || document.getElementById("header-q");
	if (field) { e.preventDefault(); field.focus(); }
});

/* Copy buttons on code blocks --------------------------------------------- */
if (navigator.clipboard) {
	for (const btn of document.querySelectorAll("[data-copy]")) {
		btn.hidden = false;
		const lang = btn.previousElementSibling?.textContent || "code";
		btn.setAttribute("aria-label", `Copy ${lang} code`);
		btn.addEventListener("click", async () => {
			const code = btn.closest(".code").querySelector("pre code, pre");
			try {
				await navigator.clipboard.writeText(code.innerText.replace(/\n$/, ""));
				btn.textContent = "Copied!";
				btn.dataset.state = "copied";
			} catch {
				btn.textContent = "Press ⌘C";
			}
			setTimeout(() => { btn.textContent = "Copy"; delete btn.dataset.state; }, 1800);
		});
	}
}

/* Demo tabs (Result / Code) ------------------------------------------------ */
for (const demo of document.querySelectorAll("[data-demo]")) {
	const tabs = [...demo.querySelectorAll('[role="tab"]')];
	const select = (tab) => {
		for (const t of tabs) {
			const on = t === tab;
			t.setAttribute("aria-selected", String(on));
			t.tabIndex = on ? 0 : -1;
			document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
		}
	};
	tabs.forEach((tab, i) => {
		tab.addEventListener("click", () => select(tab));
		tab.addEventListener("keydown", (e) => {
			const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
			if (!dir) return;
			const next = tabs[(i + dir + tabs.length) % tabs.length];
			select(next);
			next.focus();
		});
	});
}

/* Resizable demos + full-screen playground (only loaded when needed) ------ */
if (document.querySelector("[data-demo]")) import("./demos.js");

/* "On this page" table of contents ---------------------------------------- */
const toc = document.querySelector("[data-toc]");
const headings = [...document.querySelectorAll(".prose h2[id]")];
if (toc && headings.length >= 2) {
	const list = toc.querySelector("ol");
	const links = headings.map((h) => {
		const li = document.createElement("li");
		const a = document.createElement("a");
		a.href = `#${h.id}`;
		a.textContent = h.textContent;
		li.append(a);
		list.append(li);
		return a;
	});
	toc.hidden = false;

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				links.forEach((a) => a.removeAttribute("aria-current"));
				links[headings.indexOf(entry.target)]?.setAttribute("aria-current", "true");
			}
		},
		{ rootMargin: "0px 0px -70% 0px" }
	);
	headings.forEach((h) => observer.observe(h));
}
