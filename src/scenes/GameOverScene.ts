import Phaser from 'phaser';
import type { GameConfig } from '../config';

/**
 * GameOverScene — score, best, motes, zone reached, tap-to-retry
 */
export class GameOverScene extends Phaser.Scene {
  private config!: GameConfig;
  private score: number = 0;
  private bestScore: number = 0;
  private motes: number = 0;
  private lifetimeMotes: number = 0;
  private zone: number = 1;
  private isNewBest: boolean = false;
  private sceneData!: {
    config: GameConfig;
    score: number;
    bestScore: number;
    motes: number;
    lifetimeMotes: number;
    zone: number;
  };

  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: {
    config: GameConfig;
    score: number;
    bestScore: number;
    motes: number;
    lifetimeMotes: number;
    zone: number;
  }) {
    this.sceneData = data;
    this.config = data.config;
    this.score = data.score || 0;
    this.bestScore = data.bestScore || 0;
    this.motes = data.motes || 0;
    this.lifetimeMotes = data.lifetimeMotes || 0;
    this.zone = data.zone || 1;
    this.isNewBest = this.score === this.bestScore && this.score > 0;

    const { width, height } = this.cameras.main;

    // Dark background
    this.cameras.main.setBackgroundColor(this.config.colors.bgVignetteCenter);

    // GAME OVER title
    this.add
      .text(width / 2, height * 0.25, 'GAME OVER', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '36px',
        color: this.config.colors.uiText,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Score with count-up animation
    const scoreDisplay = this.add
      .text(width / 2, height * 0.38, '0', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '56px',
        color: this.config.colors.uiText,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Count-up animation
    let currentScore = 0;
    const countUpDuration = 800;
    const countUpInterval = 20;
    const increment = Math.ceil(this.score / (countUpDuration / countUpInterval));

    const countUpTimer = this.time.addEvent({
      delay: countUpInterval,
      callback: () => {
        currentScore = Math.min(currentScore + increment, this.score);
        scoreDisplay.setText(currentScore.toString());

        if (currentScore >= this.score) {
          countUpTimer.destroy();
        }
      },
      loop: true,
    });

    // New best badge
    if (this.isNewBest) {
      this.add
        .text(width / 2, height * 0.48, '✨ NEW BEST! ✨', {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '20px',
          color: this.config.colors.accent,
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
    } else {
      // Show best score
      this.add
        .text(width / 2, height * 0.48, `Best: ${this.bestScore}`, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '18px',
          color: this.config.colors.dust,
        })
        .setOrigin(0.5);
    }

    // Motes this run
    this.add
      .text(width / 2, height * 0.58, `Motes: ${this.motes}`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '20px',
        color: this.config.colors.accent,
      })
      .setOrigin(0.5);

    // Lifetime motes
    this.add
      .text(width / 2, height * 0.64, `Total: ${this.lifetimeMotes}`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '16px',
        color: this.config.colors.dust,
      })
      .setOrigin(0.5);

    // Zone reached
    this.add
      .text(width / 2, height * 0.72, `Reached Zone ${this.zone}`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '18px',
        color: this.config.colors.dust,
      })
      .setOrigin(0.5);

    // Tap to retry
    const retryText = this.add
      .text(width / 2, height * 0.85, 'TAP TO RETRY', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '22px',
        color: this.config.colors.accent,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Pulse animation
    this.tweens.add({
      targets: retryText,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Locker button (bottom-left)
    const lockerBtn = this.add
      .text(20, height - 40, '🔒 LOCKER', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '16px',
        color: this.config.colors.uiText,
      })
      .setOrigin(0, 1)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('LockerScene', { config: this.config });
      });

    // Input to retry
    this.input.once('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Ignore if clicking locker button
      const bounds = lockerBtn.getBounds();
      if (bounds.contains(pointer.x, pointer.y)) return;

      this.scene.start('GameScene', { config: this.config });
    });

    this.scale.on('resize', this.onResize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
    });
  }

  private onResize(): void {
    this.scene.restart(this.sceneData);
  }
}
