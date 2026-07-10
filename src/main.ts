import Phaser from 'phaser';
import { createConfig, rescaleConfig } from './config';
import { BootScene } from './scenes/BootScene';
import { StartScene } from './scenes/StartScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { LockerScene } from './scenes/LockerScene';
import './style.css';

/**
 * Main entry point — bootstrap Phaser game
 */

// Get screen dimensions
const W = window.innerWidth;
const H = window.innerHeight;

// Create config scaled to screen
const config = createConfig(W, H);

// Phaser game config
const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  backgroundColor: config.colors.bgVignetteCenter,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: W,
    height: H,
  },
  render: {
    pixelArt: false,
    antialias: true,
    transparent: false,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // Custom physics, not using Arcade gravity
      debug: false,
    },
  },
  scene: [BootScene, StartScene, GameScene, GameOverScene, LockerScene],
};

// Create game instance
const game = new Phaser.Game(gameConfig);

// Pass config to first scene
game.scene.start('BootScene');
// Config will be passed through scene transitions

// Store config globally for scenes to access
(window as any).__GAME_CONFIG__ = config;

// Rescale shared config on every viewport resize (scenes read the same object)
game.scale.on('resize', (size: Phaser.Structs.Size) => {
  rescaleConfig(config, size.width, size.height);
});

// Pause on blur, resume on focus
window.addEventListener('blur', () => {
  game.pause();
});

window.addEventListener('focus', () => {
  game.resume();
});
