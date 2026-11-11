// Text size, install button, offline status and update notice.
import { t } from "./i18n.js";

const SIZE_KEY = "dont-mix:size";
const SIZES = ["m", "l", "xl"];
const $sizes = document.getElementById("size-buttons");
const $install = document.getElementById("install-btn");
const $status = document.getElementById("app-status");

// Text size, remembered on this device.
function setSize(size, persist = true) {
  document.documentElement.dataset.size = size;
  for (const b of $sizes.querySelectorAll("button")) b.setAttribute("aria-pressed", String(b.dataset.size === size));
  if (persist) try { localStorage.setItem(SIZE_KEY, size); } catch { /* fine */ }
}
let saved = "m";
try { saved = localStorage.getItem(SIZE_KEY) || "m"; } catch { /* fine */ }
setSize(SIZES.includes(saved) ? saved : "m", false);
$sizes.addEventListener("click", (e) => {
  const b = e.target.closest("[data-size]");
  if (b) setSize(b.dataset.size);
});

// Theme: follow the system, or force light or dark.
const THEME_KEY = "dont-mix:theme";
const $themes = document.getElementById("theme-buttons");
function setTheme(choice, persist = true) {
  if (choice === "light" || choice === "dark") document.documentElement.dataset.theme = choice;
  else delete document.documentElement.dataset.theme;
  for (const b of $themes.querySelectorAll("button")) b.setAttribute("aria-pressed", String(b.dataset.themeChoice === choice));
  if (persist) try { localStorage.setItem(THEME_KEY, choice); } catch { /* fine */ }
}
let savedTheme = "system";
try { savedTheme = localStorage.getItem(THEME_KEY) || "system"; } catch { /* fine */ }
setTheme(["light", "dark"].includes(savedTheme) ? savedTheme : "system", false);
$themes.addEventListener("click", (e) => {
  const b = e.target.closest("[data-theme-choice]");
  if (b) setTheme(b.dataset.themeChoice);
});

// Delete everything this app stored on the device. Two taps, so it can't
// happen by accident.
const $delete = document.getElementById("delete-data");
let armed = false;
$delete.addEventListener("click", async () => {
  if (!armed) {
    armed = true;
    $delete.textContent = t("set.deleteConfirm");
    setTimeout(() => {
      armed = false;
      $delete.textContent = t("set.delete");
    }, 6000);
    return;
  }
  $delete.disabled = true;
  $delete.textContent = t("set.deleted");
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith("dont-mix:")) localStorage.removeItem(k);
  } catch { /* nothing stored */ }
  try {
    for (const k of await caches.keys()) await caches.delete(k);
    for (const r of (await navigator.serviceWorker?.getRegistrations()) ?? []) await r.unregister();
    // Tesseract keeps its language files in this IndexedDB store.
    indexedDB.deleteDatabase("keyval-store");
  } catch { /* fine */ }
  location.replace(location.pathname);
});

// Install button: only shown when the browser offers it.
let deferred = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferred = e;
  $install.hidden = false;
});
$install.addEventListener("click", async () => {
  if (!deferred) return;
  deferred.prompt();
  await deferred.userChoice.catch(() => {});
  deferred = null;
  $install.hidden = true;
});
window.addEventListener("appinstalled", () => ($install.hidden = true));

// Offline status.
function showStatus() {
  if (!navigator.onLine) {
    $status.textContent = t("set.offlineNow");
  } else if (navigator.serviceWorker?.controller) {
    $status.textContent = t("set.offline");
  }
}
window.addEventListener("online", showStatus);
window.addEventListener("offline", showStatus);

// Register the service worker and tell people when an update is waiting.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    .then((reg) => {
      navigator.serviceWorker.ready.then(showStatus);
      reg.addEventListener("updatefound", () => {
        const next = reg.installing;
        next?.addEventListener("statechange", () => {
          if (next.state === "installed" && navigator.serviceWorker.controller) showUpdate();
        });
      });
    })
    .catch(() => {});
  navigator.serviceWorker.addEventListener("controllerchange", showStatus);
}

function showUpdate() {
  const bar = document.getElementById("update-bar");
  bar.innerHTML = `<span>${t("set.update")}</span> <button class="primary" id="update-reload">${t("set.reload")}</button>`;
  bar.hidden = false;
  document.getElementById("update-reload").addEventListener("click", () => location.reload());
}

showStatus();
