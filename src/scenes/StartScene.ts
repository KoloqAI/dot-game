import Phaser from 'phaser';
import type { GameConfig } from '../config';

/**
 * StartScene — title screen + tap to begin
 */
export class StartScene extends Phaser.Scene {
  private config!: GameConfig;
  private sceneData!: { config: GameConfig };

  constructor() {
    super({ key: 'StartScene' });
  }

  create(data: { config: GameConfig }) {
    this.sceneData = data;
    this.config = data.config;
    const { width, height } = this.cameras.main;

    // Dark background
    this.cameras.main.setBackgroundColor(this.config.colors.bgVignetteCenter);

    // Title
    this.add.text(width / 2, height * 0.35, 'Dotwisp', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '48px',
      color: this.config.colors.uiText,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height * 0.45, 'one-tap dot dodger', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '18px',
      color: this.config.colors.dust,
    }).setOrigin(0.5);

    // Tap to begin
    const tapText = this.add.text(width / 2, height * 0.65, 'TAP TO BEGIN', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '20px',
      color: this.config.colors.accent,
    }).setOrigin(0.5);

    // Pulse animation
    this.tweens.add({
      targets: tapText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Test dot in center (P0 acceptance: centered test dot)
    const centerDot = this.add.graphics();
    centerDot.fillStyle(parseInt(this.config.colors.accent.replace('#', '0x')), 1);
    centerDot.fillCircle(width / 2, height * 0.55, this.config.physics.playerRadius);

    // Input to start game
    this.input.once('pointerdown', () => {
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
