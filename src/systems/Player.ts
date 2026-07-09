import Phaser from 'phaser';
import type { GameConfig } from '../config';

/**
 * Player — physics, dynamic flap, squash/stretch, trail
 */
export class Player {
  private scene: Phaser.Scene;
  private config: GameConfig;

  public x: number;
  public y: number;
  public vy: number = 0;
  public radius: number;
  public collisionRadius: number;

  private graphics: Phaser.GameObjects.Graphics;
  private trailGraphics: Phaser.GameObjects.Graphics;
  private trailPoints: Array<{ x: number; y: number; alpha: number }> = [];
  private maxTrailLength: number = 15;

  private squashScale: number = 1;
  private stretchScale: number = 1;

  public score: number = 0;

  constructor(scene: Phaser.Scene, config: GameConfig) {
    this.scene = scene;
    this.config = config;

    this.x = config.physics.playerX;
    this.y = scene.cameras.main.height / 2;
    this.radius = config.physics.playerRadius;
    this.collisionRadius = this.radius * config.physics.collisionScale;

    // Create graphics
    this.trailGraphics = scene.add.graphics();
    this.graphics = scene.add.graphics();

    // Initial pop
    this.vy = -config.physics.flapBase * config.physics.initialPop;
  }

  /**
   * Apply flap impulse (dynamic based on score)
   */
  flap(): void {
    const { flapBase, flapMax, flapT0, flapT1 } = this.config.physics;

    // Linear interpolation between flapBase and flapMax based on score
    const t = Math.max(0, Math.min(1, (this.score - flapT0) / (flapT1 - flapT0)));
    const impulse = -(flapBase + (flapMax - flapBase) * t);

    this.vy = impulse;

    // Squash on flap
    this.squashScale = 0.7;
    this.stretchScale = 1.3;
  }

  /**
   * Update physics and animation
   */
  update(dt: number): void {

    // Apply gravity
    this.vy += this.config.physics.gravity * dt;

    // Clamp to terminal velocity
    this.vy = Math.min(this.vy, this.config.physics.maxFall);

    // Update position
    this.y += this.vy * dt;

    // Soft ceiling (not lethal)
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy = 0;
    }

    // Floor is lethal (handled by collision in GameScene)

    // Ease squash/stretch back to 1
    this.squashScale += (1 - this.squashScale) * 0.2;
    this.stretchScale += (1 - this.stretchScale) * 0.2;

    // Update trail
    this.updateTrail();
  }

  private updateTrail(): void {
    // Add current position to trail
    this.trailPoints.push({ x: this.x, y: this.y, alpha: 1 });

    // Fade and remove old points
    for (let i = this.trailPoints.length - 1; i >= 0; i--) {
      this.trailPoints[i].alpha -= 0.05;
      if (this.trailPoints[i].alpha <= 0 || i < this.trailPoints.length - this.maxTrailLength) {
        this.trailPoints.splice(i, 1);
      }
    }
  }

  /**
   * Render player and trail
   */
  render(): void {
    // Clear graphics
    this.trailGraphics.clear();
    this.graphics.clear();

    // Draw trail
    if (this.trailPoints.length > 1) {
      for (let i = 0; i < this.trailPoints.length; i++) {
        const point = this.trailPoints[i];
        const trailRadius = this.radius * (0.5 + 0.5 * (i / this.trailPoints.length));
        const color = parseInt(this.config.colors.accent.replace('#', '0x'));

        this.trailGraphics.fillStyle(color, point.alpha * 0.3);
        this.trailGraphics.fillCircle(point.x, point.y, trailRadius);
      }
    }

    // Draw player with squash/stretch
    const scaleX = this.squashScale;
    const scaleY = this.stretchScale;

    // Player glow
    const glowColor = parseInt(this.config.colors.accent.replace('#', '0x'));
    this.graphics.fillStyle(glowColor, 0.4);
    this.graphics.fillCircle(this.x, this.y, this.radius * scaleX * 1.8);

    this.graphics.fillStyle(glowColor, 0.6);
    this.graphics.fillCircle(this.x, this.y, this.radius * scaleX * 1.4);

    // Player body
    const bodyColor = parseInt(this.config.colors.player.replace('#', '0x'));
    this.graphics.fillStyle(bodyColor, 1);

    // Draw ellipse for squash/stretch (approximate with scaled circle)
    this.graphics.save();
    this.graphics.translateCanvas(this.x, this.y);
    this.graphics.scaleCanvas(scaleX, scaleY);
    this.graphics.fillCircle(0, 0, this.radius);
    this.graphics.restore();
  }

  /**
   * Check if player hit floor
   */
  hitFloor(): boolean {
    const H = this.scene.cameras.main.height;
    return this.y + this.radius >= H;
  }

  /**
   * Destroy graphics
   */
  destroy(): void {
    this.graphics.destroy();
    this.trailGraphics.destroy();
  }
}
