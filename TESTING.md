# Dotwisp — Testing Guide

## 🎮 How to Test the Game

### Prerequisites
- Node.js v20+ installed
- Web browser (Chrome, Firefox, Safari, Edge)
- For iOS testing: macOS with Xcode

---

## Web Testing (Recommended First)

### 1. Start the Development Server

```bash
# Navigate to project directory
cd dot-game

# Start dev server
npm run dev
```

The server will start at **http://localhost:5173/**

### 2. Open in Browser

Navigate to http://localhost:5173/ in your web browser.

### 3. Test Core Gameplay

**Start Screen:**
- Should see "Dotwisp" title
- "TAP TO BEGIN" button should pulse
- Centered cyan dot visible
- Tap anywhere to start game

**Game Loop:**
- Tap or press Spacebar to flap (upward impulse)
- Avoid hitting obstacles (grey dot grids)
- Avoid hitting floor
- Pass through gaps to score
- Collect glowing mote rings (cyan dots)
- Watch score increase (top-left)
- Watch motes increase (top-right)
- See zone label (top-center): "Zone 1 · Drift"

**Zone Progression:**
- Zone 1 (Drift): Static gaps
- Zone 2 (Weave): Bounce gates (offset gaps, zigzag pattern)
- Zone 3 (Pulse): Moving gaps (oscillating up/down) + some bounce

After completing zone quotas (15/20/22 obstacles), transition should occur.

**Death:**
- Hit obstacle or floor
- Should see shatter effect (dots scatter)
- Screen shake (unless reduced-motion)
- White flash
- Game Over screen after ~0.7s

**Game Over Screen:**
- Score with count-up animation
- "NEW BEST!" if new high score, or "Best: X" display
- Motes earned this run
- Total motes (lifetime)
- Zone reached
- "TAP TO RETRY" pulses
- Tap to restart
- "LOCKER" button bottom-left to access cosmetics

**Locker:**
- See 6 skins (different glow colors)
- See 4 trails
- Equipped items shown with "EQUIPPED"
- Locked items show cost in motes
- Tap to purchase (if you have enough motes)
- Tap to equip (if already unlocked)
- "BACK" button returns to title

**HUD Elements:**
- Score counter (top-left)
- Motes counter (top-right, cyan)
- Zone label (top-center)
- Mute button (bottom-right, 🔊 or 🔇)

**Audio:**
- Flap sound on tap (short chirp)
- Collect sound when grabbing mote (ascending tone)
- Zone clear sound on completing zone (triumphant tone)
- Death thud on collision (descending bass)
- Mute button should toggle all sounds

---

## Detailed Test Matrix

### Core Mechanics

| Feature | Test | Expected Result |
|---------|------|-----------------|
| **Flap** | Press Space or tap | Player dot moves upward |
| **Gravity** | Release input | Player dot falls with gravity |
| **Dynamic Flap** | Score 0 vs score 30+ | Later flaps should be more powerful (larger hop) |
| **Trail** | Watch player movement | Fading trail of dots follows player |
| **Squash/Stretch** | Watch on flap | Player dot squashes on flap, stretches slightly |
| **Ceiling** | Flap into top | Player stops at ceiling (not lethal) |
| **Floor** | Hit bottom | Instant death, shatter effect |

### Obstacles

| Zone | Type | Test | Expected |
|------|------|------|----------|
| **Drift** | Static | Pass through gaps | Straight walls, steady rhythm |
| **Weave** | Bounce | Navigate zigzag | 2-3 thin walls, offset gaps (up/down) |
| **Pulse** | Moving | Time entry | Single gap oscillates vertically |

**Shapes to observe:**
- Rect (flat edge)
- Spike (triangle into gap)
- Dome (rounded bulge)
- Teeth (comb pattern)
- Steps (staircase)

**Collision:**
- Should only die when actually touching grey dots
- Hitbox should feel slightly forgiving (0.8× visual radius)

### Motes (Collectibles)

| Test | Expected |
|------|----------|
| Pass through mote ring | Mote counter increases, mote disappears |
| Miss a mote | Combo resets (internal) |
| Collect multiple in a row | Combo increases (not shown in HUD) |
| Zone complete | Bonus motes added (3 + zone number) |
| Death | Run motes reset, lifetime motes persist |
| Restart game | Lifetime motes remain |

### Zone Transitions

After clearing zone quota (e.g., 15 obstacles in Zone 1):

1. **Clearing** — Speed slows, obstacles stop spawning
2. **Flourish** — Brief pause (~1.5s)
3. **Next Card** — Next zone announced (~1.5s)
4. **Resuming** — Speed ramps back up, new obstacle type begins

### Death & Game Over

| Test | Expected |
|------|----------|
| Hit obstacle | Shatter, shake, flash, hit-stop (90ms freeze) |
| Game Over appears | Score counts up, best score shown |
| New high score | "✨ NEW BEST! ✨" displayed |
| Motes display | Shows run motes + lifetime total |
| Tap to retry | Restarts game immediately |
| Locker button | Opens cosmetics screen |

### Cosmetics (Locker)

| Test | Expected |
|------|----------|
| Open locker | Shows 6 skins, 4 trails, current motes |
| Purchase skin | Deducts motes, unlocks skin |
| Equip skin | Player glow changes color |
| Purchase trail | Deducts motes, unlocks trail |
| Insufficient motes | Nothing happens on tap |
| Back button | Returns to title screen |
| Restart game | Equipped cosmetics persist |

### Persistence

Close browser/app, reopen:

| Data | Should Persist |
|------|---------------|
| Best score | Yes |
| Lifetime motes | Yes |
| Unlocked skins | Yes |
| Equipped skin | Yes |
| Unlocked trails | Yes |
| Mute setting | Yes |
| Current run score | No (resets) |
| Run motes | No (resets) |

### Audio & Haptics

| Action | Audio | Haptic (iOS only) |
|--------|-------|-------------------|
| Flap | Short chirp | Light |
| Collect mote | Ascending tone | Light |
| Zone clear | Triumphant tone | None |
| Death | Descending bass | Heavy |
| Mute toggle | All sounds off/on | None |

### Accessibility

| Feature | Test | Expected |
|---------|------|----------|
| **Reduced Motion** | Enable OS setting | Fewer shards, no shake, no parallax intensity |
| **Hitbox** | Graze obstacle edge | Forgiving collision (0.8× visual) |
| **Colors** | Check contrast | Monochrome + cyan (colorblind-safe) |

---

## Performance Tests

### Web
- Open DevTools → Performance tab
- Record during gameplay
- Check FPS stays at 60fps
- Check memory doesn't grow excessively during long runs

### iOS (when available)
- Test on oldest supported device (iOS 16)
- Run to Zone 3+ with max difficulty (moving gaps + effects)
- Should maintain 60fps
- Battery usage should be reasonable

---

## Edge Cases to Test

| Scenario | Expected |
|----------|----------|
| Rapid tap spam | Player shouldn't break physics, ceiling stops upward |
| Long run (5+ minutes) | No memory leaks, no slowdown |
| Background/foreground | Game pauses on blur, resumes on focus |
| Mute during audio | Current sound continues, next sounds muted |
| Death during zone transition | Death takes priority, transition cancelled |
| Purchase with exact motes | Purchase succeeds, motes go to 0 |
| Spam retry button | Should only trigger once per tap |

---

## Known Acceptable Behaviors

- **Bundle size warning** — Phaser is 1.4MB, normal for game engine
- **Trail customization** — All trails look the same (default); can be enhanced later
- **Zone 3+ randomness** — Pulse zone mixes moving + bounce randomly
- **Mote spawn** — 72% chance per obstacle, not guaranteed
- **No pause button** — Blur/focus handles backgrounding
- **No settings menu** — Just mute toggle (lean by design)

---

## Quick Smoke Test Checklist

For a fast sanity check:

- [ ] Game starts in browser
- [ ] Can tap/spacebar to flap
- [ ] Obstacles appear and scroll left
- [ ] Collision causes death
- [ ] Death triggers shatter effect
- [ ] Game Over shows score
- [ ] Retry restarts game
- [ ] Motes persist across runs
- [ ] Locker opens and shows cosmetics
- [ ] Audio plays (with sound on)
- [ ] Mute button works

---

## Reporting Issues

If you find bugs or unexpected behavior:

1. Note the exact steps to reproduce
2. Check browser console for errors (F12 → Console)
3. Note your environment:
   - Browser + version
   - OS + version
   - Screen resolution
   - Any browser extensions active

---

## 🎉 Happy Testing!

The game is fully implemented. All core features, polish, and persistence should work as documented.

For questions or issues, refer to `/docs` for design specs and `README.md` for project overview.
