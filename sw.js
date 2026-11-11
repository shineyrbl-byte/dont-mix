// Cache every file so the app works with no signal (e.g. a basement bathroom).
const CACHE = "dont-mix-v1";
const FILES = [
  "./",
  "index.html",
  "css/style.css",
  "js/app.js",
  "js/tabs.js",
  "js/data.js",
  "js/engine.js",
  "js/render.js",
  "js/mix.js",
  "js/label.js",
  "js/cupboard.js",
  "icons/icon.svg",
  "manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Network first so updates arrive, cache when offline.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});
