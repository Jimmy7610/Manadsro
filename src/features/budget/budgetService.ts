import { getBudgets, getTransactions } from '../../storage/services/appDataService';
import { calculateBudgetUsage } from '../../shared/utils/calculations';

export function getCurrentBudgetUsage() {
  return calculateBudgetUsage(getBudgets(), getTransactions());
}
