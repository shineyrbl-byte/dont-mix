// Cache every app file so it works with no signal (e.g. a basement bathroom).
// Bump VERSION whenever files change, so people get the update.
const VERSION = "v4";
const CACHE = `dont-mix-${VERSION}`;
const FILES = [
  "./",
  "index.html",
  "css/style.css",
  "js/app.js",
  "js/i18n.js",
  "js/data.js",
  "js/data.hi.js",
  "js/engine.js",
  "js/render.js",
  "js/tabs.js",
  "js/mix.js",
  "js/label.js",
  "js/cupboard.js",
  "js/actions.js",
  "js/quiz.js",
  "js/print.js",
  "js/ocr.js",
  "js/settings.js",
  "icons/icon.svg",
  "manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Network first so updates arrive; cache when offline. The photo-scan
// engine (from the CDN) is cached after first use so scanning works offline.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || !e.request.url.startsWith("http")) return;
  // Same-origin files are revalidated with the server every time (a cheap 304
  // when unchanged), so an update never runs a stale copy from the HTTP cache.
  const sameOrigin = e.request.url.startsWith(self.location.origin);
  const req = sameOrigin && e.request.mode !== "navigate" ? fetch(e.request.url, { cache: "no-cache" }) : fetch(e.request);
  e.respondWith(
    req
      .then((res) => {
        if (res.ok || res.type === "opaque") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request, { ignoreSearch: true })
          .then((hit) => hit || (e.request.mode === "navigate" ? caches.match("index.html") : undefined)),
      ),
  );
});
