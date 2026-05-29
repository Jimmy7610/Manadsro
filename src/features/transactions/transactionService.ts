import type { Transaction } from '../../types/models';

export function getRecentTransactions(transactions: Transaction[], limit: number = 10): Transaction[] {
  return [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getTransactionsByAccount(transactions: Transaction[], accountId: string): Transaction[] {
  return transactions.filter(tx => tx.accountId === accountId);
}
