# Build plan

Work phases **in order**; don't advance until the acceptance criteria pass. Keep all tuning in the config module (`tuning.md`). The prototype (`reference/dotwisp.html`) implements P1–P7 already — port from it.

## Phases
**P0 — Scaffold & device run.** Vite+TS+Phaser, empty scenes, Capacitor iOS, portrait lock, dark bg. *Done:* a centered test dot runs on a real iPhone via Xcode.

**P1 — Player physics & input.** Gravity, dynamic flap, terminal velocity, soft ceiling, lethal floor (temporary hard stop), squash/stretch, trail. *Done:* feel matches the prototype and `tuning.md`.

**P2 — Background feel.** CSS vignette + parallax dust; forward motion reads even at rest.

**P3 — Single-gap obstacles.** Five dot-grid silhouettes; world-coord spawning + pooling + collision (0.8× hitbox) + scoring. *Done:* all five shapes appear, passable, kill on contact, score; 60fps.

**P4 — Zones + bounce + moving gaps.** ZoneManager gating (Drift/Weave/Pulse), bounce gates, moving gaps (padded walls, no holes), per-zone speed sawtooth, zone label. *Done:* zones cycle and escalate; a spawn-time assertion proves every pattern is flyable.

**P5 — Zone transition.** Full clear → flourish (rank + mote bonus) → next-card → resume, with the non-lethal breather. *Done:* matches the prototype's flow/timings.

**P6 — Collectibles & currency.** Mote spawning (flight line + risk offset), generous collect, combo, sparkle/chime/haptic, HUD counter, persistent lifetime total + zone bonus. *Done:* motes collect and persist across runs.

**P7 — Shatter death & Game Over.** Hit-stop + shards + shake + flash; Game Over card (count-up score, new-best, motes, zone reached); instant retry; reduced-motion variant. *Done:* matches the prototype.

**P8 — Cosmetics locker.** ~6 skins + ~4 trails; buy with motes or milestone unlock; equip; persist; skins recolor only the glow.

**P9 — Polish & juice.** Audio + mute; haptics; glow pulse; near-miss micro-feedback; reduced-motion + colorblind cue; per-zone ambient warmth/tempo drift.

**P10 — Device QA & performance.** Oldest supported device at max difficulty (3-gate + moving + effects) at 60fps; safe-area layout on notch/Dynamic Island; background/foreground pause; long-run memory stability.

**P11 — App Store packaging & submission.** See `app-store.md`.

## Testing
- **Generator assertion:** every obstacle (esp. bounce + moving) is flyable given gravity/impulse/spacing; every gap within bounds.
- **Matrix:** oldest + newest device; reduced-motion on/off; muted/unmuted; background mid-run; rapid retry spam; long run (speed cap, no memory growth); cosmetics purchase/equip persistence.
- **Fairness:** playtest to Zone 3+ confirming no impossible patterns.

## Definition of done (v1)
Full loop Start → zones (static→bounce→moving, looping w/ escalation) → collectibles → transitions → shatter death → Game Over → instant retry, no reloads. Casual tuning + fairness honored. Best score, lifetime motes, cosmetics persist. Mute + reduced-motion respected; haptics wired. 60fps on the oldest supported device at max difficulty. Builds, signs, passes App Store review as a 4+, "Data Not Collected" arcade game.
