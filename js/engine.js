// Pure logic: no DOM, so it runs in the browser and in Node tests.
import { GROUPS, LEVELS, RULES, STORAGE_RULES, PRODUCTS, KEYWORDS } from "./data.js";

const samePair = (pair, a, b) =>
  (pair[0] === a && pair[1] === b) || (pair[0] === b && pair[1] === a);

export function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

// What happens when group a meets group b.
export function checkGroups(a, b) {
  if (a === "unknown" || b === "unknown") {
    return {
      level: "unknown",
      gas: null,
      what: "We don't know what's in one of these. Read the label, or paste it into the label checker. Until then, don't mix them.",
      confidence: "none",
      source: null,
    };
  }
  const rule = RULES.find((r) => samePair(r.pair, a, b));
  if (rule) return { ...rule };
  return {
    level: "info",
    gas: null,
    what: "Nothing in our list says these two react dangerously. Mixing cleaners rarely cleans better, though, so use one, rinse, then the other.",
    confidence: "none",
    source: null,
  };
}

// Compare two items. An item is { name, groups: [...] }.
// Products can belong to several groups, so the worst pairing wins and every
// harmful reason is kept.
export function checkPair(itemA, itemB) {
  const findings = [];
  for (const a of itemA.groups) {
    for (const b of itemB.groups) {
      findings.push({ a, b, ...checkGroups(a, b) });
    }
  }
  findings.sort((x, y) => LEVELS[y.level].rank - LEVELS[x.level].rank);
  const level = findings[0]?.level ?? "info";
  const reasons = level === "info" ? findings.slice(0, 1) : findings.filter((f) => f.level !== "info");
  return { a: itemA, b: itemB, level, reasons: dedupe(reasons) };
}

// Check every pair in a list of items, worst first.
export function checkAll(items) {
  const results = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      results.push(checkPair(items[i], items[j]));
    }
  }
  return results.sort((x, y) => LEVELS[y.level].rank - LEVELS[x.level].rank);
}

export function worstLevel(results) {
  return results.reduce(
    (worst, r) => (LEVELS[r.level].rank > LEVELS[worst].rank ? r.level : worst),
    "info",
  );
}

// Storage advice for items kept in the same cupboard.
export function checkStorage(items) {
  const out = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      for (const rule of STORAGE_RULES) {
        const hit = items[i].groups.some((a) =>
          items[j].groups.some((b) => samePair(rule.pair, a, b)),
        );
        if (hit) out.push({ a: items[i], b: items[j], advice: rule.advice });
      }
    }
  }
  return out;
}

// Sentences like "Do not mix with bleach" name chemicals the product does
// NOT contain. Drop them before looking for ingredients.
const WARNING_SENTENCE =
  /\b(do not|don't|never|not to|avoid|keep away|keep out|store away|separately from|incompatible)\b/i;
const NEGATED_PHRASE =
  /\b(no|non|without|free of|zero)[\s-]+(chlorine|bleach|ammonia|alcohol|phosphates?|acid)\b|\b(chlorine|bleach|ammonia|alcohol|phosphate|acid)[\s-]+free\b/gi;

// Read pasted label text and return the hazard groups found, with the words
// that matched so the user can see why.
export function parseLabel(text) {
  const kept = String(text)
    .split(/[.;!\n•]+/)
    .filter((s) => !WARNING_SENTENCE.test(s))
    .join(" . ")
    .toLowerCase()
    .replace(NEGATED_PHRASE, " ");

  let rest = ` ${kept} `;
  const matches = [];
  for (const [word, group] of KEYWORDS) {
    const re = new RegExp(`\\b${escape(word)}\\b`, "g");
    if (re.test(rest)) {
      matches.push({ word, group });
      rest = rest.replace(re, " ".repeat(word.length));
    }
  }
  const groups = [...new Set(matches.map((m) => m.group))];
  return {
    groups: groups.length ? groups : ["unknown"],
    matches,
    skippedWarnings: String(text).split(/[.;!\n•]+/).filter((s) => WARNING_SENTENCE.test(s)).map((s) => s.trim()),
  };
}

export function groupName(id) {
  return GROUPS[id]?.name ?? id;
}

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function dedupe(list) {
  const seen = new Set();
  return list.filter((f) => {
    const key = [f.a, f.b].sort().join("|") + f.level;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
