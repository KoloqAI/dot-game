/**
 * Config — ALL tuning constants (single source of truth)
 * Values are scaled to screen dimensions at runtime where noted with * H or * W
 */

export interface GameConfig {
  // Physics
  physics: {
    gravity: number;           // * H px/s²
    flapBase: number;          // * H
    flapMax: number;           // * H
    flapT0: number;            // score threshold for flap ramp start
    flapT1: number;            // score threshold for max flap
    maxFall: number;           // * H px/s terminal velocity
    initialPop: number;        // * H multiplier
    playerX: number;           // * W
    playerRadius: number;      // * (H/800) px
    collisionScale: number;    // collision radius = visual * this
  };

  // Speed
  speed: {
    base: number;              // px/s per-zone start
    max: number;               // px/s cap
    rampCoefficient: number;   // per px of zoneScroll
    perZoneBaseStep: number;   // +px/s per zone
    perZoneBaseCap: number;    // max base speed
    transitionDrift: number;   // px/s during zone transition breather
  };

  // Zones
  zones: {
    names: string[];
    hints: string[];
    quotas: number[];          // obstacles per zone type
    quotaLoopStep: number;     // +N per loop
  };

  // Obstacles
  obstacles: {
    dotGridSpacing: number;    // px
    dotRadiusMin: number;      // px
    dotRadiusMax: number;      // px
    baseGap: (loop: number) => number;           // px
    gapBonusBounce: number;    // px
    gapBonusMoving: number;    // px
    bounceOffset: (loop: number) => number;      // * H
    movingAmplitude: (loop: number) => number;   // * H
    wallThicknessSingle: { min: number; max: number }; // px
    wallThicknessMoving: number;   // px
    wallThicknessMulti: number;    // px
    gateSpacing: number;       // wall + N px
    betweenObstacles: (zoneScroll: number) => number; // px
    reactionBudget: number;    // seconds
  };

  // Motes
  motes: {
    spawnChance: number;       // per obstacle
    collectRadius: number;     // px (+ player radius)
    riskOffsetChance: number;  // zone >= 2
    ringDots: number;
    zoneClearBonus: (zone: number) => number;
  };

  // FX (shatter death)
  fx: {
    shardCount: number;
    shardCountReducedMotion: number;
    hitStop: number;           // seconds
    deathToCard: number;       // seconds
    shakeStart: number;        // intensity
    flashDecay: number;        // per second
    shardGravityScale: number; // * gravity
  };

  // Audio (tone: startHz, endHz, seconds, gain)
  audio: {
    collect: { start: number; end: number; duration: number; gain: number };
    zoneClear: { start: number; end: number; duration: number; gain: number };
    deathThud: { start: number; end: number; duration: number; gain: number };
  };

  // Colors
  colors: {
    bgVignetteCenter: string;
    bgVignetteEdge: string;
    dust: string;
    obstacle: string;
    nearDanger: string;
    player: string;
    playerGlow: string;      // rgba with alpha placeholder
    accent: string;
    shards: string;
    mote: string;
    uiText: string;
  };
}

/**
 * Creates config scaled to screen dimensions
 */
export function createConfig(W: number, H: number): GameConfig {
  return {
    physics: {
      gravity: 2.2 * H,
      flapBase: 0.58 * H,
      flapMax: 0.84 * H,
      flapT0: 5,
      flapT1: 30,
      maxFall: 1.15 * H,
      initialPop: 0.5,
      playerX: 0.32 * W,
      playerRadius: 9 * (H / 800),
      collisionScale: 0.8,
    },

    speed: {
      base: 155,
      max: 360,
      rampCoefficient: 0.010,
      perZoneBaseStep: 12,
      perZoneBaseCap: 250,
      transitionDrift: 55,
    },

    zones: {
      names: ['Drift', 'Weave', 'Pulse'],
      hints: ['Ease in', 'Gaps split and offset', 'Gaps drift — time it'],
      quotas: [15, 20, 22],
      quotaLoopStep: 2,
    },

    obstacles: {
      dotGridSpacing: 14,
      dotRadiusMin: 2.8,
      dotRadiusMax: 3.7,
      baseGap: (loop: number) => Math.max(150 - loop * 12, 118),
      gapBonusBounce: 12,
      gapBonusMoving: 16,
      bounceOffset: (loop: number) => Math.min(0.24 * H, 0.13 * H + loop * 26),
      movingAmplitude: (loop: number) => (0.07 + loop * 0.015) * H,
      wallThicknessSingle: { min: 52, max: 70 },
      wallThicknessMoving: 40,
      wallThicknessMulti: 34,
      gateSpacing: 46,
      betweenObstacles: (zoneScroll: number) => Math.max(300 - zoneScroll * 0.02, 150),
      reactionBudget: 0.9,
    },

    motes: {
      spawnChance: 0.72,
      collectRadius: 20,
      riskOffsetChance: 0.35,
      ringDots: 7,
      zoneClearBonus: (zone: number) => 3 + zone,
    },

    fx: {
      shardCount: 26,
      shardCountReducedMotion: 12,
      hitStop: 0.09,
      deathToCard: 0.7,
      shakeStart: 10,
      flashDecay: 14,
      shardGravityScale: 0.45,
    },

    audio: {
      collect: { start: 880, end: 1320, duration: 0.18, gain: 0.10 },
      zoneClear: { start: 660, end: 990, duration: 0.5, gain: 0.10 },
      deathThud: { start: 200, end: 70, duration: 0.32, gain: 0.16 },
    },

    colors: {
      bgVignetteCenter: '#2b2b2b',
      bgVignetteEdge: '#161616',
      dust: '#3a3a3a',
      obstacle: '#8c8c8c',
      nearDanger: '#c99b9b',
      player: '#eef7f7',
      playerGlow: 'rgba(127,228,228,{alpha})',
      accent: '#6fd6d6',
      shards: '#eef7f7',
      mote: '#d7fbfb',
      uiText: '#cfe9e9',
    },
  };
}
