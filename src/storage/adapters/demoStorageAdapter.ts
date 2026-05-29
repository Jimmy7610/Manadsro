import type { StorageAdapter } from './storageAdapter';
import type { AppSettings } from '../../types/models';
import { demoSettings } from '../../data/demo/demoData';

/**
 * Demo-adapter som returnerar hårdkodad demodata.
 * Sparar inställningar i localStorage om tillgängligt.
 *
 * INSTÄLLNING - Byt till riktig adapter i framtida builds
 */
export class DemoStorageAdapter implements StorageAdapter {
  private settings: AppSettings;

  constructor() {
    const stored = localStorage.getItem('manadsro-settings');
    this.settings = stored ? JSON.parse(stored) : { ...demoSettings };
  }

  getSettings(): AppSettings {
    return { ...this.settings };
  }

  saveSettings(settings: AppSettings): void {
    this.settings = { ...settings };
    localStorage.setItem('manadsro-settings', JSON.stringify(this.settings));
  }
}
