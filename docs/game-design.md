# Game design

*(All specific numbers live in `tuning.md`; this doc defines behavior and intent.)*

## Pillars
1. Fair before hard — hazards are telegraphed; challenge is variety of demand, not surprise or precision.
2. Every run makes progress — score resets on death; motes persist.
3. One idea, executed precisely — dots, grey, one accent.

## Core loop
Player dot is fixed at ~32% of screen width. World scrolls right→left. Gravity constantly pulls the dot down; each tap sets an upward velocity. Thread gaps in dot-built obstacles, grab motes, clear each zone to advance. Hitting any obstacle dot or the floor triggers the shatter death.

## Controls
Single input: **tap anywhere** (Space in dev) sets an upward velocity. No drag/multitouch. Taps on Start/Game Over begin/restart. Light haptic per tap; heavy on death.

## Dynamic flap ("bounce")
The flap impulse starts **gentle** (precise fine control, easy early gaps) and **ramps up with progress**, so hops grow larger and harder to control later. This is a primary difficulty lever, separate from speed/zones, and is tied to cumulative obstacles cleared (global; does not reset per zone). Formula + constants in `tuning.md`.

## Obstacles — everything is dots
Two combined systems; all obstacles guarantee a passable, flyable gap.

**A. Shape silhouette (visual texture).** The gap-facing edge uses one of five dot-grid silhouettes: `rect`, `spike` (triangle into gap), `dome` (rounded bulge), `teeth` (comb), `steps` (staircase). Occasional decorative ring/diamond of dots on single-gate obstacles.

**B. Movement demand (the actual gameplay variety), gated by zone:**
- **Static gap** — steady rhythm.
- **Bounce gate** — 2–3 thin walls close together with vertically **offset** gaps (zigzag), forcing flap-up-then-drop.
- **Moving gap** — a single gap whose center **oscillates vertically**; time your entry. Walls are built padded beyond the screen edges so the moving gap never exposes a hole.

## Zones (endless, escalating chapters)
A run flows through repeating themed zones; after the third it loops with escalation (Zone 4 = "Drift II", faster/tighter).

| Type | Name | Focus | New element |
|---|---|---|---|
| 0 | Drift | flap rhythm | static gaps |
| 1 | Weave | up-then-down bounce | offset bounce gates |
| 2 | Pulse | timed entry | moving gaps (+ some bounce) |

- Each zone has a **quota** of obstacles to clear before transitioning (see `tuning.md`).
- **Within-zone rhythm:** the first instance of a new mechanic is isolated and slowed (safe learning), then build → light peak → brief breather → transition.
- **Per-zone speed sawtooth:** each new zone starts a touch slower and ramps within itself — this relief prevents a long run from feeling like one endless climb.
- Always-on small **zone label** top-center ("Zone 2 · Weave").

## Zone transition ("end of level" experience)
On clearing a zone's quota: (1) the field clears and speed eases to a gentle, **non-lethal** breather; (2) a **"Zone N Cleared"** flourish with a star **rank** (by motes gathered that zone) and a **mote bonus**; (3) a **"Zone N+1 — Name"** title card + one-line mechanic hint; (4) resume with the sawtooth ramp. ~4s total. The prototype demonstrates the exact flow and timings.

## Collectibles → currency → cosmetics
- **Motes:** glowing dot-rings drifting in the breathing space after obstacles, on the natural flight line; from Zone 2, some are nudged off-line for risk/reward.
- **On collect:** chime + sparkle + counter pop + light haptic + combo tick.
- **Persistence:** motes bank into a lifetime total that never resets on death; plus a bonus per zone cleared.
- **Cosmetics (cosmetic only, no pay-to-win):** ~6 skins (player glow hue) + ~4 trails. Earn via motes or milestone unlocks. Simple offline locker; skins recolor only the glow — the grey world never changes.

## Death — shatter
Floor or obstacle contact: **hit-stop** (~90ms freeze) → the dot bursts into ~26 small dots that scatter under gravity and fade → screen shake (decaying) + a quick white flash → after ~0.7s the Game Over card fades in (count-up score, "New Best!", motes this run + lifetime total, zone reached). Instant one-tap retry. Reduced-motion: fewer shards, no shake.

## Look & audio
Monochrome dark-grey (radial vignette), cyan accent only. HUD: score top-left, motes top-right (glowing pip that pops on pickup), thin weight, tabular numerals, safe-area padded. System font. Soft synth SFX (flap, collect, zone-clear, death) behind a persisted mute toggle. Respect `prefers-reduced-motion`. Colors + exact SFX params in `tuning.md`.

## Accessibility
Reduced-motion mode; generous hitbox; colorblind-safe danger cue (a faint outline on near-hazard dots, not only the warm tint); reserve a "Relaxed mode" toggle (roadmap).

## Scope — v1 vs roadmap
**v1:** 3 looping zones (Drift/Weave/Pulse); obstacles = static + bounce + moving (+ decorative rings); collectibles + motes + combo; ~6 skins + ~4 trails + locker + milestone unlocks; zone transitions; shatter death + Game Over; casual tuning + fairness + juice + accessibility basics; no ads/IAP/accounts/tracking.
**Roadmap:** Zones 4–5 (Scatter, Gauntlet), needle/precision + multi-hazard swarms; once-per-run mote revive; Relaxed mode; Game Center leaderboard + daily seeded challenge; more cosmetics; iPad layout.
