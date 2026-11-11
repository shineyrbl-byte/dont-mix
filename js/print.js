// Printable "Never mix" sticker for the cupboard door.
import { EMERGENCY } from "./data.js";
import { checkAll } from "./engine.js";
import { cupboardItems } from "./cupboard.js";
import { esc } from "./render.js";
import { t, pName, ruleText } from "./i18n.js";

const $sheet = document.getElementById("print-sheet");

function build() {
  const items = cupboardItems();
  const risky = items.length > 1 ? checkAll(items).filter((r) => r.level === "danger" || r.level === "warning") : [];
  const yours = risky.map((r) => {
    const reason = r.reasons.find((x) => x.pair);
    const gas = reason ? ` → ${ruleText(reason, "gas")}` : "";
    return `<li>${r.level === "danger" ? "⛔" : "⚠️"} ${esc(pName(r.a))} + ${esc(pName(r.b))}${esc(gas)}</li>`;
  });
  const numbers = EMERGENCY.filter((e) => e.id !== "us")
    .map((e) => `<strong>${e.display ?? e.number}</strong>`)
    .join(" · ");

  $sheet.innerHTML = `
    <div class="sticker">
      <h1>⛔ ${t("print.title")}</h1>
      <h2>${t("print.always")}</h2>
      <ul>${["p1", "p2", "p3", "p4", "p5"].map((k) => `<li>${t(`print.${k}`)}</li>`).join("")}</ul>
      ${yours.length ? `<h2>${t("print.yours")}</h2><ul>${yours.join("")}</ul>` : ""}
      <p class="rule">${t("print.rule")}</p>
      <p class="call">${t("print.mixed")} ${numbers}</p>
      <p class="url">Don't Mix · shineyrbl-byte.github.io/dont-mix</p>
    </div>`;
}

document.getElementById("print-btn").addEventListener("click", () => {
  build();
  window.print();
});
