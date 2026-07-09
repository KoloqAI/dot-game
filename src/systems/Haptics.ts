import { Haptics as CapHaptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Haptics — @capacitor/haptics wrapper (no-op on web)
 */
export class Haptics {
  /**
   * Light haptic (tap, collect)
   */
  static async light(): Promise<void> {
    try {
      await CapHaptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Web fallback — no-op
    }
  }

  /**
   * Medium haptic
   */
  static async medium(): Promise<void> {
    try {
      await CapHaptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Web fallback
    }
  }

  /**
   * Heavy haptic (death)
   */
  static async heavy(): Promise<void> {
    try {
      await CapHaptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      // Web fallback
    }
  }
}
