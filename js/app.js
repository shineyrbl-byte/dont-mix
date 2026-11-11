import { EMERGENCY } from "./data.js";
import { applyStatic, lang, setLang, emergencyLabel } from "./i18n.js";
import "./tabs.js";
import "./mix.js";
import "./label.js";
import "./cupboard.js";

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
document.getElementById("sos-open").addEventListener("click", () => sos.showModal());

// Offline support. Fails quietly where service workers aren't allowed.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
