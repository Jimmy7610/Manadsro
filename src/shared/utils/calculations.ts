import type { Account, Transaction, Bill, Budget } from '../../types/models';

/**
 * Beräkna kontosaldo: startsaldo + summan av alla transaktioner för kontot.
 * 
 * INSTÄLLNING - balanceAdjustment is treated as a direct account correction.
 * Since balanceAdjustment transactions contain the difference amount (positive or negative),
 * adding them along with other transactions correctly updates the balance.
 */
export function calculateAccountBalance(
  accountId: string,
  accounts: Account[],
  transactions: Transaction[]
): number {
  const account = accounts.find(a => a.id === accountId);
  if (!account) return 0;

  const txSum = transactions
    .filter(tx => tx.accountId === accountId)
    .reduce((sum, tx) => sum + tx.amount, 0);

  return account.initialBalance + txSum;
}

/**
 * Beräkna totalt saldo för alla aktiva konton.
 */
export function calculateTotalBalance(
  accounts: Account[],
  transactions: Transaction[]
): number {
  return accounts
    .filter(a => a.isActive && !a.archived)
    .reduce((total, account) => {
      return total + calculateAccountBalance(account.id, accounts, transactions);
    }, 0);
}

/**
 * Hämta kommande obetalda/planerade räkningar.
 */
export function calculateUpcomingBills(bills: Bill[], currentMonthKey?: string): Bill[] {
  const month = currentMonthKey || new Date().toISOString().substring(0, 7);
  return bills
    .filter(b => 
      (b.status === 'unpaid' || b.status === 'planned') && 
      b.skippedForMonth !== month
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

/**
 * Beräkna budgetanvändning per kategori.
 * Returnerar en lista med budget, spenderat belopp och procent.
 */
export function calculateBudgetUsage(
  budgets: Budget[],
  transactions: Transaction[]
): Array<{ budget: Budget; spent: number; percentage: number }> {
  return budgets.map(budget => {
    // Om budgeten är uttryckligen inaktiv (false), ignorera spenderat om vi vill, men
    // för historikens skull kan vi visa spenderat, men limit räknas inte av.
    // Eller enklare, i freeSpace filtrerar vi bort inaktiva.

    const spent = Math.abs(
      transactions
        .filter(tx => {
          const txMonth = tx.date.substring(0, 7); // 'YYYY-MM'
          return (
            tx.categoryId === budget.categoryId &&
            txMonth === budget.month &&
            (tx.type === 'expense' || tx.type === 'bill')
          );
        })
        .reduce((sum, tx) => sum + tx.amount, 0)
    );

    const percentage = budget.monthlyLimit > 0
      ? Math.round((spent / budget.monthlyLimit) * 100)
      : 0;

    return { budget, spent, percentage };
  });
}

/**
 * Beräkna "fritt utrymme" – det som finns kvar efter räkningar och budget.
 * Formel: Totalt saldo - obetalda räkningar - kvarvarande planerad budget = fritt utrymme
 *
 * INSTÄLLNING - Denna beräkning kan förbättras i framtida builds
 */
export function calculateFreeSpace(
  accounts: Account[],
  transactions: Transaction[],
  bills: Bill[],
  budgets: Budget[]
): number {
  // INSTÄLLNING - Endast transaktions- och gemensamma konton räknas med i "fritt utrymme"
  const operationalAccounts = accounts.filter(a => a.type === 'checking' || a.type === 'shared');
  const totalBalance = calculateTotalBalance(operationalAccounts, transactions);

  // Summa av obetalda/planerade räkningar
  const upcomingBillsTotal = calculateUpcomingBills(bills)
    .reduce((sum, bill) => sum + bill.amount, 0);

  // Kvarvarande budgetutrymme (budget - redan spenderat)
  const budgetUsage = calculateBudgetUsage(budgets, transactions);
  const remainingBudget = budgetUsage.reduce((sum, { budget, spent }) => {
    if (budget.active === false) return sum; // Ignorera inaktiva budgetar
    const remaining = Math.max(0, budget.monthlyLimit - spent);
    return sum + remaining;
  }, 0);

  return totalBalance - upcomingBillsTotal - remainingBudget;
}
