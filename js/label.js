import { parseLabel } from "./engine.js";
import { esc } from "./render.js";
import { addCustomProduct } from "./mix.js";
import { showTab } from "./tabs.js";
import { t, lang, gName, gTip } from "./i18n.js";

const $name = document.getElementById("label-name");
const $text = document.getElementById("label-text");
const $result = document.getElementById("label-result");

const EXAMPLE = {
  en: {
    name: "Blue bathroom spray",
    text: "Ingredients: Hydrochloric acid 9.5%, non-ionic surfactants, perfume, colour.\nCAUTION: Do not mix with bleach or other cleaning products. Keep out of reach of children.",
  },
  hi: {
    name: "नीला बाथरूम स्प्रे",
    text: "सामग्री: हाइड्रोक्लोरिक एसिड 9.5%, सर्फ़ेक्टेंट, खुशबू।\nसावधानी: ब्लीच या दूसरे क्लीनर के साथ न मिलाएं। बच्चों की पहुँच से दूर रखें।",
  },
};

let lastParse = null;
let counter = 0;

// Put the matched words in <mark> so people can see why we decided.
function highlight(text, matches) {
  let html = esc(text);
  for (const { word } of matches) {
    const safe = esc(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(new RegExp(`(?<![\\p{L}\\p{N}\\p{M}])(${safe})(?![\\p{L}\\p{N}\\p{M}])`, "giu"), "<mark>$1</mark>");
  }
  return html;
}

export function read() {
  const text = $text.value.trim();
  if (!text) {
    $result.innerHTML = `<p class="hint">${t("label.empty")}</p>`;
    $text.focus();
    return;
  }
  lastParse = parseLabel(text);
  const unknown = lastParse.groups[0] === "unknown";

  const found = unknown
    ? `<article class="card unknown"><h3>❔ ${t("label.unknown.h")}</h3><p>${t("label.unknown.p")}</p></article>`
    : `<article class="card info"><h3>${t("label.found")}</h3>
         <ul>${lastParse.groups.map((g) => `<li><strong>${esc(gName(g))}</strong>. ${esc(gTip(g))}</li>`).join("")}</ul>
         <p class="meta">${t("label.matched")} ${lastParse.matches.map((m) => `<mark>${esc(m.word)}</mark>`).join(", ")}</p></article>`;

  const skipped = lastParse.skippedWarnings.length
    ? `<p class="meta">${t("label.skipped")} ${lastParse.skippedWarnings.map((s) => `“${esc(s)}”`).join(" ")}</p>`
    : "";

  $result.innerHTML = `${found}
    <article class="card"><p class="meta">${t("label.whatWeRead")}</p><p>${highlight(text, lastParse.matches)}</p>${skipped}</article>
    <div class="row"><button class="primary" id="label-add">${t("label.add")}</button></div>`;
  document.getElementById("label-add").addEventListener("click", addToMix);
}

function addToMix() {
  const name = $name.value.trim() || t("label.defaultName", { n: ++counter });
  addCustomProduct({
    id: `custom-${Date.now()}`,
    name,
    hint: t("label.fromLabel", { groups: lastParse.groups.map(gName).join(", ") }),
    groups: lastParse.groups,
    custom: true,
  });
  showTab(document.getElementById("tab-mix"));
  document.getElementById("mix-search").focus();
}

document.getElementById("label-read").addEventListener("click", read);
document.getElementById("label-example").addEventListener("click", () => {
  $name.value = EXAMPLE[lang].name;
  $text.value = EXAMPLE[lang].text;
  read();
});
