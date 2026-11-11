import { LEVELS } from "./data.js";
import { t, gName, pName, levelTitle, ruleText } from "./i18n.js";

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Text for one finding, in the current language.
export function reasonText(r) {
  if (r.pair) {
    return { gas: ruleText(r, "gas"), what: ruleText(r, "what"), instead: ruleText(r, "instead"), eq: r.eq };
  }
  return { gas: null, what: t(r.level === "unknown" ? "reason.unknown" : "reason.none"), instead: null, eq: null };
}

// One card for one pair of products.
export function pairCard(result) {
  const reasons = result.reasons
    .map((r) => {
      const txt = reasonText(r);
      const groups = r.a === r.b ? gName(r.a) : `${gName(r.a)} + ${gName(r.b)}`;
      const meta = [
        txt.gas ? `<span class="pill">${esc(txt.gas)}</span>` : "",
        r.confidence === "high" || r.confidence === "medium" ? t(`conf.${r.confidence}`) : "",
        r.source ? t("meta.source", { s: esc(r.source) }) : "",
      ].filter(Boolean).join(" · ");
      return `<p><strong>${esc(groups)}:</strong> ${esc(txt.what)}</p>
        ${txt.instead && result.level !== "info" ? `<p class="instead"><strong>${t("reason.instead")}</strong> ${esc(txt.instead)}</p>` : ""}
        ${txt.instead && result.level === "info" ? `<p>${esc(txt.instead)}</p>` : ""}
        ${txt.eq ? `<p class="eq"><span class="sr-only">${t("reason.eq")}</span><code>${esc(txt.eq)}</code></p>` : ""}
        ${meta ? `<p class="meta">${meta}</p>` : ""}`;
    })
    .join("");
  return `<article class="card ${result.level}">
    <h3><span aria-hidden="true">${LEVELS[result.level].icon}</span> ${esc(levelTitle(result.level))}: ${esc(pName(result.a))} + ${esc(pName(result.b))}</h3>
    ${reasons}
  </article>`;
}

export function verdictCard(level, extra = "") {
  return `<article class="card ${level}" role="status">
    <p class="verdict"><span aria-hidden="true">${LEVELS[level].icon}</span> ${esc(levelTitle(level))}</p>
    <p>${t(`sum.${level}`)}</p>
    ${level === "danger" ? `<p><button class="link" data-open-sos>${t("sum.sosLink")}</button></p>` : ""}
    ${extra}
  </article>`;
}

// Any "see what to do" button inside a result opens the emergency dialog.
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-open-sos]")) document.getElementById("sos").showModal();
});
