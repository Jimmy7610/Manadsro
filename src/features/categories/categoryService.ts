import type { AppData, Category } from '../../types/models';

export const getActiveCategories = (categories: Category[]) => {
  return categories.filter(c => c.active !== false);
};

export const getCategoryById = (categories: Category[], categoryId: string) => {
  return categories.find(c => c.id === categoryId);
};

export const getCategoryUsage = (categoryId: string, appData: AppData) => {
  const transactionCount = appData.transactions.filter(t => t.categoryId === categoryId).length;
  const billCount = appData.bills.filter(b => b.categoryId === categoryId).length;
  const budgetCount = appData.budgets.filter(b => b.categoryId === categoryId).length;

  return {
    transactions: transactionCount,
    bills: billCount,
    budgets: budgetCount,
    total: transactionCount + billCount + budgetCount
  };
};

export const getCategoryDisplay = (category?: Category) => {
  if (!category) return { name: 'Okänd', icon: '❓', color: '#9E9E9E' };
  return {
    name: category.name,
    icon: category.icon || category.emoji || '📦',
    color: category.color || '#9E9E9E'
  };
};
