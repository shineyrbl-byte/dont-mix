import { PRODUCTS } from "./data.js";
import { checkAll, checkStorage, findProduct } from "./engine.js";
import { esc, pairCard } from "./render.js";
import { t, gName, pName, storageText, basics } from "./i18n.js";

const KEY = "dont-mix:cupboard";
const $select = document.getElementById("cup-add");
const $list = document.getElementById("cup-list");
const $result = document.getElementById("cup-result");
const listeners = [];

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
export const cupboardItems = () => ids.map(findProduct);
export const onCupboardChange = (fn) => listeners.push(fn);

$select.innerHTML =
  `<option value="">${t("cup.choose")}</option>` +
  PRODUCTS.map((p) => `<option value="${p.id}">${esc(pName(p))}</option>`).join("");

document.getElementById("cup-basics").innerHTML = basics().map((b) => `<li>${esc(b)}</li>`).join("");

function draw() {
  const items = cupboardItems();
  $list.innerHTML = items
    .map(
      (p, i) => `<li><span>${esc(pName(p))} <small class="meta">· ${esc(p.groups.map(gName).join(", "))}</small></span>
        <button class="link" data-remove="${i}" aria-label="${esc(t("cup.removeAria", { name: pName(p) }))}">${t("cup.remove")}</button></li>`,
    )
    .join("");
  for (const fn of listeners) fn(items);

  if (items.length < 2) {
    $result.innerHTML = items.length ? `<p class="hint">${t("cup.more")}</p>` : "";
    return;
  }

  const storage = checkStorage(items);
  const mixes = checkAll(items).filter((r) => r.level === "danger" || r.level === "warning");
  const unknown = items.filter((p) => p.groups.includes("unknown"));

  const storageHtml = storage.length
    ? `<article class="card warning"><h3>📦 ${t("cup.apart.h")}</h3><ul>${storage
        .map((s) => `<li><strong>${esc(pName(s.a))}</strong> + <strong>${esc(pName(s.b))}</strong>: ${esc(storageText(s.key))}</li>`)
        .join("")}</ul></article>`
    : `<article class="card info"><h3>📦 ${t("cup.fine.h")}</h3><p>${t("cup.fine.p")}</p></article>`;

  const unknownHtml = unknown.length
    ? `<article class="card unknown"><h3>❔ ${t("cup.unknown.h")}</h3><p>${esc(t("cup.unknown.p", { names: unknown.map(pName).join(", ") }))}</p></article>`
    : "";

  const mixHtml = mixes.length ? `<h3>${t("cup.never.h")}</h3>${mixes.map(pairCard).join("")}` : "";

  $result.innerHTML = storageHtml + unknownHtml + mixHtml;
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
