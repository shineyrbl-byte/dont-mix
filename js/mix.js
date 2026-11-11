import { PRODUCTS } from "./data.js";
import { checkAll, worstLevel } from "./engine.js";
import { esc, pairCard, verdictCard } from "./render.js";

// Products made in the label checker are added here too.
const custom = [];
const picked = new Set();

const $search = document.getElementById("mix-search");
const $options = document.getElementById("mix-options");
const $count = document.getElementById("mix-count");
const $clear = document.getElementById("mix-clear");
const $result = document.getElementById("mix-result");

const all = () => [...custom, ...PRODUCTS];

function drawOptions() {
  const q = $search.value.trim().toLowerCase();
  const list = all().filter(
    (p) => !q || picked.has(p.id) || `${p.name} ${p.hint}`.toLowerCase().includes(q),
  );
  $options.innerHTML = list.length
    ? list
        .map(
          (p) => `<button class="chip${p.custom ? " custom" : ""}" data-id="${esc(p.id)}" aria-pressed="${picked.has(p.id)}">
            ${esc(p.name)}<small>${esc(p.hint)}</small></button>`,
        )
        .join("")
    : `<p class="hint">No match. Try the <strong>Read a label</strong> tab to add it from the bottle.</p>`;
}

function drawResult() {
  const items = all().filter((p) => picked.has(p.id));
  $count.textContent = items.length ? `${items.length} picked` : "Nothing picked yet";
  $clear.hidden = !items.length;
  if (items.length < 2) {
    $result.innerHTML = items.length
      ? `<p class="hint">Pick one more to check the mix.</p>`
      : "";
    return;
  }
  const results = checkAll(items);
  $result.innerHTML = verdictCard(worstLevel(results)) + results.map(pairCard).join("");
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

drawOptions();
