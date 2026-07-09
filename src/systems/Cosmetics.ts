import { Preferences } from '@capacitor/preferences';

/**
 * Cosmetics — owned/equipped skins & trails (Preferences persistence)
 */

export interface Skin {
  id: string;
  name: string;
  glowColor: string; // Replaces accent color
  cost: number;
  unlocked: boolean;
}

export interface Trail {
  id: string;
  name: string;
  cost: number;
  unlocked: boolean;
}

export class Cosmetics {
  public skins: Skin[] = [
    { id: 'cyan', name: 'Cyan', glowColor: '#7fe4e4', cost: 0, unlocked: true },
    { id: 'pink', name: 'Pink', glowColor: '#ff7fb3', cost: 100, unlocked: false },
    { id: 'lime', name: 'Lime', glowColor: '#b3ff7f', cost: 100, unlocked: false },
    { id: 'amber', name: 'Amber', glowColor: '#ffb37f', cost: 150, unlocked: false },
    { id: 'violet', name: 'Violet', glowColor: '#b37fff', cost: 150, unlocked: false },
    { id: 'gold', name: 'Gold', glowColor: '#ffd700', cost: 200, unlocked: false },
  ];

  public trails: Trail[] = [
    { id: 'default', name: 'Default', cost: 0, unlocked: true },
    { id: 'thick', name: 'Thick', cost: 80, unlocked: false },
    { id: 'long', name: 'Long', cost: 80, unlocked: false },
    { id: 'sparkle', name: 'Sparkle', cost: 120, unlocked: false },
  ];

  public equippedSkin: string = 'cyan';
  public equippedTrail: string = 'default';

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    try {
      // Load unlocked skins
      const skinsResult = await Preferences.get({ key: 'unlockedSkins' });
      if (skinsResult.value) {
        const unlocked = JSON.parse(skinsResult.value);
        for (const skin of this.skins) {
          if (unlocked.includes(skin.id)) {
            skin.unlocked = true;
          }
        }
      }

      // Load unlocked trails
      const trailsResult = await Preferences.get({ key: 'unlockedTrails' });
      if (trailsResult.value) {
        const unlocked = JSON.parse(trailsResult.value);
        for (const trail of this.trails) {
          if (unlocked.includes(trail.id)) {
            trail.unlocked = true;
          }
        }
      }

      // Load equipped
      const equippedSkinResult = await Preferences.get({ key: 'equippedSkin' });
      if (equippedSkinResult.value) {
        this.equippedSkin = equippedSkinResult.value;
      }

      const equippedTrailResult = await Preferences.get({ key: 'equippedTrail' });
      if (equippedTrailResult.value) {
        this.equippedTrail = equippedTrailResult.value;
      }
    } catch (e) {
      // Web fallback
    }
  }

  public async save(): Promise<void> {
    try {
      // Save unlocked skins
      const unlockedSkins = this.skins.filter((s) => s.unlocked).map((s) => s.id);
      await Preferences.set({
        key: 'unlockedSkins',
        value: JSON.stringify(unlockedSkins),
      });

      // Save unlocked trails
      const unlockedTrails = this.trails.filter((t) => t.unlocked).map((t) => t.id);
      await Preferences.set({
        key: 'unlockedTrails',
        value: JSON.stringify(unlockedTrails),
      });

      // Save equipped
      await Preferences.set({ key: 'equippedSkin', value: this.equippedSkin });
      await Preferences.set({ key: 'equippedTrail', value: this.equippedTrail });
    } catch (e) {
      // Web fallback
    }
  }

  public unlock(type: 'skin' | 'trail', id: string): boolean {
    if (type === 'skin') {
      const skin = this.skins.find((s) => s.id === id);
      if (skin && !skin.unlocked) {
        skin.unlocked = true;
        this.save();
        return true;
      }
    } else {
      const trail = this.trails.find((t) => t.id === id);
      if (trail && !trail.unlocked) {
        trail.unlocked = true;
        this.save();
        return true;
      }
    }
    return false;
  }

  public equip(type: 'skin' | 'trail', id: string): void {
    if (type === 'skin') {
      const skin = this.skins.find((s) => s.id === id);
      if (skin && skin.unlocked) {
        this.equippedSkin = id;
        this.save();
      }
    } else {
      const trail = this.trails.find((t) => t.id === id);
      if (trail && trail.unlocked) {
        this.equippedTrail = id;
        this.save();
      }
    }
  }

  public getEquippedSkinColor(): string {
    const skin = this.skins.find((s) => s.id === this.equippedSkin);
    return skin ? skin.glowColor : '#7fe4e4';
  }
}
