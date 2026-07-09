# Rules & guardrails (for any AI/IDE working in this repo)

These are hard constraints. Follow them unless a human explicitly overrides one. (Usable as `.cursorrules` or a Cursor project rule.)

## Identity & look
- **Everything is a dot (circle).** Player, obstacles, collectibles, background, death effect — one primitive.
- **Monochrome dark grey + a single cyan accent.** Never introduce new hues except a player-glow skin color. Skins recolor **only** the player glow; the world stays grey.
- Use the color tokens in `tuning.md`; don't invent colors.

## Feel & fairness (casual-first)
- Tune casual: gentle speeds/gaps, forgiving hitbox (**collision radius = 0.8 × visual**).
- **Every hazard must be telegraphed** with ≥0.9s of visible travel before the player must react.
- **Never spawn an impossible pattern.** Validate at spawn that the gap/zigzag is physically flyable given gravity + current flap impulse + gate spacing.
- The first instance of a new mechanic in a zone is isolated and slowed.

## Architecture
- **All balance/feel numbers live in the config module** (`tuning.md`). No magic numbers scattered in systems/scenes.
- **World-coordinate spawning**; screen x = `worldX - scroll`. Don't decrement per-object screen x independently.
- **Pool everything** in the loop (obstacle dots, motes, particles, shards). No per-frame allocations.
- Derive sizes from screen `H`/`W`; cap DPR at 3; respect safe-area insets; portrait lock; clamp frame `dt` to 0.05s; pause on blur.

## Scope discipline (v1)
- Build only what's in `build-plan.md`, in order. Don't add features from the roadmap early.
- **No ads, no IAP, no accounts, no third-party analytics/tracking in v1.** (This keeps the App Privacy label "Data Not Collected" — don't break it without updating `app-store.md` and the privacy declaration.)
- Persistence is local only (`@capacitor/preferences`): best score, lifetime motes, cosmetics, mute.

## Accessibility & polish
- Respect `prefers-reduced-motion` (kill pulses/parallax intensity/shake; fewer shards).
- Provide a persisted mute toggle.
- Danger cue must not rely on color alone (add an outline on near-hazard dots).

## Source of truth
- **`reference/dotwisp.html` is the behavioral reference.** When unsure about feel/timing, match it. When it conflicts with the docs on scope/architecture, the docs win.
- Keep the docs updated as the game evolves — if you change a constant or mechanic, update `tuning.md` / `game-design.md` in the same change.

## Definition of "don't"
- Don't hard-code balance in scenes. Don't skip the flyability assertion. Don't add network calls. Don't introduce new art styles. Don't exceed v1 scope. Don't ship without reduced-motion + mute working.
