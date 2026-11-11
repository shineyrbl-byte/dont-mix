import { LEVELS } from "./data.js";
import { groupName } from "./engine.js";

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const CONFIDENCE = {
  high: "Well documented",
  medium: "Expected from the chemistry; less data at household amounts",
  none: "",
};

// One card for one pair of products.
export function pairCard(result) {
  const lvl = LEVELS[result.level];
  const reasons = result.reasons
    .map((r) => {
      const groups = r.a === r.b ? groupName(r.a) : `${groupName(r.a)} + ${groupName(r.b)}`;
      const meta = [
        r.gas ? `<span class="pill">${esc(r.gas)}</span>` : "",
        CONFIDENCE[r.confidence] ? `${CONFIDENCE[r.confidence]}` : "",
        r.source ? `Source: ${esc(r.source)}` : "",
      ].filter(Boolean).join(" · ");
      return `<p><strong>${esc(groups)}:</strong> ${esc(r.what)}</p>${meta ? `<p class="meta">${meta}</p>` : ""}`;
    })
    .join("");
  return `<article class="card ${result.level}">
    <h3><span aria-hidden="true">${lvl.icon}</span> ${lvl.title}: ${esc(result.a.name)} + ${esc(result.b.name)}</h3>
    ${reasons}
  </article>`;
}

const SUMMARY = {
  danger: "Don't use these together. Use one, rinse the surface with water, air the room, then use the other another time.",
  warning: "Better not to mix. Use them one at a time and rinse in between.",
  unknown: "We can't say these are safe. Check the label first.",
  info: "No dangerous reaction in our list. Still, use one at a time. Mixing rarely cleans better.",
};

export function verdictCard(level) {
  const lvl = LEVELS[level];
  return `<article class="card ${level}" role="status">
    <p class="verdict"><span aria-hidden="true">${lvl.icon}</span> ${lvl.title}</p>
    <p>${SUMMARY[level]}</p>
    ${level === "danger" ? `<p><button class="link" data-open-sos>Already mixed them? See what to do now →</button></p>` : ""}
  </article>`;
}

// Any "see what to do" button inside a result opens the emergency dialog.
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-open-sos]")) document.getElementById("sos").showModal();
});
