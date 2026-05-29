import type { AppSettings } from '../../types/models';

/**
 * Abstrakt gränssnitt för datalagring.
 * Build 1 använder bara demo-data.
 * Kan bytas ut mot IndexedDB eller SQLite (via Tauri) i framtiden.
 *
 * INSTÄLLNING - Byt adapter för att använda annan lagring
 */
export interface StorageAdapter {
  getSettings(): AppSettings;
  saveSettings(settings: AppSettings): void;
}
