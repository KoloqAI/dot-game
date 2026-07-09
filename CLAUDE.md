# Dotwisp — project context (start here)

**Name:** *Dotwisp* is the finalized app name. Pair it with a descriptive subtitle in the store (e.g. "one-tap dot dodger") so the coined name still surfaces on gameplay keywords. (Availability was first-pass-checked; do a formal trademark search + grab `dotwisp.com`/handles before launch.)


**What we're building:** a one-button, endless, flappy-style *dodger* for iOS, divided into escalating **Zones**. Everything in the world is made of one primitive — a **dot (circle)**: the player, the obstacles, the collectibles, the background, and the death effect. The world is dark-grey monochrome; the only color is the player's cyan glow.

**Feel:** casual & forgiving — easy to start, gentle to fail, always fair. Difficulty comes from *variety of demand*, not twitch precision.

**Platform:** iPhone first, iOS 16+, portrait only. Free; no ads, IAP, accounts, or tracking in v1.

---

## The non-negotiable rules (summary — full list in `rules.md`)
1. **Everything is a dot.** One primitive, monochrome grey, one cyan accent. Skins recolor only the player glow.
2. **Fair before hard.** Every hazard is telegraphed with ≥0.9s reaction time; hitbox is forgiving.
3. **Every run makes progress.** Score resets on death; collected currency (motes) persists.
4. **All tuning lives in one config module.** Never hard-code balance numbers elsewhere.
5. **Don't add scope beyond `build-plan.md`.** v1 is deliberately lean.

---

## The docs (read the one that fits the task)
| File | Use it for |
|---|---|
| `game-design.md` | Mechanics, zones, obstacles, collectibles, transitions, death, look/feel |
| `tuning.md` | Every balance/feel constant (the source-of-truth numbers) |
| `tech-stack.md` | Stack, prerequisites, dependencies, setup, iOS packaging |
| `structure.md` | Folder layout, module responsibilities, engineering conventions |
| `build-plan.md` | Ordered phases + acceptance criteria + testing + definition of done |
| `app-store.md` | Icon/launch/screenshots, submission, privacy, review checklist |
| `rules.md` | Hard guardrails for any AI/IDE working in this repo |

**Behavioral reference:** `reference/dotwisp.html` is a complete, playable prototype (open in a browser; tap/click or Space). It is the canonical source for feel, timing, and look — when a doc and the prototype seem to disagree on *feel*, match the prototype; when they disagree on *scope/architecture*, the docs win.

---

## How to work
Follow `build-plan.md` phases in order; keep balance in the config module described in `tuning.md`; obey `rules.md`; and open the prototype whenever you need to match a behavior.
