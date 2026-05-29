import { calculateBudgetUsage } from '../../shared/utils/calculations';
import type { Budget, Transaction } from '../../types/models';

export function getCurrentBudgetUsage(budgets: Budget[], transactions: Transaction[]) {
  return calculateBudgetUsage(budgets, transactions);
}
