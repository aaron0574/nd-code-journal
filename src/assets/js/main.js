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
	});
	systemDark.addEventListener("change", sync);
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
