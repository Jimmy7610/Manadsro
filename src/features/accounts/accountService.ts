import { calculateAccountBalance } from '../../shared/utils/calculations';
import type { Account, Transaction } from '../../types/models';

export function getAccountWithBalance(accountId: string, accounts: Account[], transactions: Transaction[]): { account: Account; balance: number } | null {
  const account = accounts.find(a => a.id === accountId);
  if (!account) return null;
  const balance = calculateAccountBalance(accountId, accounts, transactions);
  return { account, balance };
}

export function getAllAccountsWithBalances(accounts: Account[], transactions: Transaction[]): Array<{ account: Account; balance: number }> {
  return accounts
    .filter(a => a.isActive)
    .map(account => ({
      account,
      balance: calculateAccountBalance(account.id, accounts, transactions),
    }));
}
