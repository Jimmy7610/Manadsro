import type { AppData } from '../../types/models';
import { daysUntil } from './date';
import { calculateFreeSpace } from './calculations';

export function getMonthlyStatus(data: AppData) {
  const currentMonthKey = new Date().toISOString().substring(0, 7); // 'YYYY-MM'
  
  let upcomingCount = 0;
  let overdueCount = 0;
  let paidThisMonthCount = 0;
  
  let expectedIncomeCount = 0;
  let receivedIncomeCount = 0;
  let missingExpectedIncomeCount = 0;
  let missingExpectedIncomeAmount = 0;
  
  data.bills.forEach(bill => {
    const isSkipped = bill.status === 'skipped' || bill.skippedForMonth === currentMonthKey;
    if (isSkipped) return;
    
    if (bill.status === 'paid') {
      if (bill.paidAt?.startsWith(currentMonthKey) || bill.dueDate.startsWith(currentMonthKey)) {
        paidThisMonthCount++;
      }
    } else {
      const days = daysUntil(bill.dueDate);
      if (days < 0) {
        overdueCount++;
      } else if (bill.dueDate.startsWith(currentMonthKey)) {
        upcomingCount++;
      }
    }
  });

  const freeSpace = calculateFreeSpace(data.accounts, data.transactions, data.bills, data.budgets);

  if (data.expectedIncomes) {
    data.expectedIncomes.forEach(ei => {
      if (ei.expectedDate.startsWith(currentMonthKey)) {
        if (ei.status === 'received') {
          receivedIncomeCount++;
        } else if (ei.status === 'expected') {
          expectedIncomeCount++;
          missingExpectedIncomeCount++;
          missingExpectedIncomeAmount += ei.amount;
        } else if (ei.status === 'skipped') {
          // don't count towards missing or received
        }
      }
    });
  }
  
  let message = '';
  
  if (overdueCount > 0) {
    message = overdueCount === 1 ? '1 räkning är försenad.' : `${overdueCount} räkningar är försenade.`;
  } else if (missingExpectedIncomeCount > 0) {
    message = missingExpectedIncomeCount === 1 ? 'En förväntad inkomst saknas fortfarande.' : `Ni har ${missingExpectedIncomeCount} inkomster kvar att få den här månaden.`;
  } else if (upcomingCount > 0) {
    message = upcomingCount === 1 ? 'Ni har 1 räkning kvar den här månaden.' : `Ni har ${upcomingCount} räkningar kvar den här månaden.`;
  } else if (freeSpace < 0) {
    message = 'Utrymmet är stramt just nu.';
  } else {
    message = 'Månaden ser stabil ut.';
  }

  return {
    upcomingCount,
    overdueCount,
    paidThisMonthCount,
    expectedIncomeCount,
    receivedIncomeCount,
    missingExpectedIncomeCount,
    missingExpectedIncomeAmount,
    freeSpace,
    message
  };
}
