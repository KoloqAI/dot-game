import Phaser from 'phaser';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * BootScene — one-time init: status bar, preferences check
 * No image assets, minimal setup
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  async create() {
    // Set status bar style (iOS)
    try {
      await StatusBar.setStyle({ style: Style.Dark });
    } catch (e) {
      // Web fallback — no-op
    }

    // Load any persisted preferences if needed
    // (mute, best score, cosmetics will be loaded by respective managers)

    // Get config from global
    const config = (window as any).__GAME_CONFIG__;

    // Transition to StartScene with config
    this.scene.start('StartScene', { config });
  }
}
