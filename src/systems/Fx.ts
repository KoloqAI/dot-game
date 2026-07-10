import Phaser from 'phaser';
import type { GameConfig } from '../config';
import type { Shard, BurstParticle } from '../types';

/**
 * Fx — sparkles, shatter shards, screen shake, flash
 */
export class Fx {
  private scene: Phaser.Scene;
  private config: GameConfig;

  private graphics: Phaser.GameObjects.Graphics;
  private shards: Shard[] = [];
  private bursts: BurstParticle[] = [];
  private shakeOffset = { x: 0, y: 0 };
  private shakeIntensity: number = 0;
  private flashAlpha: number = 0;

  private reducedMotion: boolean = false;

  constructor(scene: Phaser.Scene, config: GameConfig) {
    this.scene = scene;
    this.config = config;

    this.graphics = scene.add.graphics();
    this.graphics.setDepth(1000); // Above everything

    // Check for reduced motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  /**
   * Trigger shatter effect at player position
   */
  shatter(x: number, y: number, radius: number): void {
    const shardCount = this.reducedMotion
      ? this.config.fx.shardCountReducedMotion
      : this.config.fx.shardCount;

    this.shards = [];

    for (let i = 0; i < shardCount; i++) {
      const angle = (i / shardCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 150 + Math.random() * 100;

      this.shards.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100, // Upward bias
        radius: radius * (0.3 + Math.random() * 0.4),
        alpha: 1,
      });
    }

    // Screen shake
    if (!this.reducedMotion) {
      this.shakeIntensity = this.config.fx.shakeStart;
    }

    // Flash
    this.flashAlpha = 1;
  }

  /**
   * Burst effect at position (mote collection — matches prototype spawnBurst)
   */
  burst(x: number, y: number): void {
    const count = this.reducedMotion ? 4 : 11;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 45 + Math.random() * 95;

      this.bursts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        radius: 2 + Math.random() * 2,
      });
    }
  }

  /**
   * Sparkle effect at position (legacy alias — delegates to burst)
   */
  sparkle(x: number, y: number): void {
    this.burst(x, y);
  }

  /**
   * Update effects
   */
  update(dt: number): void {
    const H = this.scene.cameras.main.height;

    // Update burst particles (no gravity — outward pop + fade)
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const p = this.bursts[i];
      p.life -= dt * 2.2;
      if (p.life <= 0) {
        this.bursts.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
    }

    // Update shards
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const shard = this.shards[i];

      // Apply gravity
      shard.vy += this.config.physics.gravity * this.config.fx.shardGravityScale * dt;

      // Update position
      shard.x += shard.vx * dt;
      shard.y += shard.vy * dt;

      // Fade out
      shard.alpha -= dt * 1.5;

      // Remove if faded or off-screen
      if (shard.alpha <= 0 || shard.y > H + 100) {
        this.shards.splice(i, 1);
      }
    }

    // Update shake
    if (this.shakeIntensity > 0) {
      this.shakeOffset.x = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeOffset.y = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= 0.9; // Decay

      if (this.shakeIntensity < 0.1) {
        this.shakeIntensity = 0;
        this.shakeOffset.x = 0;
        this.shakeOffset.y = 0;
      }
    }

    // Update flash
    if (this.flashAlpha > 0) {
      this.flashAlpha -= this.config.fx.flashDecay * dt;
      if (this.flashAlpha < 0) this.flashAlpha = 0;
    }
  }

  /**
   * Render effects
   */
  render(): void {
    this.graphics.clear();

    // Render burst particles (mote collect)
    const burstColor = parseInt(this.config.colors.mote.replace('#', '0x'));
    for (const p of this.bursts) {
      this.graphics.fillStyle(burstColor, p.life);
      this.graphics.fillCircle(p.x, p.y, p.radius);
    }

    // Render shards
    const shardColor = parseInt(this.config.colors.shards.replace('#', '0x'));

    for (const shard of this.shards) {
      this.graphics.fillStyle(shardColor, shard.alpha);
      this.graphics.fillCircle(shard.x, shard.y, shard.radius);
    }

    // Render flash
    if (this.flashAlpha > 0) {
      this.graphics.fillStyle(0xffffff, this.flashAlpha * 0.3);
      this.graphics.fillRect(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height);
    }
  }

  /**
   * Get shake offset for camera
   */
  getShakeOffset(): { x: number; y: number } {
    return this.shakeOffset;
  }

  /**
   * Clear all effects
   */
  clear(): void {
    this.shards = [];
    this.bursts = [];
    this.shakeIntensity = 0;
    this.shakeOffset = { x: 0, y: 0 };
    this.flashAlpha = 0;
    this.graphics.clear();
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
