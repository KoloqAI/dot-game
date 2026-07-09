import Phaser from 'phaser';
import type { GameConfig } from '../config';
import { Player } from '../systems/Player';
import { Background } from '../systems/Background';
import { ObstacleManager } from '../systems/ObstacleManager';
import { ZoneManager } from '../systems/ZoneManager';
import { MoteManager } from '../systems/MoteManager';
import { Fx } from '../systems/Fx';
import { Audio } from '../systems/Audio';
import { Haptics } from '../systems/Haptics';
import { Cosmetics } from '../systems/Cosmetics';

/**
 * GameScene — main run loop with all systems integrated
 */
export class GameScene extends Phaser.Scene {
  private config!: GameConfig;

  // Systems
  private player!: Player;
  private background!: Background;
  private obstacleManager!: ObstacleManager;
  private zoneManager!: ZoneManager;
  private moteManager!: MoteManager;
  private fx!: Fx;
  private audio!: Audio;
  private cosmetics!: Cosmetics;

  // Game state
  private speed: number = 0;
  private zoneScroll: number = 0;
  private bestScore: number = 0;
  private isDead: boolean = false;
  private hitStopTimer: number = 0;

  // HUD
  private scoreText!: Phaser.GameObjects.Text;
  private motesText!: Phaser.GameObjects.Text;
  private zoneText!: Phaser.GameObjects.Text;
  private muteButton!: Phaser.GameObjects.Text;

  // Transition state
  private transitionState: 'none' | 'clearing' | 'flourish' | 'nextCard' | 'resuming' = 'none';
  private transitionTimer: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  async create(data: { config: GameConfig }) {
    this.config = data.config;

    // Load cosmetics and apply
    this.cosmetics = new Cosmetics();
    await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for async load

    // Override accent color with equipped skin
    this.config.colors.accent = this.cosmetics.getEquippedSkinColor();
    this.config.colors.playerGlow = this.cosmetics.getEquippedSkinColor();

    // Dark background
    this.cameras.main.setBackgroundColor(this.config.colors.bgVignetteCenter);

    // Load best score
    await this.loadBestScore();

    // Initialize systems
    this.background = new Background(this, this.config);
    this.player = new Player(this, this.config);
    this.obstacleManager = new ObstacleManager(this, this.config);
    this.zoneManager = new ZoneManager(this.config);
    this.moteManager = new MoteManager(this, this.config);
    this.fx = new Fx(this, this.config);
    this.audio = new Audio(this.config);

    // Set initial obstacle type
    this.obstacleManager.setObstacleType(
      this.zoneManager.getObstacleType(),
      this.zoneManager.currentZone.loop
    );

    // Set initial speed
    this.speed = this.zoneManager.getBaseSpeed();

    // Create HUD
    this.createHUD();

    // Input
    this.input.on('pointerdown', () => this.handleInput());
    this.input.keyboard?.on('keydown-SPACE', () => this.handleInput());
  }

  private async loadBestScore(): Promise<void> {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const result = await Preferences.get({ key: 'bestScore' });
      if (result.value) {
        this.bestScore = parseInt(result.value, 10);
      }
    } catch (e) {
      // Web fallback
    }
  }

  private async saveBestScore(): Promise<void> {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({
        key: 'bestScore',
        value: this.player.score.toString(),
      });
    } catch (e) {
      // Web fallback
    }
  }

  private createHUD(): void {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    // Score (top-left)
    this.scoreText = this.add
      .text(20, 40, '0', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '32px',
        color: this.config.colors.uiText,
        fontStyle: 'bold',
      })
      .setDepth(100);

    // Motes (top-right)
    this.motesText = this.add
      .text(W - 20, 40, '0', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '24px',
        color: this.config.colors.accent,
      })
      .setOrigin(1, 0)
      .setDepth(100);

    // Zone label (top-center)
    this.zoneText = this.add
      .text(W / 2, 40, 'Zone 1 · Drift', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '16px',
        color: this.config.colors.dust,
      })
      .setOrigin(0.5, 0)
      .setDepth(100);

    // Mute button (bottom-right)
    this.muteButton = this.add
      .text(W - 20, H - 40, this.audio.muted ? '🔇' : '🔊', {
        fontSize: '24px',
      })
      .setOrigin(1, 1)
      .setDepth(100)
      .setInteractive()
      .on('pointerdown', () => {
        this.audio.toggleMute();
        this.muteButton.setText(this.audio.muted ? '🔇' : '🔊');
      });
  }

  private handleInput(): void {
    if (this.isDead) return;
    if (this.transitionState !== 'none') return;

    this.player.flap();
    this.audio.playFlap();
    Haptics.light();
  }

  update(_time: number, delta: number): void {
    // Clamp delta to 50ms (handles backgrounding)
    const dt = Math.min(delta / 1000, 0.05);

    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= dt;
      return; // Freeze during hit-stop
    }

    if (this.isDead) {
      // Update death effects
      this.fx.update(dt);
      this.fx.render();
      return;
    }

    // Handle zone transitions
    if (this.transitionState !== 'none') {
      this.updateTransition(dt);
      return;
    }

    // Update player
    this.player.update(dt);

    // Check floor collision
    if (this.player.hitFloor()) {
      this.triggerDeath();
      return;
    }

    // Update background
    this.background.update(this.speed, dt);

    // Update obstacles
    this.obstacleManager.update(this.speed, dt, this.zoneScroll);

    // Update speed (sawtooth ramp within zone)
    this.zoneScroll += this.speed * dt;
    const targetSpeed = Math.min(
      this.zoneManager.getBaseSpeed() + this.zoneScroll * this.config.speed.rampCoefficient,
      this.config.speed.max
    );
    this.speed += (targetSpeed - this.speed) * 0.05;

    // Check obstacle collision
    if (
      this.obstacleManager.checkCollision(
        this.player.x,
        this.player.y,
        this.player.collisionRadius
      )
    ) {
      this.triggerDeath();
      return;
    }

    // Check obstacle passed (scoring)
    const newScore = this.obstacleManager.checkPassed(this.player.x);
    if (newScore > 0) {
      this.player.score += newScore;
      this.zoneManager.recordCleared();

      // Try spawn mote
      const lastObstacle = this.obstacleManager.obstacles[this.obstacleManager.obstacles.length - 1];
      if (lastObstacle) {
        this.moteManager.trySpawn(
          lastObstacle.worldX,
          lastObstacle.gapCenter,
          this.zoneManager.currentZone.index,
          this.obstacleManager.scroll
        );
      }
    }

    // Update motes
    this.moteManager.update(
      this.obstacleManager.scroll,
      this.player.x,
      this.player.y,
      this.player.collisionRadius
    );

    // Check if zone complete
    if (this.zoneManager.isZoneComplete() && this.transitionState === 'none') {
      this.startZoneTransition();
    }

    // Update FX
    this.fx.update(dt);

    // Apply camera shake
    const shake = this.fx.getShakeOffset();
    this.cameras.main.setScroll(shake.x, shake.y);

    // Render
    this.background.render();
    this.obstacleManager.render();
    this.moteManager.render(this.obstacleManager.scroll);
    this.player.render();
    this.fx.render();

    // Update HUD
    this.scoreText.setText(this.player.score.toString());
    this.motesText.setText(this.moteManager.runMotes.toString());
    this.zoneText.setText(
      `Zone ${this.zoneManager.currentZone.loop + 1} · ${this.zoneManager.currentZone.name}`
    );
  }

  private startZoneTransition(): void {
    this.transitionState = 'clearing';
    this.transitionTimer = 0;

    // Play zone clear sound
    this.audio.playZoneClear();

    // Add zone bonus motes
    this.moteManager.addZoneBonus(this.zoneManager.currentZone.index);
  }

  private updateTransition(dt: number): void {
    this.transitionTimer += dt;

    switch (this.transitionState) {
      case 'clearing':
        // Slow down, clear obstacles
        this.speed = this.config.speed.transitionDrift;
        this.obstacleManager.clear();
        this.moteManager.clear();

        if (this.transitionTimer > 1.0) {
          this.transitionState = 'flourish';
          this.transitionTimer = 0;
        }
        break;

      case 'flourish':
        // Show "Zone N Cleared" + mote bonus
        // (Simplified: just wait)
        if (this.transitionTimer > 1.5) {
          this.transitionState = 'nextCard';
          this.transitionTimer = 0;
        }
        break;

      case 'nextCard':
        // Show "Zone N+1 — Name" + hint
        if (this.transitionTimer > 1.5) {
          this.transitionState = 'resuming';
          this.transitionTimer = 0;

          // Advance zone
          this.zoneManager.startTransition();
          this.zoneManager.completeTransition();

          // Update obstacle type and speed
          this.obstacleManager.setObstacleType(
            this.zoneManager.getObstacleType(),
            this.zoneManager.currentZone.loop
          );
          this.speed = this.zoneManager.getBaseSpeed();
          this.zoneScroll = 0;
        }
        break;

      case 'resuming':
        if (this.transitionTimer > 0.5) {
          this.transitionState = 'none';
        }
        break;
    }

    // Continue updating background and player during transition
    this.background.update(this.speed, dt);
    this.player.update(dt);

    // Render
    this.background.render();
    this.player.render();
  }

  private triggerDeath(): void {
    this.isDead = true;
    this.hitStopTimer = this.config.fx.hitStop;

    // Trigger shatter
    this.fx.shatter(this.player.x, this.player.y, this.player.radius);

    // Audio and haptic
    this.audio.playDeathThud();
    Haptics.heavy();

    // Save motes and best score
    this.moteManager.saveLifetimeMotes();

    if (this.player.score > this.bestScore) {
      this.bestScore = this.player.score;
      this.saveBestScore();
    }

    // Transition to Game Over after delay
    this.time.delayedCall(this.config.fx.deathToCard * 1000, () => {
      this.scene.start('GameOverScene', {
        config: this.config,
        score: this.player.score,
        bestScore: this.bestScore,
        motes: this.moteManager.runMotes,
        lifetimeMotes: this.moteManager.lifetimeMotes,
        zone: this.zoneManager.currentZone.loop + 1,
      });
    });
  }

  shutdown(): void {
    // Clean up
    this.player?.destroy();
    this.background?.destroy();
    this.obstacleManager?.destroy();
    this.moteManager?.destroy();
    this.fx?.destroy();
    this.audio?.destroy();
  }
}
