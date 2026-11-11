import { PRODUCTS, GROUPS } from "./data.js";
import { checkAll, checkStorage, findProduct, worstLevel } from "./engine.js";
import { esc, pairCard } from "./render.js";

const KEY = "dont-mix:cupboard";
const $select = document.getElementById("cup-add");
const $list = document.getElementById("cup-list");
const $result = document.getElementById("cup-result");

// Saved only in this browser. If storage is blocked (private mode), it
// still works for this visit.
function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]").filter(findProduct);
  } catch {
    return [];
  }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* not saved, still usable */
  }
}

let ids = load();

$select.innerHTML =
  `<option value="">Choose a product…</option>` +
  PRODUCTS.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("");

function draw() {
  const items = ids.map(findProduct);
  $list.innerHTML = items
    .map(
      (p, i) => `<li><span>${esc(p.name)} <small class="meta">· ${esc(p.groups.map((g) => GROUPS[g].name).join(", "))}</small></span>
        <button class="link" data-remove="${i}" aria-label="Remove ${esc(p.name)}">Remove</button></li>`,
    )
    .join("");

  if (items.length < 2) {
    $result.innerHTML = items.length ? `<p class="hint">Add at least one more product.</p>` : "";
    return;
  }

  const storage = checkStorage(items);
  const mixes = checkAll(items).filter((r) => r.level === "danger" || r.level === "warning");
  const unknown = items.filter((p) => p.groups.includes("unknown"));

  const storageHtml = storage.length
    ? `<article class="card warning"><h3>📦 Store these apart</h3><ul>${storage
        .map((s) => `<li><strong>${esc(s.a.name)}</strong> and <strong>${esc(s.b.name)}</strong>: ${esc(s.advice)}</li>`)
        .join("")}</ul></article>`
    : `<article class="card info"><h3>📦 Storage looks fine</h3><p>No pairs here that we know should be kept apart. Keep caps tight and everything out of children's reach.</p></article>`;

  const unknownHtml = unknown.length
    ? `<article class="card unknown"><h3>❔ Check these labels</h3><p>${unknown.map((p) => esc(p.name)).join(", ")}: we don't know what's inside, so we can't check them.</p></article>`
    : "";

  const mixHtml = mixes.length
    ? `<h3>Never use these one straight after the other without rinsing</h3>${mixes.map(pairCard).join("")}`
    : "";

  $result.innerHTML = storageHtml + unknownHtml + mixHtml;
  $result.dataset.level = worstLevel(mixes);
}

document.getElementById("cup-add-btn").addEventListener("click", () => {
  const id = $select.value;
  if (!id) return $select.focus();
  if (!ids.includes(id)) ids.push(id);
  $select.value = "";
  save();
  draw();
});

$list.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-remove]");
  if (!btn) return;
  ids.splice(Number(btn.dataset.remove), 1);
  save();
  draw();
  $select.focus();
});

draw();
