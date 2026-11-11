import { PRODUCTS } from "./data.js";
import { checkAll, worstLevel } from "./engine.js";
import { esc, pairCard, verdictCard } from "./render.js";
import { t, pName, pHint } from "./i18n.js";

// Products made in the label checker are added here too.
const custom = [];
const picked = new Set();
const listeners = [];

const $search = document.getElementById("mix-search");
const $options = document.getElementById("mix-options");
const $count = document.getElementById("mix-count");
const $clear = document.getElementById("mix-clear");
const $result = document.getElementById("mix-result");

const all = () => [...custom, ...PRODUCTS];
export const pickedItems = () => all().filter((p) => picked.has(p.id));
export const onChange = (fn) => listeners.push(fn);

function drawOptions() {
  const q = $search.value.trim().toLowerCase();
  // Search both languages, so "ब्लीच" and "bleach" both work.
  const list = all().filter(
    (p) => !q || picked.has(p.id) || `${p.name} ${p.hint} ${pName(p)} ${pHint(p)}`.toLowerCase().includes(q),
  );
  $options.innerHTML = list.length
    ? list
        .map(
          (p) => `<button class="chip${p.custom ? " custom" : ""}" data-id="${esc(p.id)}" aria-pressed="${picked.has(p.id)}">
            ${esc(pName(p))}<small>${esc(pHint(p))}</small></button>`,
        )
        .join("")
    : `<p class="hint">${t("mix.noMatch")}</p>`;
}

function drawResult() {
  const items = pickedItems();
  $count.textContent = items.length ? t("mix.count", { n: items.length }) : t("mix.none");
  $clear.hidden = !items.length;
  if (items.length < 2) {
    $result.innerHTML = items.length ? `<p class="hint">${t("mix.oneMore")}</p>` : "";
  } else {
    const results = checkAll(items);
    $result.innerHTML = verdictCard(worstLevel(results), `<div class="actions" id="mix-actions"></div>`) + results.map(pairCard).join("");
  }
  for (const fn of listeners) fn(items);
}

$options.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  const id = btn.dataset.id;
  picked.has(id) ? picked.delete(id) : picked.add(id);
  btn.setAttribute("aria-pressed", String(picked.has(id)));
  drawResult();
});

$search.addEventListener("input", drawOptions);
$clear.addEventListener("click", () => {
  picked.clear();
  drawOptions();
  drawResult();
});

export function addCustomProduct(product) {
  custom.unshift(product);
  picked.add(product.id);
  $search.value = "";
  drawOptions();
  drawResult();
}

export function setPicked(ids) {
  picked.clear();
  for (const id of ids) picked.add(id);
  drawOptions();
  drawResult();
}

drawOptions();
drawResult();
