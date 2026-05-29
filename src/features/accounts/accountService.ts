import { getAccounts, getTransactions } from '../../storage/services/appDataService';
import { calculateAccountBalance } from '../../shared/utils/calculations';
import type { Account } from '../../types/models';

export function getAccountWithBalance(accountId: string): { account: Account; balance: number } | null {
  const accounts = getAccounts();
  const account = accounts.find(a => a.id === accountId);
  if (!account) return null;
  const balance = calculateAccountBalance(accountId, accounts, getTransactions());
  return { account, balance };
}

export function getAllAccountsWithBalances(): Array<{ account: Account; balance: number }> {
  const accounts = getAccounts();
  const transactions = getTransactions();
  return accounts
    .filter(a => a.isActive)
    .map(account => ({
      account,
      balance: calculateAccountBalance(account.id, accounts, transactions),
    }));
}
