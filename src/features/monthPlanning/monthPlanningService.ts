import type { AppData, MonthPlan, RecurringIncome, Bill, ExpectedIncome } from '../../types/models';

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
    confirmedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
