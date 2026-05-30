import type { AppData, ArchivedMonth, ArchivedMonthSummary } from '../../types/models';
import { getPlannedVsActual, getMonthPlan, getMissingExpectedIncomes, getUnpaidBillsForMonth, getOverdueBillsForMonth } from '../monthPlanning/monthPlanningService';
import { getCurrentMonthKey, formatMonthKeySv } from '../../shared/utils/month';

export function getArchivedMonths(appData: AppData): ArchivedMonth[] {
  return appData.archivedMonths || [];
}

export function getArchivedMonth(appData: AppData, monthKey: string): ArchivedMonth | undefined {
  return getArchivedMonths(appData).find(a => a.monthKey === monthKey);
}

export function isMonthArchived(appData: AppData, monthKey: string): boolean {
  return !!getArchivedMonth(appData, monthKey);
}

export interface ArchiveReadiness {
  canArchive: boolean;
  warnings: string[];
  blockers: string[];
}

export function getArchiveReadiness(appData: AppData, monthKey: string): ArchiveReadiness {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const currentMonthKey = getCurrentMonthKey();
  const plan = getMonthPlan(appData, monthKey);

  if (plan?.status !== 'confirmed') {
    blockers.push("Månadsplanen är inte bekräftad/förberedd.");
  }

  if (monthKey > currentMonthKey) {
    blockers.push("Månaden ligger i framtiden.");
  }

  if (monthKey === currentMonthKey) {
    warnings.push("Månaden har inte tagit slut ännu.");
  }

  const missingIncomes = getMissingExpectedIncomes(appData, monthKey);
  const overdueBills = getOverdueBillsForMonth(appData, monthKey);
  const unpaidBills = getUnpaidBillsForMonth(appData, monthKey);

  if (missingIncomes.length > 0) {
    warnings.push(`${missingIncomes.length} förväntade inkomster saknas.`);
  }

  if (overdueBills.length > 0 || unpaidBills.length > 0) {
    warnings.push(`${overdueBills.length + unpaidBills.length} räkningar är obetalda/försenade.`);
  }

  // Budget warnings (simplified for readiness)
  // A budget check could be added here, but deviations usually cover enough.

  const vsActual = getPlannedVsActual(appData, monthKey);
  if (vsActual.balanceAdjustmentsTotal !== 0) {
    warnings.push("Det finns saldojusteringar under månaden.");
  }

  return {
    canArchive: blockers.length === 0,
    warnings,
    blockers
  };
}

export function buildArchivedMonthSnapshot(appData: AppData, monthKey: string): ArchivedMonth {
  const plan = getMonthPlan(appData, monthKey);
  const vsActual = getPlannedVsActual(appData, monthKey);
  
  const monthTxs = appData.transactions.filter(tx => tx.date.startsWith(monthKey));
  let balanceAdjustmentCount = 0;
  
  // Find biggest category and biggest expense
  const categoryTotals: Record<string, number> = {};
  let biggestExpense = { name: '', amount: 0 };

  monthTxs.forEach(tx => {
    if (tx.type === 'balanceAdjustment') {
      balanceAdjustmentCount++;
    }
    if (tx.type === 'expense') {
      const amt = Math.abs(tx.amount);
      categoryTotals[tx.categoryId] = (categoryTotals[tx.categoryId] || 0) + amt;
      if (amt > biggestExpense.amount) {
        biggestExpense = { name: tx.description || 'Okänd utgift', amount: amt };
      }
    }
  });

  appData.bills.forEach(b => {
    if (b.dueDate.startsWith(monthKey) && b.status === 'paid') {
      const amt = Math.abs(b.amount);
      categoryTotals[b.categoryId] = (categoryTotals[b.categoryId] || 0) + amt;
      if (amt > biggestExpense.amount) {
        biggestExpense = { name: b.name || 'Räkning', amount: amt };
      }
    }
  });

  let biggestCategory = { id: '', amount: 0 };
  for (const [catId, amount] of Object.entries(categoryTotals)) {
    if (amount > biggestCategory.amount) {
      biggestCategory = { id: catId, amount };
    }
  }

  const biggestCategoryName = appData.categories.find(c => c.id === biggestCategory.id)?.name;

  const budgetWarningCount = appData.budgets.filter(b => b.month === monthKey && categoryTotals[b.categoryId] > b.monthlyLimit).length;

  const summary: ArchivedMonthSummary = {
    totalIncome: vsActual.actualIncome,
    totalExpenses: vsActual.actualExpenses,
    totalBills: vsActual.paidBills,
    netResult: vsActual.netResult,
    transactionCount: monthTxs.length,
    balanceAdjustmentsTotal: vsActual.balanceAdjustmentsTotal,
    balanceAdjustmentCount,
    plannedIncome: vsActual.plannedIncome,
    actualIncome: vsActual.actualIncome,
    missingIncome: vsActual.missingIncome,
    plannedBills: vsActual.plannedBills,
    paidBills: vsActual.paidBills,
    unpaidBills: vsActual.unpaidBills,
    overdueBills: vsActual.overdueBills,
    biggestCategoryName,
    biggestCategoryAmount: biggestCategory.amount,
    biggestExpenseName: biggestExpense.name,
    biggestExpenseAmount: biggestExpense.amount,
    budgetWarningCount
  };

  return {
    id: `arc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    monthKey,
    monthLabel: formatMonthKeySv(monthKey),
    archivedAt: new Date().toISOString(),
    sourceMonthPlanId: plan?.id,
    status: 'archived',
    summary,
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
