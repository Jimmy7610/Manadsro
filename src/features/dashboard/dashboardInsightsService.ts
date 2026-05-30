import type { AppData } from '../../types/models';
import { 
  getMonthlyInsight, 
  getExpensesByCategory, 
  getBudgetWarnings,
  type BudgetWarning,
  type CategoryExpenseInsight
} from '../insights/insightsService';

export interface DashboardInsights {
  netResult: number;
  totalIncome: number;
  totalExpenses: number;
  totalBillsPaid: number;
  hasBalanceAdjustments: boolean;
  biggestCategory: CategoryExpenseInsight | null;
  strongestBudgetWarning: BudgetWarning | null;
  expectedIncomeCount: number;
  receivedIncomeCount: number;
  expectedIncomeAmount: number;
  receivedIncomeAmount: number;
  missingExpectedIncomeAmount: number;
  upcomingBillsCount: number;
  overdueBillsCount: number;
  planStatus: 'confirmed' | 'unconfirmed' | 'draft' | 'none';
}

export function getDashboardInsights(appData: AppData, monthKey: string): DashboardInsights {
  // Monthly Insight (Net result, incomes, expenses)
  const monthlyInsight = getMonthlyInsight(appData, monthKey);
  
  // Biggest category
  const categoryExpenses = getExpensesByCategory(appData, monthKey);
  const biggestCategory = categoryExpenses.length > 0 ? categoryExpenses[0] : null;

  // Strongest budget warning
  const warnings = getBudgetWarnings(appData, monthKey);
  let strongestBudgetWarning: BudgetWarning | null = null;
  if (warnings.length > 0) {
    strongestBudgetWarning = warnings.find(w => w.status === 'over') || warnings[0];
  }

  // Bills and Incomes (from monthlyStatus logic but specific for this monthKey)
  // We can reuse getMonthlyStatus logic since it's already calculating it, 
  // but it usually defaults to currentMonthKey. We will pass appData to a modified version or recalculate here.
  
  let upcomingBillsCount = 0;
  let overdueBillsCount = 0;
  let expectedIncomeCount = 0;
  let receivedIncomeCount = 0;
  let expectedIncomeAmount = 0;
  let receivedIncomeAmount = 0;
  let missingExpectedIncomeAmount = 0;

  appData.bills.forEach(bill => {
    const isSkipped = bill.status === 'skipped' || bill.skippedForMonth === monthKey;
    if (isSkipped) return;
    
    if (bill.status !== 'paid') {
      const today = new Date().toISOString().substring(0, 10);
      if (bill.dueDate < today) {
        overdueBillsCount++;
      } else if (bill.dueDate.startsWith(monthKey)) {
        upcomingBillsCount++;
      }
    }
  });

  if (appData.expectedIncomes) {
    appData.expectedIncomes.forEach(ei => {
      if (ei.expectedDate.startsWith(monthKey)) {
        if (ei.status === 'received') {
          receivedIncomeCount++;
          receivedIncomeAmount += ei.amount;
        } else if (ei.status === 'expected') {
          expectedIncomeCount++;
          expectedIncomeAmount += ei.amount;
          missingExpectedIncomeAmount += ei.amount;
        }
      }
    });
  }

  const plan = appData.monthPlans?.find(p => p.monthKey === monthKey);
  const planStatus = plan ? plan.status : 'none';

  return {
    netResult: monthlyInsight.netResult,
    totalIncome: monthlyInsight.totalIncome,
    totalExpenses: monthlyInsight.totalExpenses,
    totalBillsPaid: monthlyInsight.totalBillsPaid,
    hasBalanceAdjustments: monthlyInsight.hasBalanceAdjustments,
    biggestCategory,
    strongestBudgetWarning,
    expectedIncomeCount,
    receivedIncomeCount,
    expectedIncomeAmount,
    receivedIncomeAmount,
    missingExpectedIncomeAmount,
    upcomingBillsCount,
    overdueBillsCount,
    planStatus
  };
}
