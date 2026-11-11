// Safety data for Don't Mix.
// Every product belongs to one or more hazard groups. Rules describe what
// happens when two groups meet. Keep wording plain: the reader may be scared.

export const GROUPS = {
  hypochlorite: {
    name: "Chlorine bleach",
    label: "sodium hypochlorite, bleach, chlorine",
    tip: "Use alone, with water only. Rinse surfaces before using another cleaner.",
  },
  ammonia: {
    name: "Ammonia",
    label: "ammonia, ammonium hydroxide",
    tip: "Use in a ventilated room. Never on a surface that still has bleach on it.",
  },
  strongAcid: {
    name: "Strong acid",
    label: "hydrochloric / muriatic, sulfuric, phosphoric acid, sodium bisulfate",
    tip: "Wear gloves. Flush with plenty of water. Store low, away from bleach.",
  },
  weakAcid: {
    name: "Mild acid",
    label: "vinegar, acetic, citric, lactic acid, lemon",
    tip: "Safe on its own, but it still releases chlorine gas when it meets bleach.",
  },
  strongBase: {
    name: "Caustic (strong alkali)",
    label: "sodium / potassium hydroxide, caustic soda, lye",
    tip: "Burns skin and eyes. Wear gloves and eye protection. Never add to hot water in a closed drain.",
  },
  peroxide: {
    name: "Hydrogen peroxide",
    label: "hydrogen peroxide",
    tip: "Keep in its dark bottle, away from heat. Don't pour into other bottles.",
  },
  alcohol: {
    name: "Alcohol",
    label: "isopropyl alcohol, ethanol, ethyl alcohol, sanitiser",
    tip: "Flammable. Keep away from flames, stoves and heaters.",
  },
  phenolic: {
    name: "Phenolic disinfectant",
    label: "phenol, cresol, chloroxylenol (PCMX), black phenyl",
    tip: "Dilute as the label says. Don't combine with bleach.",
  },
  flammable: {
    name: "Flammable fuel or solvent",
    label: "kerosene, petrol, thinner, turpentine, acetone",
    tip: "Store in its original sealed can, away from heat, sunlight and oxidisers.",
  },
  carbonate: {
    name: "Baking soda / washing soda",
    label: "sodium bicarbonate, sodium carbonate",
    tip: "Low hazard. Fine on its own.",
  },
  mild: {
    name: "Mild detergent",
    label: "surfactants, soap",
    tip: "Low hazard. Rinse before switching to bleach or acid cleaners.",
  },
  unknown: {
    name: "Unknown ingredients",
    label: "label not checked",
    tip: "Read the label or paste it into the label checker before mixing with anything.",
  },
};

// Severity levels, most serious first.
export const LEVELS = {
  danger: { rank: 3, title: "Do not mix", icon: "⛔" },
  warning: { rank: 2, title: "Avoid mixing", icon: "⚠️" },
  unknown: { rank: 1, title: "Not sure", icon: "❔" },
  info: { rank: 0, title: "No known dangerous reaction", icon: "✅" },
};

// `confidence` says how well established the reaction is.
//   "high"   - documented by poison centres / public health agencies
//   "medium" - chemically expected, less data on household amounts
export const RULES = [
  {
    pair: ["hypochlorite", "ammonia"],
    level: "danger",
    gas: "Chloramine gas",
    what: "Bleach and ammonia react to make chloramine vapour. It causes coughing, chest pain, shortness of breath and fluid in the lungs, even in a small bathroom.",
    confidence: "high",
    source: "US CDC / Washington State Dept. of Health",
  },
  {
    pair: ["hypochlorite", "strongAcid"],
    level: "danger",
    gas: "Chlorine gas",
    what: "Acid makes bleach release chlorine gas quickly. This is the classic 'two toilet cleaners' accident. Chlorine burns the eyes, throat and lungs.",
    confidence: "high",
    source: "US CDC / NPIC AIIMS case reports",
  },
  {
    pair: ["hypochlorite", "weakAcid"],
    level: "danger",
    gas: "Chlorine gas",
    what: "Even vinegar or lemon makes bleach release chlorine gas. Less violent than a strong acid, but still harmful in a closed room.",
    confidence: "high",
    source: "Washington State Dept. of Health",
  },
  {
    pair: ["hypochlorite", "alcohol"],
    level: "danger",
    gas: "Chloroform and other chlorinated vapours",
    what: "Bleach and alcohol (including sanitiser) form chloroform and related toxic vapours that can cause dizziness and harm the liver and lungs.",
    confidence: "high",
    source: "Washington State Dept. of Health",
  },
  {
    pair: ["strongAcid", "strongBase"],
    level: "danger",
    gas: "Heat and boiling splashes",
    what: "Acid and caustic drain or toilet cleaners react violently. The mix can boil and spit corrosive liquid out of a drain or bowl into your face.",
    confidence: "high",
    source: "Product safety data sheets (drain cleaners)",
  },
  {
    pair: ["strongBase", "strongBase"],
    level: "warning",
    gas: "Heat and splashing",
    what: "Different drain openers use different chemicals. Pouring a second one on top of the first can heat up and splash back.",
    confidence: "medium",
    source: "Drain cleaner label warnings",
  },
  {
    pair: ["hypochlorite", "peroxide"],
    level: "warning",
    gas: "Rapid oxygen release",
    what: "The mix fizzes hard and can spray bleach out of the container. It also destroys both cleaners, so it doesn't clean better.",
    confidence: "medium",
    source: "General chemistry; label warnings",
  },
  {
    pair: ["peroxide", "weakAcid"],
    level: "warning",
    gas: "Peracetic acid",
    what: "Hydrogen peroxide and vinegar form peracetic acid, which irritates eyes, skin and lungs. Use them one after another, not in the same bottle.",
    confidence: "medium",
    source: "Consumer Reports / general chemistry",
  },
  {
    pair: ["hypochlorite", "phenolic"],
    level: "warning",
    gas: "Irritating chlorinated compounds",
    what: "Bleach can react with phenolic disinfectants to form chlorophenols, which smell strong and irritate. Household-scale data is limited, so treat it as unsafe.",
    confidence: "medium",
    source: "General chemistry",
  },
  {
    pair: ["strongAcid", "ammonia"],
    level: "warning",
    gas: "Heat and irritating fumes",
    what: "They neutralise each other and give off heat and sharp fumes. Not as dangerous as bleach mixes, but there is no reason to do it.",
    confidence: "medium",
    source: "General chemistry",
  },
  {
    pair: ["weakAcid", "strongBase"],
    level: "warning",
    gas: "Heat",
    what: "Vinegar poured on caustic drain cleaner heats up and can splash caustic liquid.",
    confidence: "medium",
    source: "General chemistry",
  },
  {
    pair: ["carbonate", "weakAcid"],
    level: "info",
    gas: "Carbon dioxide (harmless)",
    what: "Safe, but they cancel each other out. The fizz looks impressive and leaves mostly salty water. Use them separately for better cleaning.",
    confidence: "high",
    source: "General chemistry",
  },
];

// Rules for keeping products in the same cupboard.
export const STORAGE_RULES = [
  {
    pair: ["hypochlorite", "strongAcid"],
    advice: "Keep bleach and acid cleaners on different shelves. A leak or a dripping cap can make chlorine gas inside the cupboard.",
  },
  {
    pair: ["hypochlorite", "ammonia"],
    advice: "Store bleach away from ammonia cleaners so drips can't meet.",
  },
  {
    pair: ["strongAcid", "strongBase"],
    advice: "Separate acid and caustic cleaners. If both leak they react with heat.",
  },
  {
    pair: ["flammable", "peroxide"],
    advice: "Keep fuels and solvents away from oxidisers like hydrogen peroxide.",
  },
  {
    pair: ["flammable", "hypochlorite"],
    advice: "Keep fuels and solvents away from bleach and other oxidisers.",
  },
  {
    pair: ["alcohol", "hypochlorite"],
    advice: "Don't keep sanitiser and bleach in the same caddy. A spill can mix them.",
  },
];

// Common household product types. Brands vary, so each says what to look
// for on the label. `groups` can hold more than one group.
export const PRODUCTS = [
  { id: "bleach", name: "Liquid bleach", hint: "Says 'sodium hypochlorite'", groups: ["hypochlorite"] },
  { id: "toilet-bleach", name: "Toilet cleaner (bleach type)", hint: "Thick gel, says 'hypochlorite'", groups: ["hypochlorite"] },
  { id: "toilet-acid", name: "Toilet cleaner (acid type)", hint: "Says 'hydrochloric acid' or 'HCl'", groups: ["strongAcid"] },
  { id: "mould-spray", name: "Mould / mildew remover spray", hint: "Usually bleach based", groups: ["hypochlorite"] },
  { id: "glass-ammonia", name: "Glass cleaner with ammonia", hint: "Says 'ammonia' or 'ammonium hydroxide'", groups: ["ammonia"] },
  { id: "vinegar", name: "White vinegar", hint: "Acetic acid", groups: ["weakAcid"] },
  { id: "descaler", name: "Lemon / citric descaler", hint: "Kettle or tap descaler", groups: ["weakAcid"] },
  { id: "tile-acid", name: "Tile, grout or rust remover", hint: "Says 'acid'", groups: ["strongAcid"] },
  { id: "drain-caustic", name: "Drain opener (caustic)", hint: "Says 'sodium hydroxide' or 'caustic'", groups: ["strongBase"] },
  { id: "drain-acid", name: "Drain opener (acid)", hint: "Says 'sulfuric acid'", groups: ["strongAcid"] },
  { id: "oven", name: "Oven / grill cleaner", hint: "Usually caustic", groups: ["strongBase"] },
  { id: "peroxide", name: "Hydrogen peroxide 3%", hint: "Brown bottle", groups: ["peroxide"] },
  { id: "sanitiser", name: "Hand sanitiser / rubbing alcohol", hint: "Isopropyl or ethanol", groups: ["alcohol"] },
  { id: "phenyl", name: "Phenyl / phenolic floor disinfectant", hint: "Black or white phenyl", groups: ["phenolic"] },
  { id: "antiseptic", name: "Antiseptic liquid", hint: "Says 'chloroxylenol'", groups: ["phenolic"] },
  { id: "baking-soda", name: "Baking soda", hint: "Sodium bicarbonate", groups: ["carbonate"] },
  { id: "dish-soap", name: "Dish soap / detergent", hint: "Plain soap", groups: ["mild"] },
  { id: "fuel", name: "Kerosene, petrol or paint thinner", hint: "Fuel or solvent", groups: ["flammable"] },
  { id: "floor-unknown", name: "Floor or surface cleaner (not sure)", hint: "Haven't read the label", groups: ["unknown"] },
];

// Words to look for when someone pastes a label. Longer phrases first so
// "hydrochloric acid" wins over plain "acid".
export const KEYWORDS = [
  ["oxygen bleach", "peroxide"],
  ["sodium percarbonate", "peroxide"],
  ["sodium hypochlorite", "hypochlorite"],
  ["calcium hypochlorite", "hypochlorite"],
  ["hypochlorite", "hypochlorite"],
  ["bleach", "hypochlorite"],
  ["available chlorine", "hypochlorite"],
  ["ammonium hydroxide", "ammonia"],
  ["ammonia", "ammonia"],
  ["hydrochloric", "strongAcid"],
  ["muriatic", "strongAcid"],
  ["sulfuric", "strongAcid"],
  ["sulphuric", "strongAcid"],
  ["phosphoric", "strongAcid"],
  ["sodium bisulfate", "strongAcid"],
  ["sodium bisulphate", "strongAcid"],
  ["oxalic", "strongAcid"],
  ["sulfamic", "strongAcid"],
  ["hcl", "strongAcid"],
  ["acetic", "weakAcid"],
  ["vinegar", "weakAcid"],
  ["citric", "weakAcid"],
  ["lactic", "weakAcid"],
  ["sodium hydroxide", "strongBase"],
  ["potassium hydroxide", "strongBase"],
  ["caustic", "strongBase"],
  ["lye", "strongBase"],
  ["hydrogen peroxide", "peroxide"],
  ["peroxide", "peroxide"],
  ["isopropyl", "alcohol"],
  ["isopropanol", "alcohol"],
  ["ethanol", "alcohol"],
  ["ethyl alcohol", "alcohol"],
  ["denatured alcohol", "alcohol"],
  ["chloroxylenol", "phenolic"],
  ["pcmx", "phenolic"],
  ["cresol", "phenolic"],
  ["phenol", "phenolic"],
  ["kerosene", "flammable"],
  ["petrol", "flammable"],
  ["gasoline", "flammable"],
  ["turpentine", "flammable"],
  ["thinner", "flammable"],
  ["acetone", "flammable"],
  ["sodium bicarbonate", "carbonate"],
  ["sodium carbonate", "carbonate"],
  ["washing soda", "carbonate"],
  ["baking soda", "carbonate"],
];

export const EMERGENCY = [
  { label: "India emergency", number: "112" },
  { label: "India poison centre (NPIC, AIIMS Delhi, 24×7, toll-free)", number: "1800116117", display: "1800 116 117" },
  { label: "US Poison Help", number: "18002221222", display: "1-800-222-1222" },
];
