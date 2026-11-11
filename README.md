# Don't Mix 🧪

**Check your cleaning products before you mix them or store them together.**
Works offline. Nothing leaves your phone.

**Live demo:** https://shineyrbl-byte.github.io/dont-mix/

Built for **SafeSpace Hacks 2026**.

![Mix result: acid toilet cleaner + bleach shows "Do not mix" with the reason and source](docs/mix-result.jpg)

---

## The problem

Someone is cleaning a bathroom. The toilet cleaner isn't strong enough, so they add bleach. Many toilet cleaners are acid-based (hydrochloric acid), and acid + bleach releases **chlorine gas** in a small, closed room.

This is one of the most common accidental poisonings at home. It happens because:

- Bottles look similar, and brands don't say "acid" or "bleach" on the front.
- "Stronger together" feels like common sense.
- The warning, if there is one, is in tiny print on the back.

**Who it helps:** anyone who cleans a home, hostel, PG or small shop, especially people who are new to it (students living alone, new domestic workers, people helping elderly relatives).

## What it does

| Feature | What the person can do more safely |
|---|---|
| **Check a mix** | Pick two or more products and get a clear verdict (⛔ Do not mix / ⚠️ Avoid / ❔ Not sure / ✅ No known reaction), the gas it makes, why, and the source. |
| **Read a label** | Paste the text from the back of a bottle. It finds the hazardous ingredients and highlights the words it matched. It **skips warning lines** like "Do not mix with bleach" so they aren't mistaken for ingredients. |
| **My cupboard** | List what's under the sink. It tells you which bottles shouldn't share a shelf (leaks can react) and which pairs must never be used back to back without rinsing. |
| **Already mixed something?** | A one-tap emergency panel with first-aid steps and tap-to-call numbers: 112, the **AIIMS National Poisons Information Centre (1800 116 117)** and US Poison Help. |

### Example of the safer outcome

> Product A label: *"Hydrochloric acid 9.5%… Do not mix with bleach."*
> Product B: liquid bleach.
>
> **Before:** the person pours both into the toilet bowl.
> **With Don't Mix:** ⛔ *Do not mix: Acid makes bleach release chlorine gas quickly.* They use one, rinse, air the room, and use the other another day.

![Emergency panel](docs/emergency.jpg)

## Trust and responsible design

- **No AI guessing.** Every verdict comes from a fixed, readable rule table ([`js/data.js`](js/data.js)), so the same input always gives the same answer.
- **Shows its confidence.** Each reaction is marked *well documented* or *expected from the chemistry, less household data*, with a source.
- **Never says "safe" when it doesn't know.** Unrecognised labels and "not sure" products return ❔ *Not sure*, never ✅.
- **Even ✅ is cautious.** "No known dangerous reaction" still says to use one at a time.
- **Private by default.** No server, no accounts, no analytics. The cupboard list is saved only in your browser.
- **Works offline.** A service worker caches the whole app, so it works in a basement bathroom with no signal.
- **Accessible.** Keyboard and screen-reader friendly tabs, `aria-live` results, colour plus icon plus words for every level, light and dark themes, reduced-motion support.

## Limitations (what it can't do yet)

- **It only knows common product types and ingredient names.** It can't recognise every brand, and a label with no chemical names returns *Not sure*.
- **The label reader needs typed or pasted text.** There's no camera/OCR yet.
- **It's about mixing and storage, not every hazard** of each product on its own (beyond a short tip).
- **Some reactions have less household-scale data** (for example bleach + phenolic disinfectants). These are marked as such and treated as unsafe.
- **It is not medical advice.** In an emergency, call for help first.

## How it works

```
index.html            page and emergency dialog
js/data.js            hazard groups, reaction rules + sources, products, label keywords
js/engine.js          pure logic: checkPair, checkAll, checkStorage, parseLabel
js/mix.js             "Check a mix" tab
js/label.js           "Read a label" tab
js/cupboard.js        "My cupboard" tab (localStorage)
sw.js                 offline cache
tests/engine.test.js  18 tests for the rules and label parser
```

Each product belongs to one or more **hazard groups** (chlorine bleach, ammonia, strong acid, mild acid, caustic, peroxide, alcohol, phenolic, flammable…). Rules describe what happens when two groups meet. For products in several groups, the worst pairing wins.

The label parser:
1. Splits the text into sentences and drops warnings ("do not mix with…", "keep away from…").
2. Removes negations ("bleach-free", "no ammonia").
3. Matches whole words only, longest phrase first ("oxygen bleach" is peroxide, not chlorine; "polyethylene" doesn't match "lye").

## Run it

No build step and no dependencies.

```bash
git clone https://github.com/shineyrbl-byte/dont-mix.git
cd dont-mix
python3 -m http.server 5173     # then open http://localhost:5173
npm test                        # runs the 18 engine tests (Node 18+)
```

## Built during the hackathon

Everything in this repo was written during SafeSpace Hacks (Oct 17 – Nov 22, 2026). The commit history shows the step-by-step build. No pre-existing code, libraries or frameworks.

## Sources and credits

- [Washington State Dept. of Health: Dangers of mixing bleach with cleaners](https://doh.wa.gov/community-and-environment/contaminants/bleach-mixing-dangers) (bleach + ammonia / acids)
- [AIIMS New Delhi: National Poisons Information Centre](https://aiims.edu/index.php/en/npic_intro) (toll-free 1800 116 117, 24×7)
- US Poison Help line: 1-800-222-1222
- Other reactions (bleach + alcohol, peroxide + vinegar, acid + caustic) are standard chemistry and are labelled in the app with their confidence level.
- **AI assistance:** built with help from Claude Code (Anthropic) for code and wording. All safety rules were reviewed and checked against the sources above.

## What I learned

- The hardest part of a safety tool is saying "I don't know" clearly. An app that says "safe" when it isn't sure is worse than no app.
- Label text is full of the chemical names a product *doesn't* contain ("do not mix with bleach"). Naive keyword matching gets this exactly backwards.

## License

MIT
