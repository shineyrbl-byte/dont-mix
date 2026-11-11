import { GROUPS } from "./data.js";
import { parseLabel, groupName } from "./engine.js";
import { esc } from "./render.js";
import { addCustomProduct } from "./mix.js";
import { showTab } from "./tabs.js";

const $name = document.getElementById("label-name");
const $text = document.getElementById("label-text");
const $result = document.getElementById("label-result");

const EXAMPLE = {
  name: "Blue bathroom spray",
  text: "Ingredients: Hydrochloric acid 9.5%, non-ionic surfactants, perfume, colour.\nCAUTION: Do not mix with bleach or other cleaning products. Keep out of reach of children.",
};

let lastParse = null;
let counter = 0;

// Put the matched words in <mark> so people can see why we decided.
function highlight(text, matches) {
  let html = esc(text);
  for (const { word } of matches) {
    html = html.replace(new RegExp(`\\b(${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "gi"), "<mark>$1</mark>");
  }
  return html;
}

function read() {
  const text = $text.value.trim();
  if (!text) {
    $result.innerHTML = `<p class="hint">Paste some label text first.</p>`;
    $text.focus();
    return;
  }
  lastParse = parseLabel(text);
  const unknown = lastParse.groups[0] === "unknown";

  const found = unknown
    ? `<article class="card unknown"><h3>❔ No hazardous ingredient recognised</h3>
         <p>That doesn't mean it's safe. We only know common names. Treat it as unknown and don't mix it.</p></article>`
    : `<article class="card info"><h3>We found</h3>
         <ul>${lastParse.groups.map((g) => `<li><strong>${esc(groupName(g))}</strong>. ${esc(GROUPS[g].tip)}</li>`).join("")}</ul>
         <p class="meta">Matched: ${lastParse.matches.map((m) => `<mark>${esc(m.word)}</mark>`).join(", ")}</p></article>`;

  const skipped = lastParse.skippedWarnings.length
    ? `<p class="meta">Skipped as warnings, not ingredients: ${lastParse.skippedWarnings.map((s) => `“${esc(s)}”`).join(" ")}</p>`
    : "";

  $result.innerHTML = `${found}
    <article class="card"><p class="meta">What we read:</p><p>${highlight(text, lastParse.matches)}</p>${skipped}</article>
    <div class="row"><button class="primary" id="label-add">Check this against other products →</button></div>`;
  document.getElementById("label-add").addEventListener("click", addToMix);
}

function addToMix() {
  const name = $name.value.trim() || `Label product ${++counter}`;
  addCustomProduct({
    id: `custom-${Date.now()}`,
    name,
    hint: `From label: ${lastParse.groups.map(groupName).join(", ")}`,
    groups: lastParse.groups,
    custom: true,
  });
  showTab(document.getElementById("tab-mix"));
  document.getElementById("mix-search").focus();
}

document.getElementById("label-read").addEventListener("click", read);
document.getElementById("label-example").addEventListener("click", () => {
  $name.value = EXAMPLE.name;
  $text.value = EXAMPLE.text;
  read();
});
