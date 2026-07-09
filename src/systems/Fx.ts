import Phaser from 'phaser';
import type { GameConfig } from '../config';
import type { Shard } from '../types';

/**
 * Fx — sparkles, shatter shards, screen shake, flash
 */
export class Fx {
  private scene: Phaser.Scene;
  private config: GameConfig;

  private graphics: Phaser.GameObjects.Graphics;
  private shards: Shard[] = [];
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
   * Sparkle effect at position (for mote collection)
   */
  sparkle(x: number, y: number): void {
    // Simple sparkle: small particles
    const sparkleCount = 8;

    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2;
      const speed = 80 + Math.random() * 40;

      this.shards.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 2,
        alpha: 1,
      });
    }
  }

  /**
   * Update effects
   */
  update(dt: number): void {
    const H = this.scene.cameras.main.height;

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
    this.shakeIntensity = 0;
    this.shakeOffset = { x: 0, y: 0 };
    this.flashAlpha = 0;
    this.graphics.clear();
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
