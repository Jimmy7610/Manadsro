import type { AppData, Transaction, Budget } from '../../types/models';
import { formatMonthKeySv } from '../../shared/utils/month';
import { getCategoryById } from '../categories/categoryService';

export interface MonthlyInsight {
  totalIncome: number;
  totalExpenses: number;
  totalBillsPaid: number;
  totalBalanceAdjustments: number;
  netResult: number;
  transactionCount: number;
  hasBalanceAdjustments: boolean;
}

export interface IncomeExpenseSummary {
  incomeTotal: number;
  expenseTotal: number;
  billTotal: number;
  netResult: number;
}

export interface CategoryExpenseInsight {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  totalAmount: number;
  transactionCount: number;
  percentageOfExpenses: number;
}

export interface BudgetWarning {
  budget: Budget;
  categoryName: string;
  spent: number;
  limit: number;
  status: 'ok' | 'close' | 'over';
}

/**
 * Get human-readable month label (e.g. "Maj 2026")
 */
export function getInsightMonthLabel(monthKey: string): string {
  return formatMonthKeySv(monthKey);
}

/**
 * Get calm CSS class/tone based on a positive or negative value
 */
export function getInsightTone(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

/**
 * Get monthly overview metrics for a given monthKey ('YYYY-MM')
 */
export function getMonthlyInsight(appData: AppData, monthKey: string): MonthlyInsight {
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalBillsPaid = 0;
  let totalBalanceAdjustments = 0;
  let transactionCount = 0;
  let hasBalanceAdjustments = false;

  appData.transactions.forEach((tx) => {
    if (tx.date.startsWith(monthKey)) {
      transactionCount++;
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else if (tx.type === 'expense') {
        totalExpenses += Math.abs(tx.amount);
      } else if (tx.type === 'bill') {
        totalBillsPaid += Math.abs(tx.amount);
      } else if (tx.type === 'balanceAdjustment') {
        totalBalanceAdjustments += tx.amount;
        hasBalanceAdjustments = true;
      }
    }
  });

  const netResult = totalIncome - totalExpenses - totalBillsPaid;

  return {
    totalIncome,
    totalExpenses,
    totalBillsPaid,
    totalBalanceAdjustments,
    netResult,
    transactionCount,
    hasBalanceAdjustments,
  };
}

/**
 * Simple income vs expense summary
 */
export function getIncomeExpenseSummary(appData: AppData, monthKey: string): IncomeExpenseSummary {
  const insight = getMonthlyInsight(appData, monthKey);
  return {
    incomeTotal: insight.totalIncome,
    expenseTotal: insight.totalExpenses,
    billTotal: insight.totalBillsPaid,
    netResult: insight.netResult,
  };
}

/**
 * Expenses aggregated by category
 */
export function getExpensesByCategory(appData: AppData, monthKey: string): CategoryExpenseInsight[] {
  const categoryMap = new Map<string, { amount: number; count: number }>();
  let totalSpent = 0;

  appData.transactions.forEach((tx) => {
    if (tx.date.startsWith(monthKey) && (tx.type === 'expense' || tx.type === 'bill')) {
      const amt = Math.abs(tx.amount);
      totalSpent += amt;
      const existing = categoryMap.get(tx.categoryId) || { amount: 0, count: 0 };
      categoryMap.set(tx.categoryId, {
        amount: existing.amount + amt,
        count: existing.count + 1,
      });
    }
  });

  const insights: CategoryExpenseInsight[] = [];
  categoryMap.forEach((data, catId) => {
    const cat = getCategoryById(appData.categories, catId);
    insights.push({
      categoryId: catId,
      categoryName: cat ? cat.name : 'Okänd kategori',
      categoryIcon: cat ? cat.emoji || '📦' : '📦',
      categoryColor: cat ? cat.color || 'var(--primary)' : 'var(--primary)',
      totalAmount: data.amount,
      transactionCount: data.count,
      percentageOfExpenses: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
    });
  });

  // Sort descending by amount
  return insights.sort((a, b) => b.totalAmount - a.totalAmount);
}

/**
 * Biggest transactions in the month (default limits to expenses but could include others)
 */
export function getBiggestTransactions(appData: AppData, monthKey: string, limit: number = 5): Transaction[] {
  const txs = appData.transactions.filter(
    (tx) => tx.date.startsWith(monthKey) && (tx.type === 'expense' || tx.type === 'bill')
  );

  return txs
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, limit);
}

/**
 * Checks budgets against spending to find warnings
 */
export function getBudgetWarnings(appData: AppData, monthKey: string): BudgetWarning[] {
  const warnings: BudgetWarning[] = [];
  
  // Endast budgetar för vald månad eller de som är 'aktiva'
  const activeBudgets = appData.budgets.filter(
    (b) => b.month === monthKey && b.active !== false
  );

  const categoryExpenses = getExpensesByCategory(appData, monthKey);

  activeBudgets.forEach((budget) => {
    const catExp = categoryExpenses.find((c) => c.categoryId === budget.categoryId);
    const spent = catExp ? catExp.totalAmount : 0;
    const cat = getCategoryById(appData.categories, budget.categoryId);

    let status: 'ok' | 'close' | 'over' = 'ok';
    if (spent >= budget.monthlyLimit) {
      status = 'over';
    } else if (budget.monthlyLimit > 0 && spent / budget.monthlyLimit >= 0.85) {
      status = 'close';
    }

    if (status !== 'ok') {
      warnings.push({
        budget,
        categoryName: cat ? cat.name : 'Okänd kategori',
        spent,
        limit: budget.monthlyLimit,
        status,
      });
    }
  });

  return warnings;
}
