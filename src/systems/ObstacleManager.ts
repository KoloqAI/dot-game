import Phaser from 'phaser';
import type { GameConfig } from '../config';
import type { Obstacle } from '../types';
import { ObstacleFactory } from './ObstacleFactory';

/**
 * ObstacleManager — world-coord spawning, pooling, movement, collision, scoring
 */
export class ObstacleManager {
  private scene: Phaser.Scene;
  private config: GameConfig;
  private factory: ObstacleFactory;

  public obstacles: Obstacle[] = [];
  private graphicsPool: Phaser.GameObjects.Graphics[] = [];

  public scroll: number = 0;
  private nextWorldX: number = 800; // First obstacle spawn

  private obstacleType: 'static' | 'bounce' | 'moving' = 'static';
  private loop: number = 0;

  constructor(scene: Phaser.Scene, config: GameConfig) {
    this.scene = scene;
    this.config = config;
    this.factory = new ObstacleFactory(config, scene.cameras.main.height);
  }

  /**
   * Set obstacle type based on zone
   */
  setObstacleType(type: 'static' | 'bounce' | 'moving', loop: number): void {
    this.obstacleType = type;
    this.loop = loop;
  }

  /**
   * Update obstacles, spawn new ones
   */
  update(speed: number, dt: number, zoneScroll: number): void {
    const W = this.scene.cameras.main.width;

    // Update scroll
    this.scroll += speed * dt;

    // Update moving obstacles
    for (const obstacle of this.obstacles) {
      if (obstacle.type === 'moving' && obstacle.movingPhase !== undefined) {
        obstacle.movingPhase += dt * 2; // Oscillation speed
      }
    }

    // Remove off-screen obstacles
    this.obstacles = this.obstacles.filter((obs) => {
      const screenX = obs.worldX - this.scroll;
      if (screenX < -200) {
        // Recycle graphics
        for (const dot of obs.dots) {
          if (dot.graphics) {
            dot.graphics.clear();
            this.graphicsPool.push(dot.graphics);
            dot.graphics = undefined;
          }
        }
        return false;
      }
      return true;
    });

    // Spawn new obstacle if needed
    if (this.nextWorldX - this.scroll < W + 120) {
      this.spawnObstacle(zoneScroll);
    }
  }

  private spawnObstacle(zoneScroll: number): void {
    const H = this.scene.cameras.main.height;

    // Calculate gap size
    let baseGap = this.config.obstacles.baseGap(this.loop);
    if (this.obstacleType === 'bounce') {
      baseGap += this.config.obstacles.gapBonusBounce;
    } else if (this.obstacleType === 'moving') {
      baseGap += this.config.obstacles.gapBonusMoving;
    }

    // Random gap center
    const gapCenter = baseGap / 2 + Math.random() * (H - baseGap);

    // Create obstacle based on type
    let obstacle: Obstacle;
    switch (this.obstacleType) {
      case 'bounce':
        obstacle = this.factory.createBounce(this.nextWorldX, gapCenter, baseGap, this.loop);
        break;
      case 'moving':
        obstacle = this.factory.createMoving(this.nextWorldX, gapCenter, baseGap, this.loop);
        break;
      case 'static':
      default:
        obstacle = this.factory.createStatic(this.nextWorldX, gapCenter, baseGap, this.loop);
        break;
    }

    this.obstacles.push(obstacle);

    // Update next spawn position
    const spacing = this.config.obstacles.betweenObstacles(zoneScroll);
    this.nextWorldX += spacing;
  }

  /**
   * Check collision with player
   */
  checkCollision(playerX: number, playerY: number, playerRadius: number): boolean {
    for (const obstacle of this.obstacles) {
      const screenX = obstacle.worldX - this.scroll;

      // Only check obstacles near player
      if (Math.abs(screenX - playerX) > 80) continue;

      // Get current gap center for moving obstacles
      let currentGapCenter = obstacle.gapCenter;
      if (obstacle.type === 'moving' && obstacle.movingPhase !== undefined && obstacle.movingAmplitude !== undefined) {
        const offset = Math.sin(obstacle.movingPhase) * obstacle.movingAmplitude;
        currentGapCenter += offset;
      }

      // Check each dot
      for (const dot of obstacle.dots) {
        let dotScreenY = dot.y;

        // Apply moving offset to dot Y
        if (obstacle.type === 'moving' && obstacle.movingPhase !== undefined && obstacle.movingAmplitude !== undefined) {
          const offset = Math.sin(obstacle.movingPhase) * obstacle.movingAmplitude;
          dotScreenY += offset;
        }

        const dotScreenX = screenX + dot.x;

        // Circle-circle collision (distance squared)
        const dx = playerX - dotScreenX;
        const dy = playerY - dotScreenY;
        const distSq = dx * dx + dy * dy;
        const radiusSumSq = (playerRadius + dot.radius) * (playerRadius + dot.radius);

        if (distSq < radiusSumSq) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if player passed an obstacle (for scoring)
   */
  checkPassed(playerX: number): number {
    let newScore = 0;

    for (const obstacle of this.obstacles) {
      if (!obstacle.passed) {
        const screenX = obstacle.worldX - this.scroll;
        if (screenX + 50 < playerX) {
          obstacle.passed = true;
          newScore++;
        }
      }
    }

    return newScore;
  }

  /**
   * Render all obstacles
   */
  render(): void {
    const obstacleColor = parseInt(this.config.colors.obstacle.replace('#', '0x'));

    for (const obstacle of this.obstacles) {
      const screenX = obstacle.worldX - this.scroll;

      // Get current gap center for moving obstacles
      let currentGapCenter = obstacle.gapCenter;
      if (obstacle.type === 'moving' && obstacle.movingPhase !== undefined && obstacle.movingAmplitude !== undefined) {
        const offset = Math.sin(obstacle.movingPhase) * obstacle.movingAmplitude;
        currentGapCenter += offset;
      }

      for (const dot of obstacle.dots) {
        let dotScreenY = dot.y;

        // Apply moving offset
        if (obstacle.type === 'moving' && obstacle.movingPhase !== undefined && obstacle.movingAmplitude !== undefined) {
          const offset = Math.sin(obstacle.movingPhase) * obstacle.movingAmplitude;
          dotScreenY += offset;
        }

        const dotScreenX = screenX + dot.x;

        // Get or create graphics
        if (!dot.graphics) {
          dot.graphics = this.graphicsPool.pop() || this.scene.add.graphics();
        }

        dot.graphics.clear();
        dot.graphics.fillStyle(obstacleColor, 1);
        dot.graphics.fillCircle(dotScreenX, dotScreenY, dot.radius);
      }
    }
  }

  /**
   * Clear all obstacles
   */
  clear(): void {
    for (const obstacle of this.obstacles) {
      for (const dot of obstacle.dots) {
        if (dot.graphics) {
          dot.graphics.clear();
          this.graphicsPool.push(dot.graphics);
          dot.graphics = undefined;
        }
      }
    }
    this.obstacles = [];
    this.nextWorldX = this.scroll + 800;
  }

  /**
   * Clear obstacles and reset spawn runway for new viewport height.
   */
  resize(newH: number): void {
    this.factory.setScreenHeight(newH);
    this.clear();

    const W = this.scene.cameras.main.width;
    this.nextWorldX = this.scroll + W + 120;
  }

  destroy(): void {
    this.clear();
    for (const graphics of this.graphicsPool) {
      graphics.destroy();
    }
  }
}
