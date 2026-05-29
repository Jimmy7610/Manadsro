import type { Household, Profile, Account, Transaction, Bill, Category, Budget, AppSettings } from '../../types/models';
import { DemoStorageAdapter } from '../adapters/demoStorageAdapter';
import {
  demoHousehold,
  demoProfiles,
  demoAccounts,
  demoTransactions,
  demoBills,
  demoCategories,
  demoBudgets,
} from '../../data/demo/demoData';

/**
 * Central datakälla för appen.
 * Build 1: Returnerar demo-data.
 * Framtida builds: Hämtar från IndexedDB/SQLite.
 *
 * INSTÄLLNING - Byt datakälla genom att ändra implementationen
 */

const storageAdapter = new DemoStorageAdapter();

export function getHousehold(): Household {
  return demoHousehold;
}

export function getProfiles(): Profile[] {
  return [...demoProfiles];
}

export function getAccounts(): Account[] {
  return [...demoAccounts];
}

export function getTransactions(): Transaction[] {
  return [...demoTransactions];
}

export function getBills(): Bill[] {
  return [...demoBills];
}

export function getCategories(): Category[] {
  return [...demoCategories];
}

export function getBudgets(): Budget[] {
  return [...demoBudgets];
}

export function getSettings(): AppSettings {
  return storageAdapter.getSettings();
}

export function saveSettings(settings: AppSettings): void {
  storageAdapter.saveSettings(settings);
}
