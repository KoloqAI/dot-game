# Structure & engineering conventions

## Recommended layout
```
src/
  main.ts              # bootstrap: game config, scale, scene list
  config.ts            # ALL tuning constants (see tuning.md) — single source of truth
  types.ts             # shared interfaces (Obstacle, Mote, Shard, Dot, ...)
  scenes/
    BootScene.ts       # one-time init (status bar, splash, preferences); no image assets
    StartScene.ts      # title + tap-to-begin
    GameScene.ts       # the run loop: input, physics, spawning, collision, zones, death
    GameOverScene.ts   # score, best, motes, zone reached, tap-to-retry
    LockerScene.ts     # cosmetics: spend motes on skins/trails
  systems/
    Player.ts          # physics, dynamic flap, squash/stretch, trail
    Background.ts       # vignette (CSS) + parallax dust
    ObstacleFactory.ts # builds dot-grid shapes: static / bounce / moving gates
    ObstacleManager.ts # world-coord spawning, pooling, movement, collision, scoring
    ZoneManager.ts     # zone gating, quotas, transition state machine
    MoteManager.ts     # collectible spawning, collect detection, currency
    Fx.ts              # sparkles, shatter shards, screen shake, flash
    Cosmetics.ts       # owned/equipped skins & trails (Preferences)
    Audio.ts           # sfx + mute
    Haptics.ts         # @capacitor/haptics wrapper (no-op on web)
```

## Module responsibilities (one job each)
- **GameScene** orchestrates; it owns no tuning numbers (those come from config) and delegates behavior to systems.
- **ObstacleFactory** is pure generation (given zone → dots). **ObstacleManager** owns lifecycle (spawn/move/collide/score/recycle).
- **ZoneManager** decides *what* spawns (mechanic gating) and drives transitions; it does not draw obstacles.
- **MoteManager** owns collectibles + the run's mote count; persistence of the lifetime total goes through Preferences.
- **Fx** owns all transient visual effects and screen shake.

## Engineering must-dos
- **World coordinates for spawning.** Track total `scroll`; an object's screen x = `worldX - scroll`. Spawn when `nextWorldX - scroll < W + 120`, then `nextWorldX += width + gap`. Never decrement per-object screen x independently — it drifts over time.
- **Object pooling.** Pool obstacle dots, motes, particles, and shards. No per-frame allocation in the loop; a 3-gate obstacle plus effects can be a few hundred dots.
- **Collision.** Circle-vs-circle, player vs each obstacle dot, only for obstacles within ±40px of the player x. Use distance-squared (no per-frame `sqrt`). Player **collision radius = 0.8 × visual radius**.
- **Resolution independence.** Derive everything from screen `H`/`W`; cap devicePixelRatio at 3. Respect safe-area insets for HUD/overlays. Portrait lock.
- **Robust loop.** Clamp frame `dt` to 0.05s (survives backgrounding); pause the run on blur and resume cleanly.
- **Rendering the vignette.** Graphics can't do radial gradients cheaply — put the vignette in CSS behind a transparent canvas, or use a RenderTexture.
