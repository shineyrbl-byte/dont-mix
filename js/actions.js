// Share and read-aloud buttons on the mix verdict.
import { checkAll, worstLevel, encodeShare, decodeShare } from "./engine.js";
import { pickedItems, onChange, setPicked } from "./mix.js";
import { reasonText } from "./render.js";
import { t, lang, pName, levelTitle } from "./i18n.js";

// Keep picks in the URL so a link (or a language switch) restores them.
function syncHash(items) {
  const enc = encodeShare(items.map((p) => p.id));
  const url = enc ? `#mix=${enc}` : location.pathname + location.search;
  history.replaceState(null, "", url);
}

const fromLink = decodeShare(location.hash);
if (fromLink.length) setPicked(fromLink);

function summary(items) {
  const results = checkAll(items);
  const level = worstLevel(results);
  return { results, level, verdict: levelTitle(level) };
}

async function share(items, btn) {
  const { verdict } = summary(items);
  const text = t("act.shareText", { verdict, items: items.map(pName).join(" + ") });
  const url = location.href;
  const status = btn.parentElement.querySelector(".act-status");
  try {
    if (navigator.share) {
      await navigator.share({ title: "Don't Mix", text, url });
      return;
    }
    await navigator.clipboard.writeText(`${text}\n${url}`);
    status.textContent = t("act.copied");
  } catch (err) {
    if (err?.name !== "AbortError") status.textContent = t("act.copyFail");
  }
}

// Read the verdict and reasons aloud. Useful when your hands are busy.
const synth = globalThis.speechSynthesis;
function speak(items, btn) {
  if (synth.speaking) {
    synth.cancel();
    return;
  }
  const { results, verdict, level } = summary(items);
  const lines = [verdict, t(`sum.${level}`)];
  for (const r of results.filter((x) => x.level !== "info")) {
    lines.push(`${pName(r.a)} + ${pName(r.b)}.`);
    for (const reason of r.reasons) {
      const txt = reasonText(reason);
      lines.push(txt.what);
      if (txt.instead) lines.push(`${t("reason.instead")} ${txt.instead}`);
    }
  }
  const u = new SpeechSynthesisUtterance(lines.join(" "));
  u.lang = lang === "hi" ? "hi-IN" : "en-IN";
  const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang));
  if (voice) u.voice = voice;
  u.rate = 0.95;
  btn.textContent = `⏹ ${t("act.stop")}`;
  u.onend = u.onerror = () => (btn.textContent = `🔊 ${t("act.speak")}`);
  synth.speak(u);
}

function drawActions(items) {
  syncHash(items);
  const box = document.getElementById("mix-actions");
  if (!box) return;
  const hasCustom = items.some((p) => p.custom);
  box.innerHTML = `
    <button class="ghost" data-act="share">🔗 ${t("act.share")}</button>
    ${synth ? `<button class="ghost" data-act="speak">🔊 ${t("act.speak")}</button>` : ""}
    <span class="act-status meta" role="status">${hasCustom ? t("act.shareNote") : ""}</span>`;
  box.onclick = (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    if (btn.dataset.act === "share") share(pickedItems(), btn);
    if (btn.dataset.act === "speak") speak(pickedItems(), btn);
  };
}

onChange((items) => {
  synth?.cancel();
  drawActions(items);
});
drawActions(pickedItems());
