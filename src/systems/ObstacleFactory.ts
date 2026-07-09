import type { GameConfig } from '../config';
import type { Dot, Obstacle } from '../types';

/**
 * ObstacleFactory — generates dot-grid obstacle shapes
 * Shapes: rect, spike, dome, teeth, steps
 * Types: static, bounce (offset gates), moving (oscillating gap)
 */
export class ObstacleFactory {
  private config: GameConfig;
  private screenHeight: number;

  constructor(config: GameConfig, screenHeight: number) {
    this.config = config;
    this.screenHeight = screenHeight;
  }

  /**
   * Create a static single-gap obstacle
   */
  createStatic(worldX: number, gapCenter: number, gapSize: number, _loop: number): Obstacle {
    const shape = this.randomShape();
    const dots = this.buildSingleGate(gapCenter, gapSize, shape);

    return {
      worldX,
      dots,
      type: 'static',
      gapCenter,
      gapSize,
      passed: false,
    };
  }

  /**
   * Create bounce gate (2-3 thin walls with offset gaps)
   */
  createBounce(worldX: number, gapCenter: number, gapSize: number, loop: number): Obstacle {
    const gateCount = 2 + (Math.random() > 0.5 ? 1 : 0); // 2 or 3 gates
    const offset = this.config.obstacles.bounceOffset(loop);
    const wallThickness = this.config.obstacles.wallThicknessMulti;
    const spacing = wallThickness + this.config.obstacles.gateSpacing;

    const dots: Dot[] = [];

    for (let i = 0; i < gateCount; i++) {
      // Alternate offset: up, down, up
      const offsetDir = i % 2 === 0 ? 1 : -1;
      const thisGapCenter = gapCenter + offsetDir * offset;

      // Clamp to screen bounds
      const clampedGapCenter = Math.max(gapSize / 2, Math.min(this.screenHeight - gapSize / 2, thisGapCenter));

      const gateDots = this.buildWall(i * spacing, clampedGapCenter, gapSize, wallThickness);
      dots.push(...gateDots);
    }

    return {
      worldX,
      dots,
      type: 'bounce',
      gapCenter,
      gapSize,
      passed: false,
    };
  }

  /**
   * Create moving gap (oscillating vertically, padded walls)
   */
  createMoving(worldX: number, gapCenter: number, gapSize: number, loop: number): Obstacle {
    const amplitude = this.config.obstacles.movingAmplitude(loop);
    const wallThickness = this.config.obstacles.wallThicknessMoving;

    // Build padded walls (extend beyond screen)
    const dots = this.buildWall(0, gapCenter, gapSize, wallThickness, true);

    return {
      worldX,
      dots,
      type: 'moving',
      gapCenter,
      gapSize,
      passed: false,
      movingPhase: Math.random() * Math.PI * 2, // Random start phase
      movingAmplitude: amplitude,
    };
  }

  /**
   * Build a single wall with a gap
   */
  private buildWall(
    offsetX: number,
    gapCenter: number,
    gapSize: number,
    thickness: number,
    padded = false
  ): Dot[] {
    const dots: Dot[] = [];
    const spacing = this.config.obstacles.dotGridSpacing;
    const dotRadiusMin = this.config.obstacles.dotRadiusMin;
    const dotRadiusMax = this.config.obstacles.dotRadiusMax;

    const topEnd = gapCenter - gapSize / 2;
    const bottomStart = gapCenter + gapSize / 2;

    const startY = padded ? -spacing * 5 : 0;
    const endY = padded ? this.screenHeight + spacing * 5 : this.screenHeight;

    // Top section
    for (let y = startY; y < topEnd; y += spacing) {
      for (let x = 0; x < thickness; x += spacing) {
        dots.push({
          x: offsetX + x,
          y,
          radius: dotRadiusMin + Math.random() * (dotRadiusMax - dotRadiusMin),
        });
      }
    }

    // Bottom section
    for (let y = bottomStart; y < endY; y += spacing) {
      for (let x = 0; x < thickness; x += spacing) {
        dots.push({
          x: offsetX + x,
          y,
          radius: dotRadiusMin + Math.random() * (dotRadiusMax - dotRadiusMin),
        });
      }
    }

    return dots;
  }

  /**
   * Build a single gate with shaped edges
   */
  private buildSingleGate(gapCenter: number, gapSize: number, shape: string): Dot[] {
    const dots: Dot[] = [];
    const spacing = this.config.obstacles.dotGridSpacing;
    const dotRadiusMin = this.config.obstacles.dotRadiusMin;
    const dotRadiusMax = this.config.obstacles.dotRadiusMax;
    const thickness = this.config.obstacles.wallThicknessSingle.min +
                      Math.random() * (this.config.obstacles.wallThicknessSingle.max - this.config.obstacles.wallThicknessSingle.min);

    const topEnd = gapCenter - gapSize / 2;
    const bottomStart = gapCenter + gapSize / 2;

    // Top section
    for (let y = 0; y < topEnd; y += spacing) {
      const edge = this.getShapeEdge(shape, y, topEnd, true);
      for (let x = 0; x < thickness + edge; x += spacing) {
        dots.push({
          x,
          y,
          radius: dotRadiusMin + Math.random() * (dotRadiusMax - dotRadiusMin),
        });
      }
    }

    // Bottom section
    for (let y = bottomStart; y < this.screenHeight; y += spacing) {
      const edge = this.getShapeEdge(shape, y - bottomStart, this.screenHeight - bottomStart, false);
      for (let x = 0; x < thickness + edge; x += spacing) {
        dots.push({
          x,
          y,
          radius: dotRadiusMin + Math.random() * (dotRadiusMax - dotRadiusMin),
        });
      }
    }

    return dots;
  }

  /**
   * Get edge offset for shaped gap (rect, spike, dome, teeth, steps)
   */
  private getShapeEdge(shape: string, y: number, height: number, isTop: boolean): number {
    const t = y / height; // 0 to 1

    switch (shape) {
      case 'spike': {
        // Triangle into gap
        const spike = isTop ? (1 - t) * 30 : t * 30;
        return spike;
      }
      case 'dome': {
        // Rounded bulge
        const dome = Math.sin(t * Math.PI) * 20;
        return dome;
      }
      case 'teeth': {
        // Comb pattern
        const teeth = Math.sin(t * Math.PI * 8) * 10;
        return Math.max(0, teeth);
      }
      case 'steps': {
        // Staircase
        const step = Math.floor(t * 4) * 10;
        return step;
      }
      case 'rect':
      default:
        return 0;
    }
  }

  private randomShape(): string {
    const shapes = ['rect', 'spike', 'dome', 'teeth', 'steps'];
    return shapes[Math.floor(Math.random() * shapes.length)];
  }
}
