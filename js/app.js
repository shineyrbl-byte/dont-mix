import { EMERGENCY } from "./data.js";

// Tabs: arrow keys move between them, as screen-reader users expect.
const tabs = [...document.querySelectorAll('[role="tab"]')];

export function showTab(tab) {
  for (const t of tabs) {
    const on = t === tab;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  }
}

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => showTab(tab));
  tab.addEventListener("keydown", (e) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const next = tabs[(i + step + tabs.length) % tabs.length];
    showTab(next);
    next.focus();
  });
});

// Emergency panel.
const sos = document.getElementById("sos");
document.getElementById("sos-numbers").innerHTML = EMERGENCY.map(
  (n) => `<a href="tel:${n.number}"><span>${n.label}</span><strong>📞 ${n.display ?? n.number}</strong></a>`,
).join("");
document.getElementById("sos-open").addEventListener("click", () => sos.showModal());

import "./mix.js";
