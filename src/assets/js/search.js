/* Full-text search powered by Pagefind (https://pagefind.app).
   The index is generated into /pagefind/ after every Eleventy build.
   Supports ?q=…&topic=…&language=… in the URL. */

const root = document.querySelector("[data-search]");
const input = root.querySelector("[data-search-input]");
const form = root.querySelector("[data-search-form]");
const results = root.querySelector("[data-search-results]");
const status = root.querySelector("[data-search-status]");
const filtersEl = root.querySelector("[data-search-filters]");

const PAGE_SIZE = 10;
const FILTER_LABELS = { topic: "Topic", language: "Language" };
let pagefind;
let selected = { topic: new Set(), language: new Set() };
let token = 0;

const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

async function init() {
	try {
		pagefind = await import("/pagefind/pagefind.js");
		await pagefind.options({ excerptLength: 28 });
		pagefind.init();
	} catch (err) {
		status.textContent = "Search index not found. Run a build (npm run build) to generate it.";
		console.error(err);
		return;
	}

	const params = new URLSearchParams(location.search);
	input.value = params.get("q") || "";
	for (const key of Object.keys(selected)) {
		(params.get(key) || "").split(",").filter(Boolean).forEach((v) => selected[key].add(v));
	}

	await renderFilters();
	run();
	if (!input.value) input.focus();
}

async function renderFilters() {
	const all = await pagefind.filters();
	filtersEl.innerHTML = Object.entries(FILTER_LABELS)
		.filter(([key]) => all[key])
		.map(([key, label]) => {
			const opts = Object.entries(all[key])
				.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
				.map(([value, count]) => `
					<label>
						<input type="checkbox" name="${key}" value="${escape(value)}" ${selected[key].has(value) ? "checked" : ""}>
						<span>${escape(value)}</span>
						<span class="count">${count}</span>
					</label>`)
				.join("");
			return `<fieldset><legend>${label}</legend>${opts}</fieldset>`;
		})
		.join("");
}

filtersEl.addEventListener("change", (e) => {
	const box = e.target;
	if (box.type !== "checkbox") return;
	box.checked ? selected[box.name].add(box.value) : selected[box.name].delete(box.value);
	run();
});

let debounce;
input.addEventListener("input", () => {
	clearTimeout(debounce);
	debounce = setTimeout(run, 150);
});
form.addEventListener("submit", (e) => { e.preventDefault(); run(); });

function activeFilters() {
	const out = {};
	for (const [key, set] of Object.entries(selected)) if (set.size) out[key] = { any: [...set] };
	return out;
}

function syncUrl(q) {
	const p = new URLSearchParams();
	if (q) p.set("q", q);
	for (const [key, set] of Object.entries(selected)) if (set.size) p.set(key, [...set].join(","));
	history.replaceState(null, "", p.size ? `?${p}` : location.pathname);
}

async function run() {
	const q = input.value.trim();
	const filters = activeFilters();
	const hasFilters = Object.keys(filters).length > 0;
	syncUrl(q);
	const mine = ++token;

	// No query + no filters: show newest articles
	const search = await pagefind.search(q || null, {
		filters,
		sort: q ? undefined : { date: "desc" },
	});
	if (mine !== token) return; // a newer search started

	if (!q && !hasFilters && search.results.length === 0) {
		status.textContent = "";
		results.innerHTML = "";
		return;
	}

	const total = search.results.length;
	status.textContent = total
		? `${total} result${total === 1 ? "" : "s"}${q ? ` for “${q}”` : ""}`
		: `No results${q ? ` for “${q}”` : ""}. Try fewer words or remove a filter.`;

	results.innerHTML = "";
	await renderPage(search.results, 0, mine);
}

async function renderPage(all, start, mine) {
	const slice = all.slice(start, start + PAGE_SIZE);
	const data = await Promise.all(slice.map((r) => r.data()));
	if (mine !== token) return;

	results.querySelector(".search__more")?.remove();
	results.insertAdjacentHTML(
		"beforeend",
		data
			.map((d) => {
				const topics = (d.filters?.topic || []).join(" · ");
				const subs = (d.sub_results || [])
					.filter((s) => s.url !== d.url && s.title !== d.meta.title)
					.slice(0, 3)
					.map((s) => `<li><a href="${s.url}">${escape(s.title)}</a></li>`)
					.join("");
				return `
				<li class="result" data-color="${escape(d.meta.color || "gold")}">
					<h2><a href="${d.url}">${escape(d.meta.title)}</a></h2>
					<p class="result__meta">${escape(d.meta.date || "")}${topics ? ` · ${escape(topics)}` : ""}</p>
					<p class="result__excerpt">${d.excerpt}</p>
					${subs ? `<ul class="result__subs" role="list">${subs}</ul>` : ""}
				</li>`;
			})
			.join("")
	);

	if (start + PAGE_SIZE < all.length) {
		const li = document.createElement("li");
		li.className = "search__more";
		li.innerHTML = `<button type="button" class="btn btn--outline">Load more results</button>`;
		li.querySelector("button").addEventListener("click", () => renderPage(all, start + PAGE_SIZE, mine));
		results.append(li);
	}
}

init();
