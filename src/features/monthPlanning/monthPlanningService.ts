import type { AppData, MonthPlan, RecurringIncome, Bill, ExpectedIncome } from '../../types/models';
import { getCurrentMonthKey } from '../../shared/utils/month';

export function getMonthPlan(appData: AppData, monthKey: string): MonthPlan | undefined {
  return (appData.monthPlans || []).find(p => p.monthKey === monthKey);
}

export function hasConfirmedMonthPlan(appData: AppData, monthKey: string): boolean {
  const plan = getMonthPlan(appData, monthKey);
  return plan?.status === 'confirmed';
}

export function getRecurringIncomesForMonth(appData: AppData, _monthKey: string): RecurringIncome[] {
  // Return all active recurring incomes. In future builds, this could filter based on creation date or recurrence interval.
  return (appData.recurringIncomes || []).filter(inc => inc.active);
}

export function getRecurringBillsForMonth(appData: AppData, monthKey: string): Bill[] {
  // Return all active recurring bills that are not explicitly skipped for this month.
  // Note: Since bills might not have an 'active' flag if they are legacy, we check isRecurring.
  return appData.bills.filter(b => 
    b.isRecurring && 
    b.status !== 'paid' && 
    b.skippedForMonth !== monthKey
  );
}

export function createOrUpdateMonthPlan(appData: AppData, monthKey: string): { newPlan: MonthPlan, updatedExpectedIncomes: ExpectedIncome[] } {
  const existingPlan = getMonthPlan(appData, monthKey);
  
  // 1. Handle Expected Incomes
  const activeRecurringIncomes = getRecurringIncomesForMonth(appData, monthKey);
  let currentExpected = [...(appData.expectedIncomes || [])];
  
  activeRecurringIncomes.forEach(inc => {
    const expectedDatePrefix = `${monthKey}-`;
    const alreadyExists = currentExpected.find(ei => ei.recurringIncomeId === inc.id && ei.expectedDate.startsWith(expectedDatePrefix));
    
    if (!alreadyExists) {
      const dayStr = inc.expectedDay.toString().padStart(2, '0');
      const expectedDate = `${monthKey}-${dayStr}`;
      const newExpected: ExpectedIncome = {
        id: `ei-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        recurringIncomeId: inc.id,
        name: inc.name,
        amount: inc.amount,
        expectedDate,
        accountId: inc.accountId,
        profileId: inc.profileId,
        status: 'expected',
        createdAt: new Date().toISOString()
      };
      currentExpected.push(newExpected);
    }
  });

  const expectedIncomeIdsForMonth = currentExpected
    .filter(ei => ei.expectedDate.startsWith(`${monthKey}-`))
    .map(ei => ei.id);

  // 2. Handle Recurring Bills (Preview Only - no actual bill records created)
  const activeRecurringBills = getRecurringBillsForMonth(appData, monthKey);
  const plannedBillIds = activeRecurringBills.map(b => b.id);

  const newPlan: MonthPlan = {
    ...(existingPlan || {
      id: `mp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      monthKey,
      createdAt: new Date().toISOString()
    }),
    status: existingPlan?.status || 'draft',
    preparedAt: existingPlan?.preparedAt || new Date().toISOString(),
    expectedIncomeIds: expectedIncomeIdsForMonth,
    plannedBillIds,
    updatedAt: new Date().toISOString()
  };

  return { newPlan, updatedExpectedIncomes: currentExpected };
}

export function confirmMonthPlan(appData: AppData, monthKey: string): MonthPlan | undefined {
  const existingPlan = getMonthPlan(appData, monthKey);
  if (!existingPlan) return undefined;

  return {
    ...existingPlan,
    status: 'confirmed',
    monthStatus: 'planned',
    confirmedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function getMissingExpectedIncomes(appData: AppData, monthKey: string): ExpectedIncome[] {
  return (appData.expectedIncomes || []).filter(
    ei => ei.expectedDate.startsWith(monthKey) && ei.status === 'expected'
  );
}

export function getUnpaidBillsForMonth(appData: AppData, monthKey: string): Bill[] {
  return appData.bills.filter(b => {
    // Endast de som har förfallodatum i månaden eller tidigare obetalda
    // men för enkelhetens skull i Build 17 fokuserar vi på denna månads.
    return b.dueDate.startsWith(monthKey) && (b.status === 'unpaid' || b.status === 'planned');
  });
}

export function getOverdueBillsForMonth(appData: AppData, monthKey: string): Bill[] {
  const today = new Date().toISOString().substring(0, 10);
  return appData.bills.filter(b => 
    b.dueDate.startsWith(monthKey) && 
    b.dueDate < today && 
    (b.status === 'unpaid' || b.status === 'planned' || b.status === 'overdue')
  );
}

export interface PlannedVsActual {
  plannedIncome: number;
  actualIncome: number;
  missingIncome: number;
  plannedBills: number;
  paidBills: number;
  unpaidBills: number;
  overdueBills: number;
  plannedBudget: number;
  actualExpenses: number;
  netResult: number;
  balanceAdjustmentsTotal: number;
}

export function getPlannedVsActual(appData: AppData, monthKey: string): PlannedVsActual {
  let plannedIncome = 0;
  let actualIncome = 0;
  let missingIncome = 0;
  let plannedBills = 0;
  let paidBills = 0;
  let unpaidBills = 0;
  let overdueBills = 0;
  let plannedBudget = 0;
  let actualExpenses = 0;
  let netResult = 0;
  let balanceAdjustmentsTotal = 0;

  const today = new Date().toISOString().substring(0, 10);

  // Incomes
  (appData.expectedIncomes || []).forEach(ei => {
    if (ei.expectedDate.startsWith(monthKey)) {
      if (ei.status === 'received') {
        actualIncome += ei.amount;
      } else if (ei.status === 'expected') {
        plannedIncome += ei.amount;
        missingIncome += ei.amount;
      }
    }
  });

  // Bills
  appData.bills.forEach(b => {
    if (b.dueDate.startsWith(monthKey)) {
      if (b.status === 'paid') {
        paidBills += b.amount;
      } else if (b.status !== 'skipped') {
        plannedBills += b.amount;
        unpaidBills += b.amount;
        if (b.dueDate < today) {
          overdueBills += b.amount;
        }
      }
    }
  });
  
  // Also add preview recurring bills that are not in the actual bills list
  const activeRecurringBills = getRecurringBillsForMonth(appData, monthKey);
  activeRecurringBills.forEach(b => {
    plannedBills += b.amount;
  });

  // Budgets
  appData.budgets.forEach(b => {
    if (b.month === monthKey && b.active !== false) {
      plannedBudget += b.monthlyLimit;
    }
  });

  // Actual transactions
  appData.transactions.forEach(tx => {
    if (tx.date.startsWith(monthKey)) {
      if (tx.type === 'expense') {
        actualExpenses += Math.abs(tx.amount);
      } else if (tx.type === 'balanceAdjustment') {
        balanceAdjustmentsTotal += tx.amount;
      } else if (tx.type === 'income' && !tx.isRecurring) {
        // Manually added incomes not in expected incomes
        actualIncome += tx.amount;
      }
    }
  });

  netResult = actualIncome - actualExpenses - paidBills;

  return {
    plannedIncome: plannedIncome + actualIncome, // Total planned is expected + already received manual
    actualIncome,
    missingIncome,
    plannedBills: plannedBills + paidBills, // Total planned is unpaid + paid
    paidBills,
    unpaidBills,
    overdueBills,
    plannedBudget,
    actualExpenses,
    netResult,
    balanceAdjustmentsTotal
  };
}

export function getMonthPlanStatus(appData: AppData, monthKey: string): 'Planerad' | 'Pågår' | 'Avvikelse' | 'Klar' {
  const plan = getMonthPlan(appData, monthKey);
  if (plan?.status !== 'confirmed') return 'Planerad'; // If not confirmed, we treat it as draft/planned but let's call it Planerad for the UI fallback
  if (plan?.monthStatus === 'complete') return 'Klar';

  const currentMonth = getCurrentMonthKey();
  const missingIncomes = getMissingExpectedIncomes(appData, monthKey);
  const overdueBills = getOverdueBillsForMonth(appData, monthKey);
  const unpaidBills = getUnpaidBillsForMonth(appData, monthKey);

  const hasDeviations = overdueBills.length > 0 || (monthKey < currentMonth && missingIncomes.length > 0);

  if (hasDeviations) return 'Avvikelse';

  if (monthKey < currentMonth && unpaidBills.length === 0 && missingIncomes.length === 0) {
    return 'Klar';
  }

  if (monthKey === currentMonth) {
    return 'Pågår';
  }

  return 'Planerad';
}

export function getMonthDeviationSummary(appData: AppData, monthKey: string): string[] {
  const summary: string[] = [];
  const missingIncomes = getMissingExpectedIncomes(appData, monthKey);
  const overdueBills = getOverdueBillsForMonth(appData, monthKey);
  const unpaidBills = getUnpaidBillsForMonth(appData, monthKey);

  if (missingIncomes.length === 1) summary.push("En förväntad inkomst saknas.");
  else if (missingIncomes.length > 1) summary.push(`${missingIncomes.length} förväntade inkomster saknas.`);

  if (overdueBills.length === 1) summary.push("En räkning är försenad!");
  else if (overdueBills.length > 1) summary.push(`${overdueBills.length} räkningar är försenade!`);
  else if (unpaidBills.length === 1) summary.push("En räkning är obetald.");
  else if (unpaidBills.length > 1) summary.push(`${unpaidBills.length} räkningar är obetalda.`);

  // We could add budget warning check here if we want to be exact as the prompt suggested
  
  if (summary.length === 0) {
    const status = getMonthPlanStatus(appData, monthKey);
    if (status === 'Klar') summary.push("Månaden är avslutad och klar.");
    else if (status === 'Pågår') summary.push("Månaden ser lugn ut.");
    else summary.push("Planen är redo.");
  }

  return summary;
}

export function getMonthArchivePreview(_appData: AppData, _monthKey: string): boolean {
  // Skeleton for future use
  return true;
}
