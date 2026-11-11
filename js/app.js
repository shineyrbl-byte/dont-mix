import { EMERGENCY } from "./data.js";
import { applyStatic, lang, setLang, emergencyLabel, t, pName, ruleText } from "./i18n.js";
import { checkAll } from "./engine.js";
import { esc } from "./render.js";
import { pickedItems } from "./mix.js";
import "./tabs.js";
import "./mix.js";
import "./label.js";
import "./cupboard.js";
import "./actions.js";
import "./quiz.js";
import "./print.js";
import "./ocr.js";
import "./settings.js";
import "./about.js";

// Translate the fixed text on the page.
applyStatic();

// Language switch. Reloading keeps the code simple.
for (const btn of document.querySelectorAll("[data-lang]")) {
  btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
  btn.addEventListener("click", () => {
    if (btn.dataset.lang === lang) return;
    setLang(btn.dataset.lang);
    location.reload();
  });
}

// Emergency panel.
const sos = document.getElementById("sos");
document.getElementById("sos-numbers").innerHTML = EMERGENCY.map(
  (n) => `<a href="tel:${n.number}"><span>${emergencyLabel(n)}</span><strong>📞 ${n.display ?? n.number}</strong></a>`,
).join("");

// If products are picked in the checker, prepare a line to read out to the
// poison centre: what was mixed and what it may give off.
function prepareTell() {
  const $tell = document.getElementById("sos-tell");
  const items = pickedItems();
  if (items.length < 2) {
    $tell.hidden = true;
    return;
  }
  const names = items.map(pName).join(t("sos.and"));
  const gases = [...new Set(
    checkAll(items)
      .filter((r) => r.level === "danger" || r.level === "warning")
      .flatMap((r) => r.reasons.filter((x) => x.pair).map((x) => ruleText(x, "gas")))
      .map((g) => (lang === "en" ? g.charAt(0).toLowerCase() + g.slice(1) : g)),
  )];
  const text = gases.length
    ? t("sos.tell", { items: names, gases: gases.join(t("sos.and")) })
    : t("sos.tell.unknown", { items: names });
  $tell.innerHTML = `<h3>${t("sos.tell.h")}</h3><p>${esc(text)}</p>`;
  $tell.hidden = false;
}

function openSos() {
  prepareTell();
  sos.showModal();
}
document.getElementById("sos-open").addEventListener("click", openSos);
document.addEventListener("open-sos", openSos);
