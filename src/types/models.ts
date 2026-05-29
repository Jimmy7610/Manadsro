// src/types/models.ts
// Månadsro – Datamodeller (Build 1)

export type TransactionType = 'income' | 'expense' | 'bill' | 'transfer' | 'balanceAdjustment';
export type BillStatus = 'planned' | 'unpaid' | 'paid' | 'overdue' | 'skipped';
export type AccountType = 'checking' | 'savings' | 'buffer' | 'shared' | 'other';
export type ThemeMode = 'light' | 'dark';

export interface Household {
  id: string;
  name: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  householdId: string;
  name: string;
  emoji: string; // INSTÄLLNING - Emoji som visas för profilen
  color: string; // INSTÄLLNING - Färg kopplad till profilen
  isShared: boolean; // true för 'Gemensamt'
}

export interface Account {
  id: string;
  householdId: string;
  profileId: string;
  name: string;
  type: AccountType;
  initialBalance: number; // INSTÄLLNING - Startsaldo vid skapande
  currency: string; // INSTÄLLNING - Valuta, standard 'SEK'
  sortOrder: number;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  householdId: string;
  accountId: string;
  profileId: string;
  type: TransactionType;
  categoryId: string;
  amount: number; // Positiv för inkomst, negativ för utgift
  description: string;
  date: string; // ISO date string
  linkedTransferId?: string; // Kopplad transaktion vid överföring
  isRecurring: boolean;
  tags: string[];
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Bill {
  id: string;
  householdId: string;
  accountId: string;
  profileId: string;
  categoryId: string;
  name: string;
  amount: number;
  dueDate: string; // ISO date string
  status: BillStatus;
  isRecurring: boolean;
  recurrenceInterval?: 'monthly' | 'quarterly' | 'yearly';
}

export interface Category {
  id: string;
  householdId: string;
  name: string;
  emoji: string;
  color: string;
  sortOrder: number;
  isDefault: boolean;
}

export interface Budget {
  id: string;
  householdId: string;
  categoryId: string;
  profileId: string;
  monthlyLimit: number; // INSTÄLLNING - Budgetgräns per månad
  month: string; // Format: 'YYYY-MM'
}

export interface AppSettings {
  theme: ThemeMode;
  currency: string; // INSTÄLLNING - Standardvaluta
  locale: string; // INSTÄLLNING - Språk/locale
  householdId: string;
  activeProfileId: string;
  buildNumber: number; // INSTÄLLNING - Aktuellt buildnummer
  dataMode?: 'demo' | 'local'; // INSTÄLLNING - Datakälla
}

export interface AppData {
  household: Household;
  profiles: Profile[];
  accounts: Account[];
  transactions: Transaction[];
  bills: Bill[];
  categories: Category[];
  budgets: Budget[];
  settings: AppSettings;
}
