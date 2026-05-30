import type { AppData } from '../../types/models';
import { getMonthlyInsight, getExpensesByCategory, getBudgetWarnings, getInsightMonthLabel } from '../insights/insightsService';
import { escapeCsvValue } from './exportService';

export interface MonthlyReport {
  monthKey: string;
  monthLabel: string;
  totalIncome: number;
  totalExpenses: number;
  totalBills: number;
  netResult: number;
  transactionCount: number;
  biggestCategory: string;
  biggestExpense: string;
  budgetWarnings: number;
  balanceAdjustmentsTotal: number;
  balanceAdjustmentCount: number;
}

export function buildMonthlyReport(appData: AppData, monthKey: string): MonthlyReport {
  const insight = getMonthlyInsight(appData, monthKey);
  const monthLabel = getInsightMonthLabel(monthKey);
  
  const categoryExpenses = getExpensesByCategory(appData, monthKey);
  const biggestCategory = categoryExpenses.length > 0 ? categoryExpenses[0].categoryName : 'Ingen';
  
  // Find biggest single expense
  let biggestExpense = 'Ingen';
  let maxExpenseAmount = 0;
  
  // Calculate balance adjustments specifically
  let balanceAdjustmentsTotal = 0;
  let balanceAdjustmentCount = 0;
  
  appData.transactions.forEach(tx => {
    if (tx.date.startsWith(monthKey)) {
      if (tx.type === 'balanceAdjustment') {
        balanceAdjustmentsTotal += tx.amount;
        balanceAdjustmentCount++;
      } else if (tx.type === 'expense' && tx.amount < maxExpenseAmount) {
        maxExpenseAmount = tx.amount;
        biggestExpense = tx.description || 'Köp';
      }
    }
  });

  const warnings = getBudgetWarnings(appData, monthKey);

  return {
    monthKey,
    monthLabel,
    totalIncome: insight.totalIncome,
    totalExpenses: insight.totalExpenses,
    totalBills: insight.totalBillsPaid,
    netResult: insight.netResult,
    transactionCount: insight.transactionCount,
    biggestCategory,
    biggestExpense,
    budgetWarnings: warnings.length,
    balanceAdjustmentsTotal,
    balanceAdjustmentCount
  };
}

export function monthlyReportToCsv(report: MonthlyReport): string {
  const rows = [
    ['Månad', report.monthLabel],
    ['Inkomster', report.totalIncome],
    ['Utgifter', report.totalExpenses],
    ['Räkningar', report.totalBills],
    ['Netto', report.netResult],
    ['Antal transaktioner', report.transactionCount],
    ['Största kategori', report.biggestCategory],
    ['Största utgift', report.biggestExpense],
    ['Budgetvarningar', report.budgetWarnings],
    ['Saldojusteringar (Antal)', report.balanceAdjustmentCount],
    ['Saldojusteringar (Totalt belopp)', report.balanceAdjustmentsTotal]
  ];

  return rows.map(row => row.map(escapeCsvValue).join(';')).join('\n');
}
