/* Instant, client-side filtering for the /articles/ page.
   Reads data-* attributes rendered on each card; state is mirrored to the URL
   (?topic=css&lang=js&q=grid&sort=az) so filtered views can be shared. */

const root = document.querySelector("[data-filters]");
const grid = document.querySelector("[data-card-grid]");

if (root && grid) {
	root.hidden = false;
	const cards = [...grid.querySelectorAll("[data-card]")];
	const text = root.querySelector("[data-filter-text]");
	const lang = root.querySelector("[data-filter-lang]");
	const sort = root.querySelector("[data-filter-sort]");
	const topicButtons = [...root.querySelectorAll("[data-topic]")];
	const status = root.querySelector("[data-filter-status]");
	const empty = document.querySelector("[data-filter-empty]");

	const state = { q: "", topics: new Set(), lang: "", sort: "new" };

	// Restore from URL
	const params = new URLSearchParams(location.search);
	state.q = params.get("q") || "";
	state.lang = params.get("lang") || "";
	state.sort = params.get("sort") || "new";
	(params.get("topic") || "").split(",").filter(Boolean).forEach((t) => state.topics.add(t));

	text.value = state.q;
	lang.value = state.lang;
	sort.value = state.sort;

	function apply() {
		const words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
		let shown = 0;

		for (const card of cards) {
			const topics = card.dataset.topics.split(" ");
			const langs = card.dataset.languages.split(" ");
			const match =
				words.every((w) => card.dataset.text.includes(w)) &&
				(state.topics.size === 0 || [...state.topics].every((t) => topics.includes(t))) &&
				(!state.lang || langs.includes(state.lang));
			card.hidden = !match;
			if (match) shown++;
		}

		const sorted = [...cards].sort((a, b) => {
			if (state.sort === "az") return a.dataset.title.localeCompare(b.dataset.title);
			const diff = a.dataset.date.localeCompare(b.dataset.date);
			return state.sort === "old" ? diff : -diff;
		});
		grid.append(...sorted);

		topicButtons.forEach((b) => {
			const t = b.dataset.topic;
			b.setAttribute("aria-pressed", String(t === "" ? state.topics.size === 0 : state.topics.has(t)));
		});

		status.textContent = `Showing ${shown} of ${cards.length} article${cards.length === 1 ? "" : "s"}`;
		empty.hidden = shown !== 0;

		const p = new URLSearchParams();
		if (state.q) p.set("q", state.q);
		if (state.topics.size) p.set("topic", [...state.topics].join(","));
		if (state.lang) p.set("lang", state.lang);
		if (state.sort !== "new") p.set("sort", state.sort);
		history.replaceState(null, "", p.size ? `?${p}` : location.pathname);
	}

	text.addEventListener("input", () => { state.q = text.value.trim(); apply(); });
	lang.addEventListener("change", () => { state.lang = lang.value; apply(); });
	sort.addEventListener("change", () => { state.sort = sort.value; apply(); });
	topicButtons.forEach((b) =>
		b.addEventListener("click", () => {
			const t = b.dataset.topic;
			if (t === "") state.topics.clear();
			else state.topics.has(t) ? state.topics.delete(t) : state.topics.add(t);
			apply();
		})
	);
	document.querySelector("[data-filter-reset]")?.addEventListener("click", () => {
		state.q = ""; state.lang = ""; state.sort = "new"; state.topics.clear();
		text.value = ""; lang.value = ""; sort.value = "new";
		apply();
		text.focus();
	});

	apply();
}
