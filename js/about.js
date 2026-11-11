// "How it decides" dialog: the full rule table, so anyone can check it.
import { RULES, LEVELS } from "./data.js";
import { esc } from "./render.js";
import { t, gName, levelTitle, ruleText } from "./i18n.js";

const $dialog = document.getElementById("about");
const $table = document.getElementById("about-rules");

function draw() {
  const rows = [...RULES]
    .sort((a, b) => LEVELS[b.level].rank - LEVELS[a.level].rank)
    .map((r) => {
      const pair = r.pair[0] === r.pair[1] ? `${gName(r.pair[0])} ×2` : `${gName(r.pair[0])} + ${gName(r.pair[1])}`;
      return `<tr>
        <td>${esc(pair)}</td>
        <td><span aria-hidden="true">${LEVELS[r.level].icon}</span> ${esc(levelTitle(r.level))}<br><small>${esc(ruleText(r, "gas"))}</small></td>
        <td>${t(`conf.${r.confidence}`)}</td>
        <td>${esc(r.source)}</td>
      </tr>`;
    })
    .join("");
  $table.innerHTML = `<thead><tr>
      <th scope="col">${t("about.col.pair")}</th><th scope="col">${t("about.col.result")}</th>
      <th scope="col">${t("about.col.sure")}</th><th scope="col">${t("about.col.source")}</th>
    </tr></thead><tbody>${rows}</tbody>`;
}

document.getElementById("about-open").addEventListener("click", () => {
  draw();
  $dialog.showModal();
});
