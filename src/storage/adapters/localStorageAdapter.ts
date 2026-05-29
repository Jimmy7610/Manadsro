import type { AppData } from '../../types/models';
import {
  demoHousehold,
  demoProfiles,
  demoAccounts,
  demoTransactions,
  demoBills,
  demoCategories,
  demoBudgets,
  demoSettings
} from '../../data/demo/demoData';

const STORAGE_KEY = 'manadsro.appData.v1';

export class LocalStorageAdapter {
  /**
   * Laddar data från localStorage, annars returneras demo-data som standard.
   */
  public loadData(): AppData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as AppData;
      }
    } catch (e) {
      console.error('Kunde inte ladda data från localStorage', e);
    }
    
    // Fallback till demo-data för Build 3
    return this.getDefaultData();
  }

  /**
   * Sparar hela appens state till localStorage
   */
  public saveData(data: AppData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Kunde inte spara data till localStorage', e);
    }
  }

  /**
   * Raderar lokal data
   */
  public clearData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Kunde inte rensa localStorage', e);
    }
  }

  /**
   * Skapar en default-struktur baserad på demo-data
   */
  public getDefaultData(): AppData {
    return {
      household: { ...demoHousehold },
      profiles: [...demoProfiles],
      accounts: [...demoAccounts],
      transactions: [...demoTransactions],
      bills: [...demoBills],
      categories: [...demoCategories],
      budgets: [...demoBudgets],
      settings: { ...demoSettings, buildNumber: 3, dataMode: 'local' }
    };
  }
}
