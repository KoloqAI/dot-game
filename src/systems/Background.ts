import Phaser from 'phaser';
import type { GameConfig } from '../config';

/**
 * Background — parallax dust particles for forward motion feel
 */
export class Background {
  private scene: Phaser.Scene;
  private config: GameConfig;
  private graphics: Phaser.GameObjects.Graphics;

  private dustParticles: Array<{ x: number; y: number; speed: number; radius: number }> = [];
  private dustCount: number = 60;

  constructor(scene: Phaser.Scene, config: GameConfig) {
    this.scene = scene;
    this.config = config;

    this.graphics = scene.add.graphics();
    this.graphics.setDepth(-1); // Behind everything

    this.initDust();
  }

  private initDust(): void {
    const W = this.scene.cameras.main.width;
    const H = this.scene.cameras.main.height;

    for (let i = 0; i < this.dustCount; i++) {
      this.dustParticles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        speed: 0.1 + Math.random() * 0.3, // Parallax speed multiplier
        radius: 0.5 + Math.random() * 1.5,
      });
    }
  }

  /**
   * Update dust positions based on world scroll
   */
  update(speed: number, dt: number): void {
    const W = this.scene.cameras.main.width;
    const H = this.scene.cameras.main.height;

    for (const particle of this.dustParticles) {
      // Move left at parallax speed
      particle.x -= speed * particle.speed * dt;

      // Wrap around
      if (particle.x < -10) {
        particle.x = W + 10;
        particle.y = Math.random() * H;
      }
    }
  }

  /**
   * Render dust particles
   */
  render(): void {
    this.graphics.clear();

    const dustColor = parseInt(this.config.colors.dust.replace('#', '0x'));

    for (const particle of this.dustParticles) {
      this.graphics.fillStyle(dustColor, 0.3);
      this.graphics.fillCircle(particle.x, particle.y, particle.radius);
    }
  }

  /**
   * Re-seed dust for new viewport dimensions.
   */
  resize(): void {
    this.dustParticles = [];
    this.initDust();
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
