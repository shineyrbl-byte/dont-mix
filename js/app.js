import { EMERGENCY } from "./data.js";
import "./tabs.js";
import "./mix.js";
import "./label.js";

// Emergency panel.
const sos = document.getElementById("sos");
document.getElementById("sos-numbers").innerHTML = EMERGENCY.map(
  (n) => `<a href="tel:${n.number}"><span>${n.label}</span><strong>📞 ${n.display ?? n.number}</strong></a>`,
).join("");
document.getElementById("sos-open").addEventListener("click", () => sos.showModal());
