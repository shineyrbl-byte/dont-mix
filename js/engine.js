// Pure logic: no DOM, so it runs in the browser and in Node tests.
import { GROUPS, LEVELS, RULES, STORAGE_RULES, PRODUCTS, KEYWORDS, ruleKey } from "./data.js";

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
        if (hit) out.push({ a: items[i], b: items[j], key: ruleKey(rule.pair), advice: rule.advice });
      }
    }
  }
  return out;
}

// Phrases like "Do not mix with bleach" name chemicals the product does NOT
// contain. We drop the text from the warning to the end of its sentence, but
// keep what comes before it, so "Contains bleach, do not mix with acids"
// still finds the bleach. Missing a hazard is worse than a false alarm.
const WARNING =
  /\b(do not|don't|never|not to|avoid|keep away|keep out|store away|separately from|incompatible)\b|न मिलाएं|न मिलाएँ|मत मिलाएं|मत मिलाएँ|ना मिलाएं|दूर रखें/i;
const NEGATED_PHRASE =
  /\b(no|non|without|free of|zero)[\s-]+(chlorine|bleach|ammonia|alcohol|phosphates?|acid)\b|\b(chlorine|bleach|ammonia|alcohol|phosphate|acid)[\s-]+free\b/gi;

// Labels (and photo scans) wrap lines mid-sentence. Join a line to the
// previous one when it starts with a lowercase letter.
const unwrap = (text) => String(text).replace(/[ \t]*\n[ \t]*(?=[a-z])/g, " ");
const sentences = (text) => unwrap(text).split(/[.;!\n•।]+/);

function splitWarning(sentence) {
  const m = WARNING.exec(sentence);
  if (!m) return [sentence, ""];
  // Hindi puts the verb last ("ब्लीच के साथ न मिलाएं"), so the warning starts
  // at the beginning of its clause, after the previous comma.
  const cut = /^[\x00-\x7F]+$/.test(m[0]) ? m.index : Math.max(sentence.lastIndexOf(",", m.index), 0);
  return [sentence.slice(0, cut), sentence.slice(cut).replace(/^,\s*/, "")];
}

// Read pasted label text and return the hazard groups found, with the words
// that matched so the user can see why.
export function parseLabel(text) {
  const parts = sentences(text).map(splitWarning);
  const kept = parts
    .map(([keep]) => keep)
    .join(" . ")
    .toLowerCase()
    .replace(NEGATED_PHRASE, " ");

  let rest = ` ${kept} `;
  const matches = [];
  for (const [word, group] of KEYWORDS) {
    // Unicode-aware whole-word match, so Hindi words work too.
    const re = new RegExp(`(?<![\\p{L}\\p{N}\\p{M}])${escape(word)}(?![\\p{L}\\p{N}\\p{M}])`, "gu");
    if (re.test(rest)) {
      matches.push({ word, group });
      rest = rest.replace(re, " ".repeat(word.length));
    }
  }
  const groups = [...new Set(matches.map((m) => m.group))];
  return {
    groups: groups.length ? groups : ["unknown"],
    matches,
    skippedWarnings: parts.map(([, warn]) => warn.trim()).filter(Boolean),
  };
}

export function groupName(id) {
  return GROUPS[id]?.name ?? id;
}

// Encode picked product ids for a share link. Custom label products are
// left out because they may contain text the person typed.
export function encodeShare(ids) {
  return ids.filter((id) => PRODUCTS.some((p) => p.id === id)).join(",");
}
export function decodeShare(hash, key = "mix") {
  const m = new RegExp(`(?:^|[#&])${key}=([^&]*)`).exec(hash || "");
  if (!m) return [];
  return [...new Set(decodeURIComponent(m[1]).split(","))].filter((id) => PRODUCTS.some((p) => p.id === id));
}

// Quiz questions built from the same rules the checker uses, so the quiz can
// never disagree with the app. `rand` is injectable for tests.
export function makeQuiz(count = 8, rand = Math.random) {
  const known = PRODUCTS.filter((p) => !p.groups.includes("unknown"));
  const pool = [];
  for (let i = 0; i < known.length; i++) {
    for (let j = i + 1; j < known.length; j++) {
      const r = checkPair(known[i], known[j]);
      pool.push({ a: known[i], b: known[j], level: r.level, result: r });
    }
  }
  const take = (list, n) => {
    const copy = [...list];
    const out = [];
    while (copy.length && out.length < n) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
    return out;
  };
  // Mostly risky pairs (that's what we want people to learn), some safe ones.
  const risky = pool.filter((q) => q.level !== "info");
  const safe = pool.filter((q) => q.level === "info");
  const nRisky = Math.ceil(count * 0.6);
  return take([...take(risky, nRisky), ...take(safe, count - nRisky)], count);
}

// Quiz answers are simpler than levels: "no" (danger or warning) or "ok".
export const quizAnswer = (level) => (level === "info" ? "ok" : "no");

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
