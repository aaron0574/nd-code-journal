/* Live demo enhancements
   ----------------------------------------------------------------------------
   1. Inline resize: drag the handle on the right edge of a demo (or focus it
      and use the arrow keys) to narrow the frame and watch container queries
      and media queries respond. A width readout and Reset appear while resized.
   2. Playground: "Expand" opens the demo in a full-screen <dialog> on this
      page, with device-width presets, handles on both sides, and the source
      alongside. Nothing leaves the site. Esc or Close returns to the article.

   Loaded by main.js only on pages that contain a demo. */

const MIN_WIDTH = 240;
const STEP = 10;
const BIG_STEP = 50;

/* Resizer -------------------------------------------------------------------
   Makes `frame` resizable by dragging or keyboard on each `handle`.
   symmetric: width grows from the centre (both handles move), used in the
   playground where the frame is centred. */
function makeResizable({ frame, handles, getMax, symmetric = false, onChange }) {
	const iframe = frame.querySelector("iframe");
	let width = null; // iframe width in px; null = fill the available space

	const chrome = () => frame.offsetWidth - iframe.offsetWidth; // space taken by handles
	const maxWidth = () => Math.max(MIN_WIDTH, getMax() - chrome());
	const clamp = (w) => Math.round(Math.min(Math.max(w, MIN_WIDTH), maxWidth()));
	const current = () => iframe.getBoundingClientRect().width;

	function set(w) {
		width = w == null ? null : clamp(w);
		frame.style.width = width == null ? "" : `${width + chrome()}px`;
		const actual = Math.round(current());
		const max = Math.round(maxWidth());
		for (const h of handles) {
			h.setAttribute("aria-valuemin", MIN_WIDTH);
			h.setAttribute("aria-valuemax", max);
			h.setAttribute("aria-valuenow", actual);
			h.setAttribute("aria-valuetext", `${actual} pixels wide`);
		}
		onChange?.(actual, width != null && actual < max - 1, max);
	}

	for (const handle of handles) {
		const dir = handle.dataset.demoHandle === "start" ? -1 : 1;
		const factor = symmetric ? 2 : 1;
		handle.hidden = false;

		handle.addEventListener("pointerdown", (e) => {
			e.preventDefault();
			handle.setPointerCapture(e.pointerId);
			const startX = e.clientX;
			const startW = current();
			frame.classList.add("is-resizing");
			iframe.style.pointerEvents = "none"; // keep pointer events from vanishing into the iframe

			const move = (ev) => set(startW + (ev.clientX - startX) * dir * factor);
			const up = () => {
				frame.classList.remove("is-resizing");
				iframe.style.pointerEvents = "";
				handle.removeEventListener("pointermove", move);
				handle.removeEventListener("pointerup", up);
				handle.removeEventListener("pointercancel", up);
			};
			handle.addEventListener("pointermove", move);
			handle.addEventListener("pointerup", up);
			handle.addEventListener("pointercancel", up);
		});

		handle.addEventListener("keydown", (e) => {
			const step = e.shiftKey ? BIG_STEP : STEP;
			const now = current();
			const map = {
				ArrowLeft: now - step * dir * factor,
				ArrowRight: now + step * dir * factor,
				Home: MIN_WIDTH,
				End: null,
			};
			if (!(e.key in map)) return;
			e.preventDefault();
			set(map[e.key]);
		});

		// Double-click a handle to snap back to full width
		handle.addEventListener("dblclick", () => set(null));
	}

	// Stay in bounds when the window or article column changes size
	new ResizeObserver(() => set(width)).observe(frame.parentElement);

	return { set };
}

/** Content-box width of an element (clientWidth minus padding). */
function innerWidth(el) {
	const cs = getComputedStyle(el);
	return el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
}

/* Inline demos ------------------------------------------------------------- */
const demos = [...document.querySelectorAll("[data-demo]")];

for (const demo of demos) {
	const stage = demo.querySelector("[data-demo-stage]");
	const frame = demo.querySelector("[data-demo-frame]");
	const handle = demo.querySelector("[data-demo-handle]");
	const size = demo.querySelector("[data-demo-size]");
	const sizeValue = demo.querySelector("[data-demo-size-value]");
	const expand = demo.querySelector("[data-demo-expand]");

	const resizer = makeResizable({
		frame,
		handles: [handle],
		getMax: () => innerWidth(stage),
		onChange(w, narrowed) {
			sizeValue.textContent = `${w}px`;
			size.hidden = !narrowed;
			stage.classList.toggle("is-narrowed", narrowed);
		},
	});
	demo.querySelector("[data-demo-reset]").addEventListener("click", () => {
		resizer.set(null);
		handle.focus();
	});

	expand.hidden = false;
	expand.addEventListener("click", () => openPlayground(demo, expand));
}

/* Playground dialog (one shared instance) ---------------------------------- */
const PRESETS = [
	{ label: "Phone", width: 375 },
	{ label: "Tablet", width: 768 },
	{ label: "Laptop", width: 1280 },
	{ label: "Fit", width: null },
];

let pg; // lazily built

function buildPlayground() {
	const dialog = document.createElement("dialog");
	dialog.className = "playground";
	dialog.setAttribute("aria-labelledby", "playground-title");
	dialog.innerHTML = `
		<header class="playground__bar">
			<div class="playground__heading">
				<p class="playground__eyebrow">Live demo</p>
				<h2 id="playground-title" class="playground__title"></h2>
			</div>
			<div class="playground__tools">
				<div class="playground__presets" role="group" aria-label="Preview width">
					${PRESETS.map((p) => `<button type="button" data-width="${p.width ?? ""}" aria-pressed="false">${p.label}${p.width ? `<span>${p.width}</span>` : ""}</button>`).join("")}
				</div>
				<output class="playground__readout" data-readout aria-live="polite"></output>
				<span class="playground__sep" aria-hidden="true"></span>
				<button type="button" class="playground__btn" data-toggle-code aria-pressed="false">
					<svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16"><path d="M7 5 2 10l5 5M13 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
					<span>Code</span>
				</button>
				<button type="button" class="playground__btn" data-close>
					<svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16"><path d="M5 5l10 10M15 5 5 15" stroke="currentColor" stroke-width="1.6"/></svg>
					<span>Close</span>
				</button>
			</div>
		</header>
		<div class="playground__body">
			<div class="playground__canvas" data-canvas>
				<div class="playground__frame" data-frame>
					<div class="playground__handle" data-demo-handle="start" role="separator" aria-orientation="vertical" aria-label="Resize preview width" title="Drag to resize · double-click to fit" tabindex="0">
						<svg aria-hidden="true" viewBox="0 0 6 24" width="6" height="24"><path d="M1.5 4v16M4.5 4v16" stroke="currentColor" stroke-width="1.2"/></svg>
					</div>
					<iframe title="" sandbox="allow-scripts"></iframe>
					<div class="playground__handle" data-demo-handle="end" role="separator" aria-orientation="vertical" aria-label="Resize preview width" title="Drag to resize · double-click to fit" tabindex="0">
						<svg aria-hidden="true" viewBox="0 0 6 24" width="6" height="24"><path d="M1.5 4v16M4.5 4v16" stroke="currentColor" stroke-width="1.2"/></svg>
					</div>
				</div>
			</div>
			<section class="playground__code" data-code hidden aria-label="Source code">
				<div class="code__bar"><span class="code__lang">HTML</span><button type="button" class="code__copy" data-copy-code>Copy</button></div>
				<div data-code-body></div>
			</section>
		</div>`;
	document.body.append(dialog);

	const q = (s) => dialog.querySelector(s);
	const canvas = q("[data-canvas]");
	const frame = q("[data-frame]");
	const iframe = q("iframe");
	const readout = q("[data-readout]");
	const presetButtons = [...dialog.querySelectorAll("[data-width]")];
	const codeToggle = q("[data-toggle-code]");
	const codePane = q("[data-code]");
	let returnFocus = null;

	const syncPresets = (w, isFit) => {
		for (const b of presetButtons) {
			const pw = b.dataset.width ? Number(b.dataset.width) : null;
			b.setAttribute("aria-pressed", String(pw == null ? isFit : !isFit && Math.abs(pw - w) <= 1));
		}
	};

	const resizer = makeResizable({
		frame,
		handles: [...dialog.querySelectorAll("[data-demo-handle]")],
		getMax: () => innerWidth(canvas),
		symmetric: true,
		onChange(w, narrowed, max) {
			readout.textContent = `${w} px`;
			syncPresets(w, !narrowed);
			// Presets wider than the screen can't be shown, so switch them off
			for (const b of presetButtons) {
				const tooWide = Number(b.dataset.width) > max;
				b.disabled = tooWide;
				b.title = tooWide ? "Needs a wider screen" : "";
			}
		},
	});

	for (const b of presetButtons) {
		b.addEventListener("click", () => resizer.set(b.dataset.width ? Number(b.dataset.width) : null));
	}

	codeToggle.addEventListener("click", () => {
		const show = codePane.hidden;
		codePane.hidden = !show;
		codeToggle.setAttribute("aria-pressed", String(show));
	});

	q("[data-copy-code]").addEventListener("click", async (e) => {
		const btn = e.currentTarget;
		try {
			await navigator.clipboard.writeText(codePane.querySelector("pre").innerText.trim());
			btn.textContent = "Copied!";
			btn.dataset.state = "copied";
		} catch {
			btn.textContent = "Press ⌘C";
		}
		setTimeout(() => { btn.textContent = "Copy"; delete btn.dataset.state; }, 1800);
	});

	q("[data-close]").addEventListener("click", () => dialog.close());
	// Click on the dimmed backdrop closes too
	dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
	dialog.addEventListener("close", () => {
		document.documentElement.classList.remove("has-playground");
		iframe.removeAttribute("srcdoc"); // stop any running demo scripts
		returnFocus?.focus();
	});

	return {
		open(demo, trigger) {
			returnFocus = trigger;
			const source = demo.querySelector("iframe");
			q("#playground-title").textContent = demo.dataset.demoTitle || "Live demo";
			iframe.title = source.title;
			iframe.srcdoc = source.getAttribute("srcdoc");
			q("[data-code-body]").replaceChildren(demo.querySelector('[role="tabpanel"] pre').cloneNode(true));
			codePane.hidden = true;
			codeToggle.setAttribute("aria-pressed", "false");
			document.documentElement.classList.add("has-playground");
			dialog.showModal();
			resizer.set(null);
			q("[data-width='']").focus();
		},
	};
}

function openPlayground(demo, trigger) {
	pg ??= buildPlayground();
	pg.open(demo, trigger);
}
