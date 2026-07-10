/**
 * Shared type definitions
 */

export interface Dot {
  x: number;
  y: number;
  radius: number;
  graphics?: Phaser.GameObjects.Graphics;
}

export interface Obstacle {
  worldX: number;
  dots: Dot[];
  type: 'static' | 'bounce' | 'moving';
  gapCenter: number;
  gapSize: number;
  passed: boolean;
  movingPhase?: number;
  movingAmplitude?: number;
}

export interface Mote {
  worldX: number;
  y: number;
  collected: boolean;
  graphics?: Phaser.GameObjects.Graphics;
  ring: Dot[];
}

export interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  graphics?: Phaser.GameObjects.Graphics;
}

export interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  radius: number;
}

export type ZoneType = 'Drift' | 'Weave' | 'Pulse';

export interface ZoneState {
  index: number;
  loop: number;
  cleared: number;
  quota: number;
  type: ZoneType;
  name: string;
  hint: string;
}
