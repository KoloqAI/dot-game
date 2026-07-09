import Phaser from 'phaser';
import { Preferences } from '@capacitor/preferences';
import type { GameConfig } from '../config';
import type { Mote, Dot } from '../types';

/**
 * MoteManager — collectible spawning, collect detection, currency persistence
 */
export class MoteManager {
  private scene: Phaser.Scene;
  private config: GameConfig;

  public motes: Mote[] = [];
  private graphicsPool: Phaser.GameObjects.Graphics[] = [];

  public runMotes: number = 0; // Collected this run
  public lifetimeMotes: number = 0; // Persistent total
  public combo: number = 0;

  private lastObstacleWorldX: number = 0;

  constructor(scene: Phaser.Scene, config: GameConfig) {
    this.scene = scene;
    this.config = config;

    this.loadLifetimeMotes();
  }

  private async loadLifetimeMotes(): Promise<void> {
    try {
      const result = await Preferences.get({ key: 'lifetimeMotes' });
      if (result.value) {
        this.lifetimeMotes = parseInt(result.value, 10);
      }
    } catch (e) {
      // Web fallback, no persistence
    }
  }

  public async saveLifetimeMotes(): Promise<void> {
    try {
      await Preferences.set({
        key: 'lifetimeMotes',
        value: this.lifetimeMotes.toString(),
      });
    } catch (e) {
      // Web fallback
    }
  }

  /**
   * Try to spawn a mote after an obstacle
   */
  trySpawn(obstacleWorldX: number, gapCenter: number, zone: number, _scroll: number): void {
    // Don't spawn too close to last obstacle
    if (obstacleWorldX - this.lastObstacleWorldX < 100) return;

    this.lastObstacleWorldX = obstacleWorldX;

    // Spawn chance
    if (Math.random() > this.config.motes.spawnChance) return;

    const H = this.scene.cameras.main.height;

    // Position: breathing space after obstacle, on flight line or risk-offset
    let y = gapCenter;

    if (zone >= 2 && Math.random() < this.config.motes.riskOffsetChance) {
      // Risk offset (up or down)
      const offset = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 40);
      y += offset;
      y = Math.max(50, Math.min(H - 50, y));
    }

    const worldX = obstacleWorldX + 150 + Math.random() * 100;

    // Create ring of dots
    const ring: Dot[] = [];
    const ringRadius = 12;
    const dotCount = this.config.motes.ringDots;

    for (let i = 0; i < dotCount; i++) {
      const angle = (i / dotCount) * Math.PI * 2;
      ring.push({
        x: Math.cos(angle) * ringRadius,
        y: Math.sin(angle) * ringRadius,
        radius: 2,
      });
    }

    this.motes.push({
      worldX,
      y,
      collected: false,
      ring,
    });
  }

  /**
   * Update motes, check collection
   */
  update(scroll: number, playerX: number, playerY: number, playerRadius: number): void {
    const collectRadius = this.config.motes.collectRadius + playerRadius;

    // Remove off-screen motes
    this.motes = this.motes.filter((mote) => {
      const screenX = mote.worldX - scroll;
      if (screenX < -50) {
        // Recycle graphics
        if (mote.graphics) {
          mote.graphics.clear();
          this.graphicsPool.push(mote.graphics);
          mote.graphics = undefined;
        }
        // Miss resets combo
        if (!mote.collected) {
          this.combo = 0;
        }
        return false;
      }
      return true;
    });

    // Check collection
    for (const mote of this.motes) {
      if (mote.collected) continue;

      const screenX = mote.worldX - scroll;
      const dx = playerX - screenX;
      const dy = playerY - mote.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < collectRadius * collectRadius) {
        this.collect(mote);
      }
    }
  }

  private collect(mote: Mote): void {
    mote.collected = true;
    this.runMotes++;
    this.lifetimeMotes++;
    this.combo++;

    // TODO: Trigger sparkle, chime, haptic (in GameScene)
  }

  /**
   * Add zone clear bonus
   */
  addZoneBonus(zone: number): void {
    const bonus = this.config.motes.zoneClearBonus(zone);
    this.runMotes += bonus;
    this.lifetimeMotes += bonus;
  }

  /**
   * Reset run motes (on death)
   */
  resetRun(): void {
    this.runMotes = 0;
    this.combo = 0;
  }

  /**
   * Render all motes
   */
  render(scroll: number): void {
    const moteColor = parseInt(this.config.colors.mote.replace('#', '0x'));
    const glowColor = parseInt(this.config.colors.accent.replace('#', '0x'));

    for (const mote of this.motes) {
      if (mote.collected) continue;

      const screenX = mote.worldX - scroll;

      // Get or create graphics
      if (!mote.graphics) {
        mote.graphics = this.graphicsPool.pop() || this.scene.add.graphics();
      }

      mote.graphics.clear();

      // Glow
      mote.graphics.fillStyle(glowColor, 0.3);
      mote.graphics.fillCircle(screenX, mote.y, 20);

      // Ring dots
      for (const dot of mote.ring) {
        mote.graphics.fillStyle(moteColor, 1);
        mote.graphics.fillCircle(screenX + dot.x, mote.y + dot.y, dot.radius);
      }
    }
  }

  /**
   * Clear all motes
   */
  clear(): void {
    for (const mote of this.motes) {
      if (mote.graphics) {
        mote.graphics.clear();
        this.graphicsPool.push(mote.graphics);
        mote.graphics = undefined;
      }
    }
    this.motes = [];
  }

  destroy(): void {
    this.clear();
    for (const graphics of this.graphicsPool) {
      graphics.destroy();
    }
  }
}
