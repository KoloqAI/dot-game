import type { GameConfig } from '../config';
import type { ZoneState, ZoneType } from '../types';

/**
 * ZoneManager — zone gating, quotas, transition state machine
 */
export class ZoneManager {
  private config: GameConfig;

  public currentZone: ZoneState;
  public isTransitioning: boolean = false;
  public transitionProgress: number = 0; // 0 to 1

  constructor(config: GameConfig) {
    this.config = config;

    // Start at Zone 0 (Drift)
    this.currentZone = {
      index: 0,
      loop: 0,
      cleared: 0,
      quota: config.zones.quotas[0],
      type: 'Drift' as ZoneType,
      name: 'Drift',
      hint: config.zones.hints[0],
    };
  }

  /**
   * Record an obstacle cleared
   */
  recordCleared(): void {
    if (!this.isTransitioning) {
      this.currentZone.cleared++;
    }
  }

  /**
   * Check if zone is complete
   */
  isZoneComplete(): boolean {
    return this.currentZone.cleared >= this.currentZone.quota;
  }

  /**
   * Start zone transition
   */
  startTransition(): void {
    this.isTransitioning = true;
    this.transitionProgress = 0;
  }

  /**
   * Update transition progress
   */
  updateTransition(dt: number): void {
    if (this.isTransitioning) {
      this.transitionProgress += dt / 4.0; // 4 second transition

      if (this.transitionProgress >= 1) {
        this.completeTransition();
      }
    }
  }

  /**
   * Complete transition and advance to next zone
   */
  completeTransition(): void {
    this.isTransitioning = false;
    this.transitionProgress = 0;

    // Advance zone
    const nextIndex = (this.currentZone.index + 1) % 3;
    const nextLoop = nextIndex === 0 ? this.currentZone.loop + 1 : this.currentZone.loop;

    const quota = this.config.zones.quotas[nextIndex] + nextLoop * this.config.zones.quotaLoopStep;

    this.currentZone = {
      index: nextIndex,
      loop: nextLoop,
      cleared: 0,
      quota,
      type: this.config.zones.names[nextIndex] as ZoneType,
      name: this.getZoneName(nextIndex, nextLoop),
      hint: this.config.zones.hints[nextIndex],
    };
  }

  private getZoneName(index: number, loop: number): string {
    const baseName = this.config.zones.names[index];
    if (loop === 0) return baseName;

    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    const suffix = loop < roman.length ? roman[loop] : `${loop + 1}`;

    return `${baseName} ${suffix}`;
  }

  /**
   * Get current obstacle type for this zone
   */
  getObstacleType(): 'static' | 'bounce' | 'moving' {
    switch (this.currentZone.index) {
      case 0: // Drift
        return 'static';
      case 1: // Weave
        return 'bounce';
      case 2: // Pulse
        return Math.random() > 0.3 ? 'moving' : 'bounce'; // Mix moving + bounce
      default:
        return 'static';
    }
  }

  /**
   * Get base speed for current zone
   */
  getBaseSpeed(): number {
    const baseSpeed = this.config.speed.base + this.currentZone.loop * this.config.speed.perZoneBaseStep;
    return Math.min(baseSpeed, this.config.speed.perZoneBaseCap);
  }
}
