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
