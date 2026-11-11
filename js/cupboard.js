import { PRODUCTS, GROUPS } from "./data.js";
import { checkAll, checkStorage, findProduct, encodeShare, decodeShare } from "./engine.js";
import { esc, pairCard } from "./render.js";
import { t, gName, pName, storageText, basics } from "./i18n.js";

const KEY = "dont-mix:cupboard";
const $select = document.getElementById("cup-add");
const $list = document.getElementById("cup-list");
const $result = document.getElementById("cup-result");
const $share = document.getElementById("cup-share");
const $shareStatus = document.getElementById("cup-share-status");
const $incoming = document.getElementById("cup-incoming");
const listeners = [];

// The list holds built-in product ids (strings) and products saved from a
// label ({ id, name, groups }). Saved only in this browser; if storage is
// blocked (private mode) it still works for this visit.
function revive(entry) {
  if (typeof entry === "string") return findProduct(entry);
  if (entry && typeof entry.name === "string" && Array.isArray(entry.groups)) {
    const groups = entry.groups.filter((g) => GROUPS[g]);
    if (!groups.length) return null;
    return { id: String(entry.id), name: entry.name.slice(0, 80), hint: entry.hint ?? "", groups, custom: true };
  }
  return null;
}
function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]").map(revive).filter(Boolean);
  } catch {
    return [];
  }
}
function save() {
  const data = items.map((p) => (p.custom ? { id: p.id, name: p.name, hint: p.hint, groups: p.groups } : p.id));
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* not saved, still usable */
  }
}

let items = load();
export const cupboardItems = () => [...items];
export const onCupboardChange = (fn) => listeners.push(fn);

export function addToCupboard(product) {
  if (items.some((p) => p.id === product.id)) return;
  items.push(product);
  save();
  draw();
}

$select.innerHTML =
  `<option value="">${t("cup.choose")}</option>` +
  PRODUCTS.map((p) => `<option value="${p.id}">${esc(pName(p))}</option>`).join("");

document.getElementById("cup-basics").innerHTML = basics().map((b) => `<li>${esc(b)}</li>`).join("");

function draw() {
  $list.innerHTML = items
    .map(
      (p, i) => `<li><span>${esc(pName(p))} <small class="meta">· ${esc(p.groups.map(gName).join(", "))}</small></span>
        <button class="link" data-remove="${i}" aria-label="${esc(t("cup.removeAria", { name: pName(p) }))}">${t("cup.remove")}</button></li>`,
    )
    .join("");
  $share.hidden = !items.some((p) => !p.custom);
  $shareStatus.textContent = "";
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
  const product = findProduct($select.value);
  if (!product) return $select.focus();
  $select.value = "";
  addToCupboard(product);
});

// Removing shows an Undo for a few seconds, in case of a mis-tap.
const $undo = document.getElementById("cup-undo");
let undoTimer = null;
$list.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-remove]");
  if (!btn) return;
  const index = Number(btn.dataset.remove);
  const [removed] = items.splice(index, 1);
  save();
  draw();
  clearTimeout(undoTimer);
  $undo.innerHTML = `<span>${esc(t("cup.removed", { name: pName(removed) }))}</span> <button class="link" id="cup-undo-btn">${t("cup.undo")}</button>`;
  $undo.hidden = false;
  document.getElementById("cup-undo-btn").addEventListener("click", () => {
    items.splice(Math.min(index, items.length), 0, removed);
    save();
    draw();
    $undo.hidden = true;
  });
  undoTimer = setTimeout(() => ($undo.hidden = true), 8000);
  $select.focus();
});

// Share the list (built-in product types only) with family or flatmates.
$share.addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}#cup=${encodeShare(items.map((p) => p.id))}`;
  const note = items.some((p) => p.custom) ? ` ${t("act.shareNote")}` : "";
  try {
    if (navigator.share) {
      await navigator.share({ title: "Don't Mix", text: t("cup.shareText"), url });
    } else {
      await navigator.clipboard.writeText(url);
      $shareStatus.textContent = t("act.copied") + note;
    }
  } catch (err) {
    if (err?.name !== "AbortError") $shareStatus.textContent = t("act.copyFail");
  }
});

// Someone opened a shared cupboard link: ask before replacing their list.
const incoming = decodeShare(location.hash, "cup");
if (incoming.length) {
  const names = incoming.map((id) => pName(findProduct(id))).join(", ");
  $incoming.innerHTML = `<article class="card info" role="status">
      <h3>📥 ${t("cup.in.h", { n: incoming.length })}</h3>
      <p>${esc(names)}</p>
      <div class="row">
        <button class="primary" data-incoming="replace">${t("cup.in.replace")}</button>
        ${items.length ? `<button class="ghost" data-incoming="merge">${t("cup.in.merge")}</button>` : ""}
        <button class="link" data-incoming="ignore">${t("cup.in.ignore")}</button>
      </div></article>`;
  $incoming.hidden = false;
  $incoming.addEventListener("click", (e) => {
    const b = e.target.closest("[data-incoming]");
    if (!b) return;
    const choice = b.dataset.incoming;
    if (choice === "replace") items = [];
    if (choice !== "ignore") for (const id of incoming) if (!items.some((p) => p.id === id)) items.push(findProduct(id));
    save();
    draw();
    $incoming.hidden = true;
    history.replaceState(null, "", location.pathname + location.search);
  });
  queueMicrotask(() => document.getElementById("tab-cupboard").click());
}

draw();
