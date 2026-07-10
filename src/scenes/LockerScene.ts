import Phaser from 'phaser';
import type { GameConfig } from '../config';
import { Cosmetics } from '../systems/Cosmetics';
import { MoteManager } from '../systems/MoteManager';

/**
 * LockerScene — cosmetics: spend motes on skins/trails
 */
export class LockerScene extends Phaser.Scene {
  private config!: GameConfig;
  private cosmetics!: Cosmetics;
  private moteManager!: MoteManager;
  private sceneData!: { config: GameConfig };

  constructor() {
    super({ key: 'LockerScene' });
  }

  async create(data: { config: GameConfig }) {
    this.sceneData = data;
    this.config = data.config;
    const { width, height } = this.cameras.main;

    // Load cosmetics
    this.cosmetics = new Cosmetics();
    this.moteManager = new MoteManager(this, this.config);
    await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for async load

    // Dark background
    this.cameras.main.setBackgroundColor(this.config.colors.bgVignetteCenter);

    // Title
    this.add
      .text(width / 2, 40, 'LOCKER', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '32px',
        color: this.config.colors.uiText,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);

    // Motes display
    this.add
      .text(width / 2, 90, `Motes: ${this.moteManager.lifetimeMotes}`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '20px',
        color: this.config.colors.accent,
      })
      .setOrigin(0.5, 0);

    // Skins section
    this.add
      .text(width / 2, 140, 'SKINS', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '20px',
        color: this.config.colors.uiText,
      })
      .setOrigin(0.5, 0);

    this.renderSkins(width, 180);

    // Trails section
    this.add
      .text(width / 2, height * 0.6, 'TRAILS', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '20px',
        color: this.config.colors.uiText,
      })
      .setOrigin(0.5, 0);

    this.renderTrails(width, height * 0.6 + 40);

    // Back button
    this.add
      .text(20, height - 40, '← BACK', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '18px',
        color: this.config.colors.uiText,
      })
      .setOrigin(0, 1)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('StartScene', { config: this.config });
      });

    this.scale.on('resize', this.onResize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
    });
  }

  private onResize(): void {
    this.scene.restart(this.sceneData);
  }

  private renderSkins(width: number, startY: number): void {
    const cols = 3;
    const itemWidth = 100;
    const itemHeight = 80;
    const spacing = 20;

    this.cosmetics.skins.forEach((skin, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = width / 2 - ((cols - 1) * (itemWidth + spacing)) / 2 + col * (itemWidth + spacing);
      const y = startY + row * (itemHeight + spacing);

      // Background
      const bg = this.add.graphics();
      const isEquipped = this.cosmetics.equippedSkin === skin.id;
      bg.fillStyle(isEquipped ? 0x3a3a3a : 0x2a2a2a, 1);
      bg.fillRoundedRect(x - itemWidth / 2, y, itemWidth, itemHeight, 8);

      // Skin preview dot
      const dotColor = parseInt(skin.glowColor.replace('#', '0x'));
      const dot = this.add.graphics();
      dot.fillStyle(dotColor, 0.4);
      dot.fillCircle(x, y + 25, 18);
      dot.fillStyle(dotColor, 1);
      dot.fillCircle(x, y + 25, 12);

      // Name
      this.add
        .text(x, y + 48, skin.name, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '12px',
          color: this.config.colors.uiText,
        })
        .setOrigin(0.5, 0);

      // Cost or Equipped
      const label = skin.unlocked
        ? isEquipped
          ? 'EQUIPPED'
          : 'EQUIP'
        : `${skin.cost} motes`;

      this.add
        .text(x, y + 68, label, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '10px',
          color: skin.unlocked ? this.config.colors.accent : this.config.colors.dust,
        })
        .setOrigin(0.5, 0)
        .setInteractive()
        .on('pointerdown', () => this.handleSkinClick(skin.id));
    });
  }

  private renderTrails(width: number, startY: number): void {
    const cols = 4;
    const itemWidth = 80;
    const itemHeight = 60;
    const spacing = 15;

    this.cosmetics.trails.forEach((trail, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = width / 2 - ((cols - 1) * (itemWidth + spacing)) / 2 + col * (itemWidth + spacing);
      const y = startY + row * (itemHeight + spacing);

      // Background
      const bg = this.add.graphics();
      const isEquipped = this.cosmetics.equippedTrail === trail.id;
      bg.fillStyle(isEquipped ? 0x3a3a3a : 0x2a2a2a, 1);
      bg.fillRoundedRect(x - itemWidth / 2, y, itemWidth, itemHeight, 8);

      // Name
      this.add
        .text(x, y + 15, trail.name, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '12px',
          color: this.config.colors.uiText,
        })
        .setOrigin(0.5, 0);

      // Cost or Equipped
      const label = trail.unlocked
        ? isEquipped
          ? 'EQUIPPED'
          : 'EQUIP'
        : `${trail.cost} motes`;

      this.add
        .text(x, y + 38, label, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '10px',
          color: trail.unlocked ? this.config.colors.accent : this.config.colors.dust,
        })
        .setOrigin(0.5, 0)
        .setInteractive()
        .on('pointerdown', () => this.handleTrailClick(trail.id));
    });
  }

  private handleSkinClick(id: string): void {
    const skin = this.cosmetics.skins.find((s) => s.id === id);
    if (!skin) return;

    if (skin.unlocked) {
      // Equip
      this.cosmetics.equip('skin', id);
      this.scene.restart({ config: this.config });
    } else {
      // Try to purchase
      if (this.moteManager.lifetimeMotes >= skin.cost) {
        this.moteManager.lifetimeMotes -= skin.cost;
        this.moteManager.saveLifetimeMotes();
        this.cosmetics.unlock('skin', id);
        this.cosmetics.equip('skin', id);
        this.scene.restart({ config: this.config });
      }
    }
  }

  private handleTrailClick(id: string): void {
    const trail = this.cosmetics.trails.find((t) => t.id === id);
    if (!trail) return;

    if (trail.unlocked) {
      // Equip
      this.cosmetics.equip('trail', id);
      this.scene.restart({ config: this.config });
    } else {
      // Try to purchase
      if (this.moteManager.lifetimeMotes >= trail.cost) {
        this.moteManager.lifetimeMotes -= trail.cost;
        this.moteManager.saveLifetimeMotes();
        this.cosmetics.unlock('trail', id);
        this.cosmetics.equip('trail', id);
        this.scene.restart({ config: this.config });
      }
    }
  }
}
