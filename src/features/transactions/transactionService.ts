import { getTransactions } from '../../storage/services/appDataService';
import type { Transaction } from '../../types/models';

export function getRecentTransactions(limit: number = 10): Transaction[] {
  return [...getTransactions()]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getTransactionsByAccount(accountId: string): Transaction[] {
  return getTransactions().filter(tx => tx.accountId === accountId);
}
