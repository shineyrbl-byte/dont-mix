import { test } from "node:test";
import assert from "node:assert/strict";
import { HI } from "../js/data.hi.js";
import { GROUPS, LEVELS, RULES, STORAGE_RULES, STORAGE_BASICS, PRODUCTS, EMERGENCY, ruleKey } from "../js/data.js";
import { readFileSync } from "node:fs";

test("Hindi: every group, level, product and emergency label is translated", () => {
  for (const id of Object.keys(GROUPS)) assert.ok(HI.groups[id]?.name && HI.groups[id]?.tip, id);
  for (const id of Object.keys(LEVELS)) assert.ok(HI.levels[id]?.title, id);
  for (const p of PRODUCTS) assert.ok(HI.products[p.id]?.name && HI.products[p.id]?.hint, p.id);
  for (const e of EMERGENCY) assert.ok(HI.emergency[e.id]?.label, e.id);
});

test("Hindi: every rule and storage tip is translated, with no stray keys", () => {
  const ruleKeys = RULES.map((r) => ruleKey(r.pair));
  for (const k of ruleKeys) for (const f of ["gas", "what", "instead"]) assert.ok(HI.rules[k]?.[f], `${k}.${f}`);
  assert.deepEqual(Object.keys(HI.rules).sort(), [...ruleKeys].sort());
  const storageKeys = STORAGE_RULES.map((r) => ruleKey(r.pair));
  assert.deepEqual(Object.keys(HI.storage).sort(), [...storageKeys].sort());
  assert.equal(HI.basics.length, STORAGE_BASICS.length);
});

test("Hindi: every UI string has both languages and every key used in HTML exists", () => {
  const src = readFileSync(new URL("../js/i18n.js", import.meta.url), "utf8");
  const block = src.slice(src.indexOf("const S = {"), src.indexOf("// @end"));
  const keys = [...block.matchAll(/^\s+"?([\w.]+)"?: \[/gm)].map((m) => m[1]);
  assert.ok(keys.length > 50);
  for (const m of block.matchAll(/^\s+"?([\w.]+)"?: \[(".*?"|'.*?'), (".*?"|'.*?')\],$/gm)) {
    assert.ok(m[2].length > 2 && m[3].length > 2, m[1]);
  }
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  for (const m of html.matchAll(/data-i18n(?:-html|-ph|-aria)?="([\w.]+)"/g)) assert.ok(keys.includes(m[1]), `missing key ${m[1]}`);
});
