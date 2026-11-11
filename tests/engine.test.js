import { test } from "node:test";
import assert from "node:assert/strict";
import { checkPair, checkAll, checkStorage, parseLabel, findProduct, worstLevel } from "../js/engine.js";
import { PRODUCTS, RULES, GROUPS } from "../js/data.js";

const p = (id) => findProduct(id);

test("bleach + ammonia glass cleaner is a danger (chloramine)", () => {
  const r = checkPair(p("bleach"), p("glass-ammonia"));
  assert.equal(r.level, "danger");
  assert.match(r.reasons[0].gas, /Chloramine/);
});

test("the two toilet cleaners are a danger (chlorine)", () => {
  const r = checkPair(p("toilet-bleach"), p("toilet-acid"));
  assert.equal(r.level, "danger");
  assert.match(r.reasons[0].gas, /Chlorine gas/);
});

test("order of products doesn't matter", () => {
  assert.equal(checkPair(p("vinegar"), p("bleach")).level, checkPair(p("bleach"), p("vinegar")).level);
});

test("bleach + sanitiser is a danger", () => {
  assert.equal(checkPair(p("bleach"), p("sanitiser")).level, "danger");
});

test("acid and caustic drain openers are a danger", () => {
  assert.equal(checkPair(p("drain-acid"), p("drain-caustic")).level, "danger");
});

test("baking soda + vinegar is harmless info", () => {
  const r = checkPair(p("baking-soda"), p("vinegar"));
  assert.equal(r.level, "info");
  assert.match(r.reasons[0].what, /cancel/);
});

test("an unknown product is never called safe", () => {
  assert.equal(checkPair(p("floor-unknown"), p("dish-soap")).level, "unknown");
});

test("pair with no rule falls back to info with caution text", () => {
  const r = checkPair(p("dish-soap"), p("baking-soda"));
  assert.equal(r.level, "info");
  assert.match(r.reasons[0].what, /rinse/);
});

test("worst pair wins for products in several groups", () => {
  const combo = { name: "Mystery", groups: ["mild", "ammonia"] };
  assert.equal(checkPair(combo, p("bleach")).level, "danger");
});

test("checkAll sorts worst first and worstLevel agrees", () => {
  const res = checkAll([p("dish-soap"), p("baking-soda"), p("bleach"), p("vinegar")]);
  assert.equal(res[0].level, "danger");
  assert.equal(worstLevel(res), "danger");
  assert.equal(res.length, 6);
});

test("storage: bleach next to acid toilet cleaner gives advice", () => {
  const s = checkStorage([p("bleach"), p("toilet-acid"), p("dish-soap")]);
  assert.equal(s.length, 1);
  assert.match(s[0].advice, /different shelves/);
});

test("label: hydrochloric acid is a strong acid", () => {
  assert.deepEqual(parseLabel("Contains: Hydrochloric Acid 10%, surfactants").groups, ["strongAcid"]);
});

test("label: 'do not mix with bleach' does not make it bleach", () => {
  const r = parseLabel("Contains ammonium hydroxide. Do not mix with bleach or acids.");
  assert.deepEqual(r.groups, ["ammonia"]);
  assert.equal(r.skippedWarnings.length, 1);
});

test("label: 'bleach-free' and 'no ammonia' are ignored", () => {
  assert.deepEqual(parseLabel("Bleach-free formula, no ammonia, contains citric acid").groups, ["weakAcid"]);
});

test("label: oxygen bleach is peroxide, not chlorine", () => {
  assert.deepEqual(parseLabel("Oxygen bleach (sodium percarbonate)").groups, ["peroxide"]);
});

test("label: words inside other words don't match", () => {
  // polyethylene contains 'lye', phenoxyethanol contains 'ethanol'
  assert.deepEqual(parseLabel("Bottle: polyethylene. Preservative: phenoxyethanol").groups, ["unknown"]);
});

test("label: nothing recognised means unknown", () => {
  assert.deepEqual(parseLabel("Fresh lavender scent").groups, ["unknown"]);
});

test("data: every product and rule uses real groups", () => {
  for (const prod of PRODUCTS) for (const g of prod.groups) assert.ok(GROUPS[g], `${prod.id} -> ${g}`);
  for (const r of RULES) for (const g of r.pair) assert.ok(GROUPS[g], `rule -> ${g}`);
});
