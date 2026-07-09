import { Preferences } from '@capacitor/preferences';
import type { GameConfig } from '../config';

/**
 * Audio — synth SFX + mute toggle with persistence
 */
export class Audio {
  private config: GameConfig;
  private audioContext: AudioContext | null = null;
  public muted: boolean = false;

  constructor(config: GameConfig) {
    this.config = config;
    this.loadMuteSetting();
  }

  private async loadMuteSetting(): Promise<void> {
    try {
      const result = await Preferences.get({ key: 'muted' });
      if (result.value) {
        this.muted = result.value === 'true';
      }
    } catch (e) {
      // Web fallback
    }
  }

  public async saveMuteSetting(): Promise<void> {
    try {
      await Preferences.set({
        key: 'muted',
        value: this.muted.toString(),
      });
    } catch (e) {
      // Web fallback
    }
  }

  public toggleMute(): void {
    this.muted = !this.muted;
    this.saveMuteSetting();
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('AudioContext not supported');
        return null;
      }
    }

    return this.audioContext;
  }

  /**
   * Play synth tone (startHz, endHz, duration, gain)
   */
  private playSynth(startHz: number, endHz: number, duration: number, gain: number): void {
    if (this.muted) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Oscillator
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startHz, now);
      osc.frequency.exponentialRampToValueAtTime(endHz, now + duration);

      // Gain envelope
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(gain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  }

  /**
   * Play flap sound (not in tuning.md, using a short chirp)
   */
  playFlap(): void {
    this.playSynth(400, 500, 0.08, 0.08);
  }

  /**
   * Play collect sound
   */
  playCollect(): void {
    const { start, end, duration, gain } = this.config.audio.collect;
    this.playSynth(start, end, duration, gain);
  }

  /**
   * Play zone clear sound
   */
  playZoneClear(): void {
    const { start, end, duration, gain } = this.config.audio.zoneClear;
    this.playSynth(start, end, duration, gain);
  }

  /**
   * Play death thud
   */
  playDeathThud(): void {
    const { start, end, duration, gain } = this.config.audio.deathThud;
    this.playSynth(start, end, duration, gain);
  }

  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
