// Languages: English and Hindi. Each UI string is [English, Hindi].
// Data text (products, rules) is translated in data.hi.js.
import { GROUPS, LEVELS, STORAGE_BASICS, STORAGE_RULES, ruleKey } from "./data.js";
import { HI } from "./data.hi.js";

const KEY = "dont-mix:lang";
export const LANGS = { en: "English", hi: "हिन्दी" };

function initialLang() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && LANGS[saved]) return saved;
  } catch { /* storage blocked */ }
  const nav = globalThis.navigator?.language || "en";
  return nav.toLowerCase().startsWith("hi") ? "hi" : "en";
}

export let lang = initialLang();

export function setLang(next) {
  try { localStorage.setItem(KEY, next); } catch { /* still switch for this visit */ }
  lang = next;
}

const S = {
  skip: ["Skip to content", "सीधे सामग्री पर जाएँ"],
  tagline: ["Check cleaners before you mix or store them together.", "क्लीनर मिलाने या साथ रखने से पहले जाँच लें।"],
  "sos.open": ["Already mixed something?", "कुछ मिला दिया है?"],
  "tabs.label": ["Sections", "हिस्से"],
  "tab.mix": ["Check a mix", "मिश्रण जाँचें"],
  "tab.label": ["Read a label", "लेबल पढ़ें"],
  "tab.cupboard": ["My cupboard", "मेरी अलमारी"],

  "mix.h": ["What are you about to use together?", "आप कौन-सी चीज़ें साथ इस्तेमाल करने वाले हैं?"],
  "mix.hint": ["Pick two or more. Brands differ, so check the hint against your label.", "दो या ज़्यादा चुनें। ब्रांड अलग होते हैं, इसलिए संकेत को अपने लेबल से मिलाएँ।"],
  "mix.search": ["Search products", "प्रोडक्ट खोजें"],
  "mix.search.ph": ["Search: bleach, vinegar, drain…", "खोजें: ब्लीच, सिरका, नाली…"],
  "mix.products": ["Products", "प्रोडक्ट"],
  "mix.none": ["Nothing picked yet", "अभी कुछ नहीं चुना"],
  "mix.count": ["{n} picked", "{n} चुने गए"],
  "mix.clear": ["Clear", "हटाएँ"],
  "mix.oneMore": ["Pick one more to check the mix.", "मिश्रण जाँचने के लिए एक और चुनें।"],
  "mix.noMatch": ["No match. Try the <strong>Read a label</strong> tab to add it from the bottle.", "कुछ नहीं मिला। बोतल से जोड़ने के लिए <strong>लेबल पढ़ें</strong> टैब आज़माएँ।"],

  "label.h": ["Not sure what's in it?", "पता नहीं इसमें क्या है?"],
  "label.hint": ["Type or paste the ingredients or warning text from the bottle. We look for chemical names and skip lines like \"do not mix with bleach\".", "बोतल से सामग्री या चेतावनी लिखें या पेस्ट करें। हम केमिकल के नाम ढूँढते हैं और \"ब्लीच के साथ न मिलाएँ\" जैसी पंक्तियाँ छोड़ देते हैं।"],
  "label.name": ["Product name (optional)", "प्रोडक्ट का नाम (ज़रूरी नहीं)"],
  "label.name.ph": ["e.g. Blue bathroom spray", "जैसे: नीला बाथरूम स्प्रे"],
  "label.text": ["Label text", "लेबल का टेक्स्ट"],
  "label.text.ph": ["Contains: hydrochloric acid 9.5%, surfactants. Do not mix with bleach.", "सामग्री: हाइड्रोक्लोरिक एसिड 9.5%। ब्लीच के साथ न मिलाएँ।"],
  "label.read": ["Read label", "लेबल पढ़ें"],
  "label.example": ["Try an example", "उदाहरण देखें"],
  "label.empty": ["Paste some label text first.", "पहले लेबल का कुछ टेक्स्ट डालें।"],
  "label.unknown.h": ["No hazardous ingredient recognised", "कोई ख़तरनाक सामग्री नहीं पहचानी गई"],
  "label.unknown.p": ["That doesn't mean it's safe. We only know common names. Treat it as unknown and don't mix it.", "इसका मतलब यह नहीं कि यह सुरक्षित है। हम सिर्फ़ आम नाम जानते हैं। इसे अनजान मानें और न मिलाएँ।"],
  "label.found": ["We found", "हमें मिला"],
  "label.matched": ["Matched:", "मिले शब्द:"],
  "label.whatWeRead": ["What we read:", "हमने यह पढ़ा:"],
  "label.skipped": ["Skipped as warnings, not ingredients:", "चेतावनी मानकर छोड़ा, सामग्री नहीं:"],
  "label.add": ["Check this against other products →", "इसे दूसरे प्रोडक्ट से जाँचें →"],
  "label.defaultName": ["Label product {n}", "लेबल प्रोडक्ट {n}"],
  "label.fromLabel": ["From label: {groups}", "लेबल से: {groups}"],

  "cup.h": ["What's under your sink?", "आपके सिंक के नीचे क्या रखा है?"],
  "cup.hint": ["Add what you keep together. We check for leaks that could react and pairs you should never use one after another without rinsing. Saved only on this device.", "जो चीज़ें साथ रखते हैं, जोड़ें। हम देखते हैं कि रिसाव से कौन-सी चीज़ें प्रतिक्रिया कर सकती हैं, और किन्हें बिना धोए एक के बाद एक कभी नहीं लगाना चाहिए। सिर्फ़ इसी डिवाइस पर सेव होता है।"],
  "cup.add": ["Add a product", "प्रोडक्ट जोड़ें"],
  "cup.choose": ["Choose a product…", "प्रोडक्ट चुनें…"],
  "cup.addBtn": ["Add", "जोड़ें"],
  "cup.remove": ["Remove", "हटाएँ"],
  "cup.removeAria": ["Remove {name}", "{name} हटाएँ"],
  "cup.more": ["Add at least one more product.", "कम से कम एक और प्रोडक्ट जोड़ें।"],
  "cup.apart.h": ["Store these apart", "इन्हें अलग रखें"],
  "cup.fine.h": ["Storage looks fine", "रखने का तरीका ठीक लगता है"],
  "cup.fine.p": ["No pairs here that we know should be kept apart. Keep caps tight and everything out of children's reach.", "यहाँ ऐसी कोई जोड़ी नहीं जिसे हम अलग रखने को कहें। ढक्कन कसकर बंद रखें और सब कुछ बच्चों की पहुँच से दूर।"],
  "cup.unknown.h": ["Check these labels", "इनके लेबल देखें"],
  "cup.unknown.p": ["{names}: we don't know what's inside, so we can't check them.", "{names}: हमें नहीं पता इनमें क्या है, इसलिए जाँच नहीं सकते।"],
  "cup.never.h": ["Never use these one straight after the other without rinsing", "इन्हें बिना धोए एक के बाद एक कभी न लगाएँ"],
  "cup.basics.h": ["Storage basics for every home", "हर घर के लिए रखने के बुनियादी नियम"],

  "sos.title": ["If you've already mixed chemicals", "अगर आपने केमिकल मिला दिए हैं"],
  "sos.s1": ["<strong>Leave the room now.</strong> Take children and pets. Don't stay to clean up.", "<strong>अभी कमरे से बाहर निकलें।</strong> बच्चों और पालतू जानवरों को साथ लें। सफ़ाई के लिए न रुकें।"],
  "sos.s2": ["<strong>Get fresh air.</strong> Go outside or to a room with open windows. Only open windows on your way out if you can do it without breathing the fumes.", "<strong>ताज़ी हवा में जाएँ।</strong> बाहर या खुली खिड़कियों वाले कमरे में जाएँ। निकलते समय खिड़की तभी खोलें जब भाप साँस में लिए बिना खोल सकें।"],
  "sos.s3": ["<strong>Don't add anything else</strong> to \"neutralise\" it. That can make more gas.", "<strong>\"ठीक करने\" के लिए कुछ और न डालें।</strong> इससे और गैस बन सकती है।"],
  "sos.s4": ["<strong>Rinse skin or eyes</strong> with clean running water for 15 minutes. Take off splashed clothes.", "<strong>त्वचा या आँखें</strong> 15 मिनट तक साफ़ बहते पानी से धोएँ। छींटे पड़े कपड़े उतार दें।"],
  "sos.s5": ["<strong>Get help</strong> if you have coughing, wheezing, chest tightness, trouble breathing, or burning eyes. Keep the bottles so you can read the labels to the doctor.", "<strong>मदद लें</strong> अगर खाँसी, साँस में घरघराहट, सीने में जकड़न, साँस लेने में तकलीफ़ या आँखों में जलन हो। बोतलें संभालकर रखें ताकि डॉक्टर को लेबल पढ़कर बता सकें।"],
  "sos.fine": ["This is general first-aid guidance, not medical advice. If someone is struggling to breathe or unconscious, call emergency services first.", "यह सामान्य प्राथमिक उपचार की जानकारी है, डॉक्टरी सलाह नहीं। अगर किसी को साँस लेने में दिक़्क़त है या वह बेहोश है, तो पहले आपातकालीन सेवा को फ़ोन करें।"],
  "sos.close": ["Close", "बंद करें"],

  "foot.1": ["Runs entirely on your device. No accounts, no tracking, works offline.", "पूरी तरह आपके डिवाइस पर चलता है। न अकाउंट, न ट्रैकिंग, इंटरनेट के बिना भी चलता है।"],
  "foot.2": ["Covers common household products only. It can't know every brand. When in doubt: use one product, rinse with water, then the other.", "सिर्फ़ आम घरेलू प्रोडक्ट शामिल हैं। हर ब्रांड की जानकारी नहीं हो सकती। शक हो तो: एक प्रोडक्ट लगाएँ, पानी से धोएँ, फिर दूसरा।"],

  "sum.danger": ["Don't use these together. Use one, rinse the surface with water, air the room, then use the other another time.", "इन्हें साथ इस्तेमाल न करें। एक लगाएँ, सतह को पानी से धोएँ, कमरे में हवा आने दें, फिर दूसरा किसी और समय लगाएँ।"],
  "sum.warning": ["Better not to mix. Use them one at a time and rinse in between.", "न मिलाना बेहतर है। एक-एक करके लगाएँ और बीच में धो लें।"],
  "sum.unknown": ["We can't say these are safe. Check the label first.", "हम नहीं कह सकते कि ये सुरक्षित हैं। पहले लेबल देखें।"],
  "sum.info": ["No dangerous reaction in our list. Still, use one at a time. Mixing rarely cleans better.", "हमारी सूची में कोई ख़तरनाक प्रतिक्रिया नहीं। फिर भी एक-एक करके लगाएँ। मिलाने से सफ़ाई शायद ही बेहतर होती है।"],
  "sum.sosLink": ["Already mixed them? See what to do now →", "मिला चुके हैं? अभी क्या करें, देखें →"],
  "conf.high": ["Well documented", "अच्छी तरह प्रमाणित"],
  "conf.medium": ["Expected from the chemistry; less data at household amounts", "रसायन के हिसाब से अपेक्षित; घरेलू मात्रा पर कम आँकड़े"],
  "meta.source": ["Source: {s}", "स्रोत: {s}"],
  "reason.unknown": ["We don't know what's in one of these. Read the label, or paste it into the label checker. Until then, don't mix them.", "इनमें से एक में क्या है, हमें नहीं पता। लेबल पढ़ें या लेबल चेकर में डालें। तब तक इन्हें न मिलाएँ।"],
  "reason.none": ["Nothing in our list says these two react dangerously. Mixing cleaners rarely cleans better, though, so use one, rinse, then the other.", "हमारी सूची में इन दोनों की कोई ख़तरनाक प्रतिक्रिया नहीं है। फिर भी मिलाने से सफ़ाई शायद ही बेहतर होती है, इसलिए एक लगाएँ, धोएँ, फिर दूसरा।"],
  "reason.instead": ["Safer way:", "सुरक्षित तरीका:"],
  "reason.eq": ["Reaction:", "प्रतिक्रिया:"],
  // @end
};

export function t(key, vars = {}) {
  const pair = S[key];
  let s = pair ? (lang === "hi" && pair[1]) || pair[0] : key;
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

// Fill static HTML: data-i18n (text), data-i18n-html, data-i18n-ph
// (placeholder), data-i18n-aria (aria-label).
export function applyStatic(root = document) {
  document.documentElement.lang = lang;
  for (const el of root.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  for (const el of root.querySelectorAll("[data-i18n-html]")) el.innerHTML = t(el.dataset.i18nHtml);
  for (const el of root.querySelectorAll("[data-i18n-ph]")) el.placeholder = t(el.dataset.i18nPh);
  for (const el of root.querySelectorAll("[data-i18n-aria]")) el.setAttribute("aria-label", t(el.dataset.i18nAria));
}

// Data text, falling back to English when a Hindi entry is missing.
const hi = (section, id, field) => (lang === "hi" ? HI[section]?.[id]?.[field] : undefined);

export const gName = (id) => hi("groups", id, "name") ?? GROUPS[id]?.name ?? id;
export const gTip = (id) => hi("groups", id, "tip") ?? GROUPS[id]?.tip ?? "";
export const pName = (p) => (p.custom ? p.name : hi("products", p.id, "name") ?? p.name);
export const pHint = (p) => (p.custom ? p.hint : hi("products", p.id, "hint") ?? p.hint);
export const levelTitle = (level) => hi("levels", level, "title") ?? LEVELS[level].title;
export const ruleText = (r, field) => hi("rules", ruleKey(r.pair), field) ?? r[field];
export const storageText = (key) =>
  hi("storage", key, "advice") ?? STORAGE_RULES.find((s) => ruleKey(s.pair) === key)?.advice;
export const basics = () => (lang === "hi" ? HI.basics : STORAGE_BASICS);
export const emergencyLabel = (e) => hi("emergency", e.id, "label") ?? e.label;
