import type { Transaction, AppData, TransactionType } from '../../types/models';
import { getCategoryById } from '../categories/categoryService';

export interface TransactionFilterOptions {
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
  accountId?: string;
  categoryId?: string;
  profileId?: string;
  type?: string;
}

export function sortTransactionsByDate(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRecentTransactions(transactions: Transaction[], limit: number = 10): Transaction[] {
  return [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getTransactionsByAccount(transactions: Transaction[], accountId: string): Transaction[] {
  return transactions.filter(tx => tx.accountId === accountId);
}

export function filterTransactions(transactions: Transaction[], filters: TransactionFilterOptions, appData: AppData): Transaction[] {
  return transactions.filter(tx => {
    // Date from
    if (filters.dateFrom && tx.date.substring(0, 10) < filters.dateFrom) {
      return false;
    }
    // Date to
    if (filters.dateTo && tx.date.substring(0, 10) > filters.dateTo) {
      return false;
    }
    // Account
    if (filters.accountId && tx.accountId !== filters.accountId) {
      return false;
    }
    // Category
    if (filters.categoryId && tx.categoryId !== filters.categoryId) {
      return false;
    }
    // Profile
    if (filters.profileId && tx.profileId !== filters.profileId) {
      return false;
    }
    // Type
    if (filters.type && filters.type !== 'Alla') {
      if (filters.type === 'Inkomst' && tx.type !== 'income') return false;
      if (filters.type === 'Utgift' && tx.type !== 'expense') return false;
      if (filters.type === 'Räkning' && tx.type !== 'bill') return false;
      if (filters.type === 'Överföring' && tx.type !== 'transfer') return false;
      if (filters.type === 'Saldojustering' && tx.type !== 'balanceAdjustment') return false;
    }
    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const typeLabel = getTransactionTypeLabel(tx.type).toLowerCase();
      const account = appData.accounts.find(a => a.id === tx.accountId)?.name.toLowerCase() || '';
      const category = getCategoryById(appData.categories, tx.categoryId)?.name.toLowerCase() || '';
      const profile = appData.profiles.find(p => p.id === tx.profileId)?.name.toLowerCase() || '';

      const matches = 
        tx.description.toLowerCase().includes(q) ||
        (tx.comment && tx.comment.toLowerCase().includes(q)) ||
        Math.abs(tx.amount).toString().includes(q) ||
        account.includes(q) ||
        category.includes(q) ||
        profile.includes(q) ||
        typeLabel.includes(q);

      if (!matches) return false;
    }

    return true;
  });
}

export function searchTransactions(transactions: Transaction[], query: string, appData: AppData): Transaction[] {
  return filterTransactions(transactions, { searchQuery: query }, appData);
}

export function getTransactionTypeLabel(type: TransactionType): string {
  switch (type) {
    case 'income': return 'Inkomst';
    case 'expense': return 'Köp';
    case 'bill': return 'Räkning';
    case 'transfer': return 'Överföring';
    case 'balanceAdjustment': return 'Saldojustering';
    default: return 'Transaktion';
  }
}

export function getTransactionAmountSign(tx: Transaction): string {
  if (tx.type === 'transfer' || tx.type === 'balanceAdjustment') {
    return tx.amount > 0 ? '+' : tx.amount < 0 ? '-' : '';
  }
  if (tx.amount > 0 && tx.type !== 'expense' && tx.type !== 'bill') {
    return '+';
  }
  return '';
}

export function getTransactionDisplay(tx: Transaction, appData: AppData) {
  const account = appData.accounts.find(a => a.id === tx.accountId);
  const category = getCategoryById(appData.categories, tx.categoryId);
  const profile = appData.profiles.find(p => p.id === tx.profileId);

  return {
    accountName: account ? account.name : 'Okänt konto',
    categoryName: category ? category.name : '',
    categoryEmoji: category ? category.emoji : '',
    profileName: profile ? profile.name : '',
    typeLabel: getTransactionTypeLabel(tx.type),
    sign: getTransactionAmountSign(tx)
  };
}
