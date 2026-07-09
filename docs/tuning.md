# Tuning — the source-of-truth numbers

Put **all** of these in a single `config.ts`. Anything scaled to screen height is noted as `* H`. These match the reference prototype's casual tuning.

## Physics
| Constant | Value | Note |
|---|---|---|
| gravity | `2.2 * H` px/s² | constant down accel |
| flapBase | `0.58 * H` | gentle early bounce impulse |
| flapMax | `0.84 * H` | strong late bounce impulse |
| flapT0 / flapT1 | `5` / `30` | score where the flap ramp starts / reaches max |
| maxFall | `1.15 * H` px/s | terminal velocity |
| initialPop | `flap * 0.5` | small upward nudge at run start |
| playerX | `0.32 * W` | fixed horizontal position |
| playerRadius | `9 * (H/800)` px | visual radius |
| collisionScale | `0.8` | collision radius = 0.8 × visual (forgiving) |
| ceiling | soft clamp (not lethal) | zero vy at top |
| floor | lethal → shatter | |

**Dynamic flap:** `t = clamp((score - 5)/(30 - 5), 0, 1)`; `impulse = -H * (0.58 + (0.84 - 0.58) * t)`. Global (does not reset per zone). ≈8% hop early vs ≈17% late.

## Speed
| Constant | Value |
|---|---|
| base (per-zone start) | `155` px/s |
| max (cap) | `360` px/s |
| ramp coefficient | `0.010` per px of zoneScroll |
| per-zone base step | `+12` px/s per zone (cap `250`) |
| transition drift | `55` px/s (breather) |

## Zones
| Constant | Value |
|---|---|
| names | Drift, Weave, Pulse (loop with roman-numeral suffix) |
| hints | "Ease in" / "Gaps split and offset" / "Gaps drift — time it" |
| quota (per type) | **15 / 20 / 22** (production) — prototype uses 8/10/12 to demo fast |
| quota loop step | `+2` per loop |

## Obstacles
| Constant | Value |
|---|---|
| dot grid spacing | `14` px |
| dot radius | `2.8–3.7` px (jittered) |
| base gap | `max(150 - loop*12, 118)` px |
| gap bonus | `+12` bounce, `+16` moving |
| bounce offset | `min(0.24*H, 0.13*H + loop*26)` |
| moving amplitude | `(0.07 + loop*0.015) * H` |
| wall thickness | single `52–70`, moving `40`, multi `34` px |
| gate spacing | `wall + 46` px |
| between obstacles | `max(300 - zoneScroll*0.02, 150)` px |
| reaction budget | ≥ `0.9` s of visible travel before action (enforce via spawn distance) |

## Motes
| Constant | Value |
|---|---|
| spawn chance (per obstacle) | `0.72` |
| collect radius | `20` px (+ player radius) |
| risk-offset chance (zone ≥ 2) | `0.35` |
| ring dots | `7` |
| zone-clear bonus | `3 + zone` |

## FX (shatter death)
| Constant | Value |
|---|---|
| shard count | `26` (`12` under reduced-motion) |
| hit-stop | `0.09` s freeze |
| death → card | `0.7` s |
| shake start | `10` (decaying) |
| flash decay | `14` /s |
| shard gravity | `0.45 × gravity` |

## Audio (tone: startHz, endHz, seconds, gain)
| SFX | Params |
|---|---|
| collect | `880, 1320, 0.18, 0.10` |
| zone clear | `660, 990, 0.5, 0.10` |
| death thud | `200, 70, 0.32, 0.16` |

## Colors
| Token | Hex |
|---|---|
| bg vignette | `#2b2b2b` → `#161616` |
| dust | `#3a3a3a` |
| obstacle / near-danger | `#8c8c8c` / `#c99b9b` |
| player / shards | `#eef7f7` |
| player glow / accent | `rgba(127,228,228,·)` / `#6fd6d6` |
| mote | `#d7fbfb` + cyan glow |
| UI text | `#cfe9e9` |
