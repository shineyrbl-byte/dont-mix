import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

test("offline: every app file is in the service worker cache list", () => {
  const sw = readFileSync(new URL("../sw.js", import.meta.url), "utf8");
  const js = readdirSync(new URL("../js/", import.meta.url)).filter((f) => f.endsWith(".js"));
  for (const f of js) assert.ok(sw.includes(`"js/${f}"`), `sw.js is missing js/${f}`);
  for (const f of ["index.html", "css/style.css", "icons/icon.svg", "manifest.webmanifest"]) assert.ok(sw.includes(`"${f}"`), f);
});
