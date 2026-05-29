import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppData, Transaction, Account, Bill, Category, Budget, RecurringIncome, ExpectedIncome, MonthPlan } from '../../types/models';
import { calculateAccountBalance } from '../../shared/utils/calculations';
import { createOrUpdateMonthPlan, confirmMonthPlan as confirmMonthPlanService, getMonthPlan as getMonthPlanService } from '../../features/monthPlanning/monthPlanningService';
import { LocalStorageAdapter } from '../adapters/localStorageAdapter';
import { downloadBackup, parseBackupFile } from '../../features/backup/backupService';

interface AppDataContextValue {
  data: AppData;
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (transactionId: string) => void;
  restoreTransaction: (tx: Transaction) => void;
  createBalanceAdjustment: (accountId: string, realBalance: number, date: string, note?: string) => void;
  payBill: (billId: string, paymentInput: { amount: number; accountId: string; date: string; categoryId: string; comment: string }) => void;
  resetLocalData: () => void;
  exportBackup: () => void;
  importBackup: (file: File) => Promise<void>;
  updateSettings: (updates: Partial<AppData['settings']>) => void;
  completeOnboarding: (setupData: any) => void;
  
  // Accounts
  addAccount: (account: Account) => void;
  updateAccount: (accountId: string, updates: Partial<Account>) => void;
  archiveAccount: (accountId: string) => void;
  // Categories
  addCategory: (category: Category) => void;
  updateCategory: (categoryId: string, updates: Partial<Category>) => void;
  deactivateCategory: (categoryId: string) => void;
  reactivateCategory: (categoryId: string) => void;
  
  // Budgets
  updateBudgetLimit: (budgetId: string, newLimit: number) => void;
  toggleBudgetActive: (budgetId: string, active: boolean) => void;
  createBudgetForCategory: (categoryId: string, monthlyLimit: number) => void;
  ensureBudgetForCategory: (categoryId: string) => void;
  updateBudgetForCategory: (categoryId: string, updates: Partial<Budget>) => void;
  
  // Bills
  addBill: (bill: Bill) => void;
  updateBill: (billId: string, updates: Partial<Bill>) => void;
  skipBill: (billId: string, monthKey: string) => void;
  changeBillDueDate: (billId: string, newDueDate: string) => void;
  restoreSkippedBill: (billId: string) => void;
  
  // Incomes
  addRecurringIncome: (income: RecurringIncome) => void;
  updateRecurringIncome: (incomeId: string, updates: Partial<RecurringIncome>) => void;
  deactivateRecurringIncome: (incomeId: string) => void;
  reactivateRecurringIncome: (incomeId: string) => void;
  markIncomeAsReceived: (expectedIncomeId: string, paymentInput: { amount: number; accountId: string; date: string; categoryId?: string; comment: string }) => void;
  skipExpectedIncome: (expectedIncomeId: string) => void;
  ensureExpectedIncomesForMonth: (monthKey: string) => void;

  // Month Plans
  prepareMonthPlan: (monthKey: string) => void;
  confirmMonthPlan: (monthKey: string) => void;
  resetMonthPlanDraft: (monthKey: string) => void;
  getMonthPlanByKey: (monthKey: string) => MonthPlan | undefined;

  isLocked: boolean;
  unlockApp: () => void;
  lockApp: () => void;
  isLoaded: boolean;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);
const adapter = new LocalStorageAdapter();

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // Load from local storage
    let loadedData = adapter.loadData();
    
    // Migration / default values for Build 6
    if (loadedData) {
      if (loadedData.settings.onboardingCompleted === undefined) {
        loadedData.settings.onboardingCompleted = false;
      }
      if (loadedData.settings.dataMode === undefined) {
        loadedData.settings.dataMode = 'local';
      }
      
      // If PIN is enabled, lock on start
      if (loadedData.settings.pinEnabled) {
        setIsLocked(true);
      }
      
      // Normalize Build 11 fields
      if (!loadedData.recurringIncomes) {
        loadedData.recurringIncomes = [];
      }
      if (!loadedData.expectedIncomes) {
        loadedData.expectedIncomes = [];
      }
      if (!loadedData.monthPlans) {
        loadedData.monthPlans = [];
      }

      setData(loadedData);
    }
  }, []);

  const addTransaction = (tx: Transaction) => {
    if (!data) return;
    
    // Create new transaction list
    const newTransactions = [tx, ...data.transactions];
    
    // Calculate new account balance
    const newAccounts = data.accounts.map(acc => {
      if (acc.id === tx.accountId) {
        return {
          ...acc,
          initialBalance: acc.initialBalance // Note: initial balance is static, but we'll recalculate via utils, or we update currentBalance if it existed.
          // In Månadsro, balance is calculated dynamically from initialBalance + sum(transactions).
        };
      }
      return acc;
    });

    const newData = {
      ...data,
      transactions: newTransactions,
      accounts: newAccounts
    };
    
    setData(newData);
    adapter.saveData(newData);
  };

  const updateTransaction = (transactionId: string, updates: Partial<Transaction>) => {
    if (!data) return;
    const newTransactions = data.transactions.map(tx => 
      tx.id === transactionId ? { ...tx, ...updates, updatedAt: new Date().toISOString() } : tx
    );
    const newData = { ...data, transactions: newTransactions };
    setData(newData);
    adapter.saveData(newData);
  };

  const deleteTransaction = (transactionId: string) => {
    if (!data) return;
    const newTransactions = data.transactions.filter(tx => tx.id !== transactionId);
    const newData = { ...data, transactions: newTransactions };
    setData(newData);
    adapter.saveData(newData);
  };

  const restoreTransaction = (tx: Transaction) => {
    if (!data) return;
    // For simplicity, just append to the beginning and sort later if needed.
    // Or we can just insert it. Let's prepend it for now.
    const newTransactions = [tx, ...data.transactions];
    const newData = { ...data, transactions: newTransactions };
    setData(newData);
    adapter.saveData(newData);
  };

  const createBalanceAdjustment = (accountId: string, realBalance: number, date: string, note?: string) => {
    if (!data) return;
    const currentCalculatedBalance = calculateAccountBalance(accountId, data.accounts, data.transactions);
    const diff = realBalance - currentCalculatedBalance;
    
    if (diff === 0) return; // No adjustment needed

    const newTx: Transaction = {
      id: `tx-adj-${Date.now()}`,
      householdId: data.household.id,
      accountId,
      profileId: data.settings.activeProfileId, // Adjustments might not be tied to a specific profile, but this is a safe default
      type: 'balanceAdjustment',
      categoryId: data.categories.find(c => c.name.toLowerCase() === 'övrigt')?.id || data.categories[0]?.id || '',
      amount: diff,
      description: 'Saldojustering',
      date,
      isRecurring: false,
      tags: [],
      comment: note,
      createdAt: new Date().toISOString()
    };

    const newTransactions = [newTx, ...data.transactions];
    const newData = { ...data, transactions: newTransactions };
    setData(newData);
    adapter.saveData(newData);
  };

  const payBill = (billId: string, paymentInput: { amount: number; accountId: string; date: string; categoryId: string; comment: string }) => {
    if (!data) return;
    const bill = data.bills.find(b => b.id === billId);
    if (!bill) return;

    const newTx: Transaction = {
      id: `tx-bill-${Date.now()}`,
      householdId: data.household.id,
      accountId: paymentInput.accountId,
      profileId: bill.profileId || data.settings.activeProfileId,
      type: 'bill',
      categoryId: paymentInput.categoryId || bill.categoryId,
      amount: -Math.abs(paymentInput.amount),
      description: bill.name,
      date: paymentInput.date,
      isRecurring: false,
      tags: [],
      comment: paymentInput.comment,
      createdAt: new Date().toISOString(),
      billId: bill.id
    };

    const newTransactions = [newTx, ...data.transactions];
    const newBills = data.bills.map(b => 
      b.id === billId ? { ...b, status: 'paid' as const, paidAt: new Date().toISOString() } : b
    );

    const newData = { ...data, transactions: newTransactions, bills: newBills };
    setData(newData);
    adapter.saveData(newData);
  };

  const exportBackup = () => {
    if (!data) return;
    const now = new Date().toISOString();
    const newData = {
      ...data,
      settings: { ...data.settings, latestBackupAt: now }
    };
    setData(newData);
    adapter.saveData(newData);
    downloadBackup(newData);
  };

  const importBackup = async (file: File) => {
    const payload = await parseBackupFile(file);
    const newData = payload.data;
    setData(newData);
    adapter.saveData(newData);
  };

  const resetLocalData = () => {
    adapter.clearData();
    const defaultData = adapter.getDefaultData();
    defaultData.settings.onboardingCompleted = false;
    defaultData.settings.pinEnabled = false;
    setData(defaultData);
    adapter.saveData(defaultData);
    setIsLocked(false);
  };

  const updateSettings = (updates: Partial<AppData['settings']>) => {
    if (!data) return;
    const newData = {
      ...data,
      settings: { ...data.settings, ...updates, updatedAt: new Date().toISOString() }
    };
    setData(newData);
    adapter.saveData(newData);
  };

  const completeOnboarding = (setupData: any) => {
    if (!data) return;

    if (setupData.dataMode === 'demo') {
      const newData = {
        ...data,
        settings: {
          ...data.settings,
          onboardingCompleted: true,
          dataMode: 'demo' as const,
          pinEnabled: setupData.pinEnabled,
          pinHash: setupData.pinHash || '',
          pinSalt: setupData.pinSalt || '',
          updatedAt: new Date().toISOString()
        }
      };
      setData(newData);
      adapter.saveData(newData);
      return;
    }

    // Local mode setup
    const newHousehold = { 
      ...data.household, 
      name: setupData.householdName || 'Mitt hushåll' 
    };

    const newProfiles = setupData.profiles?.length > 0 ? setupData.profiles : data.profiles;
    const newAccounts = setupData.accounts?.length > 0 ? setupData.accounts : data.accounts;
    const newBudgets = setupData.budgets?.length > 0 ? setupData.budgets : [];
    const newBills = setupData.bills?.length > 0 ? setupData.bills : [];
    
    // Clear demo transactions when starting fresh local economy
    const newTransactions: Transaction[] = [];

    const newData = {
      ...data,
      household: newHousehold,
      profiles: newProfiles,
      accounts: newAccounts,
      budgets: newBudgets,
      bills: newBills,
      transactions: newTransactions,
      recurringIncomes: setupData.recurringIncomes || [],
      expectedIncomes: setupData.expectedIncomes || [],
      monthPlans: setupData.monthPlans || [],
      settings: {
        ...data.settings,
        onboardingCompleted: true,
        dataMode: 'local' as const,
        householdName: newHousehold.name,
        pinEnabled: setupData.pinEnabled,
        pinHash: setupData.pinHash || '',
        pinSalt: setupData.pinSalt || '',
        activeProfileId: newProfiles[newProfiles.length - 1]?.id || newProfiles[0]?.id, // Default to shared if possible
        updatedAt: new Date().toISOString()
      }
    };

    setData(newData);
    adapter.saveData(newData);
  };

  const addAccount = (account: Account) => {
    if (!data) return;
    const newAccounts = [...data.accounts, account];
    const newData = { ...data, accounts: newAccounts };
    setData(newData);
    adapter.saveData(newData);
  };

  const updateAccount = (accountId: string, updates: Partial<Account>) => {
    if (!data) return;
    const newAccounts = data.accounts.map(acc => 
      acc.id === accountId ? { ...acc, ...updates, updatedAt: new Date().toISOString() } : acc
    );
    const newData = { ...data, accounts: newAccounts };
    setData(newData);
    adapter.saveData(newData);
  };

  const archiveAccount = (accountId: string) => {
    if (!data) return;
    const newAccounts = data.accounts.map(acc => 
      acc.id === accountId ? { ...acc, archived: true, updatedAt: new Date().toISOString() } : acc
    );
    const newData = { ...data, accounts: newAccounts };
    setData(newData);
    adapter.saveData(newData);
  };

  const updateBudgetLimit = (budgetId: string, newLimit: number) => {
    if (!data) return;
    const newBudgets = data.budgets.map(b => 
      b.id === budgetId ? { ...b, monthlyLimit: newLimit, updatedAt: new Date().toISOString() } : b
    );
    const newData = { ...data, budgets: newBudgets };
    setData(newData);
    adapter.saveData(newData);
  };

  const toggleBudgetActive = (budgetId: string, active: boolean) => {
    if (!data) return;
    const newBudgets = data.budgets.map(b => 
      b.id === budgetId ? { ...b, active, updatedAt: new Date().toISOString() } : b
    );
    const newData = { ...data, budgets: newBudgets };
    setData(newData);
    adapter.saveData(newData);
  };

  const addCategory = (category: Category) => {
    if (!data) return;
    const newCategories = [...data.categories, { ...category, createdAt: new Date().toISOString() }];
    const newData = { ...data, categories: newCategories };
    setData(newData);
    adapter.saveData(newData);
  };

  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    if (!data) return;
    const newCategories = data.categories.map(c => 
      c.id === categoryId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    const newData = { ...data, categories: newCategories };
    setData(newData);
    adapter.saveData(newData);
  };

  const deactivateCategory = (categoryId: string) => {
    if (!data) return;
    const newCategories = data.categories.map(c => 
      c.id === categoryId ? { ...c, active: false, updatedAt: new Date().toISOString() } : c
    );
    const newData = { ...data, categories: newCategories };
    setData(newData);
    adapter.saveData(newData);
  };

  const reactivateCategory = (categoryId: string) => {
    if (!data) return;
    const newCategories = data.categories.map(c => 
      c.id === categoryId ? { ...c, active: true, updatedAt: new Date().toISOString() } : c
    );
    const newData = { ...data, categories: newCategories };
    setData(newData);
    adapter.saveData(newData);
  };

  const createBudgetForCategory = (categoryId: string, monthlyLimit: number) => {
    if (!data) return;
    const newBudget: Budget = {
      id: `bud-${Date.now()}`,
      householdId: data.household.id,
      categoryId,
      profileId: data.settings.activeProfileId,
      monthlyLimit,
      month: new Date().toISOString().substring(0, 7),
      active: true,
      createdAt: new Date().toISOString()
    };
    const newBudgets = [...data.budgets, newBudget];
    const newData = { ...data, budgets: newBudgets };
    setData(newData);
    adapter.saveData(newData);
  };

  const ensureBudgetForCategory = (categoryId: string) => {
    if (!data) return;
    const exists = data.budgets.find(b => b.categoryId === categoryId);
    if (!exists) {
      createBudgetForCategory(categoryId, 0);
    }
  };

  const updateBudgetForCategory = (categoryId: string, updates: Partial<Budget>) => {
    if (!data) return;
    const newBudgets = data.budgets.map(b => 
      b.categoryId === categoryId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    );
    const newData = { ...data, budgets: newBudgets };
    setData(newData);
    adapter.saveData(newData);
  };

  const addBill = (bill: Bill) => {
    if (!data) return;
    const newBills = [...data.bills, bill];
    const newData = { ...data, bills: newBills };
    setData(newData);
    adapter.saveData(newData);
  };

  const updateBill = (billId: string, updates: Partial<Bill>) => {
    if (!data) return;
    const newBills = data.bills.map(b => 
      b.id === billId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    );
    const newData = { ...data, bills: newBills };
    setData(newData);
    adapter.saveData(newData);
  };

  const skipBill = (billId: string, monthKey: string) => {
    if (!data) return;
    const newBills = data.bills.map(b => 
      b.id === billId ? { ...b, status: 'skipped' as const, skippedForMonth: monthKey, updatedAt: new Date().toISOString() } : b
    );
    const newData = { ...data, bills: newBills };
    setData(newData);
    adapter.saveData(newData);
  };

  const changeBillDueDate = (billId: string, newDueDate: string) => {
    if (!data) return;
    const newBills = data.bills.map(b => 
      b.id === billId ? { ...b, dueDate: newDueDate, updatedAt: new Date().toISOString() } : b
    );
    const newData = { ...data, bills: newBills };
    setData(newData);
    adapter.saveData(newData);
  };

  const restoreSkippedBill = (billId: string) => {
    if (!data) return;
    const newBills = data.bills.map(b => 
      b.id === billId ? { ...b, status: 'unpaid' as const, skippedForMonth: undefined, updatedAt: new Date().toISOString() } : b
    );
    const newData = { ...data, bills: newBills };
    setData(newData);
    adapter.saveData(newData);
  };

  const addRecurringIncome = (income: RecurringIncome) => {
    if (!data) return;
    const newIncomes = [...(data.recurringIncomes || []), income];
    const newData = { ...data, recurringIncomes: newIncomes };
    setData(newData);
    adapter.saveData(newData);
  };

  const updateRecurringIncome = (incomeId: string, updates: Partial<RecurringIncome>) => {
    if (!data) return;
    const newIncomes = (data.recurringIncomes || []).map(inc => 
      inc.id === incomeId ? { ...inc, ...updates, updatedAt: new Date().toISOString() } : inc
    );
    const newData = { ...data, recurringIncomes: newIncomes };
    setData(newData);
    adapter.saveData(newData);
  };

  const deactivateRecurringIncome = (incomeId: string) => {
    if (!data) return;
    const newIncomes = (data.recurringIncomes || []).map(inc => 
      inc.id === incomeId ? { ...inc, active: false, updatedAt: new Date().toISOString() } : inc
    );
    const newData = { ...data, recurringIncomes: newIncomes };
    setData(newData);
    adapter.saveData(newData);
  };

  const reactivateRecurringIncome = (incomeId: string) => {
    if (!data) return;
    const newIncomes = (data.recurringIncomes || []).map(inc => 
      inc.id === incomeId ? { ...inc, active: true, updatedAt: new Date().toISOString() } : inc
    );
    const newData = { ...data, recurringIncomes: newIncomes };
    setData(newData);
    adapter.saveData(newData);
  };

  const ensureExpectedIncomesForMonth = (monthKey: string) => {
    if (!data) return;
    const recurringIncomes = data.recurringIncomes || [];
    let currentExpected = data.expectedIncomes || [];
    let added = false;

    recurringIncomes.forEach(inc => {
      if (!inc.active) return;

      const expectedDatePrefix = `${monthKey}-`;
      const alreadyExists = currentExpected.find(ei => ei.recurringIncomeId === inc.id && ei.expectedDate.startsWith(expectedDatePrefix));
      
      if (!alreadyExists) {
        // Create expected income for this month
        // Just pad expectedDay to 2 digits
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
        currentExpected = [...currentExpected, newExpected];
        added = true;
      }
    });

    if (added) {
      const newData = { ...data, expectedIncomes: currentExpected };
      setData(newData);
      adapter.saveData(newData);
    }
  };

  const skipExpectedIncome = (expectedIncomeId: string) => {
    if (!data) return;
    const newExpected = (data.expectedIncomes || []).map(ei => 
      ei.id === expectedIncomeId ? { ...ei, status: 'skipped' as const, updatedAt: new Date().toISOString() } : ei
    );
    const newData = { ...data, expectedIncomes: newExpected };
    setData(newData);
    adapter.saveData(newData);
  };

  const markIncomeAsReceived = (expectedIncomeId: string, paymentInput: { amount: number; accountId: string; date: string; categoryId?: string; comment: string }) => {
    if (!data) return;
    
    const expected = (data.expectedIncomes || []).find(e => e.id === expectedIncomeId);
    if (!expected) return;
    if (expected.status === 'received') return; // Do not duplicate

    // 1. Create real transaction
    const newTx: Transaction = {
      id: `tx-inc-${Date.now()}`,
      householdId: data.household.id,
      accountId: paymentInput.accountId,
      profileId: expected.profileId || data.settings.activeProfileId,
      type: 'income',
      categoryId: paymentInput.categoryId || data.categories.find(c => c.name.toLowerCase().includes('lön') || c.name.toLowerCase().includes('inkomst'))?.id || data.categories[0]?.id || '',
      amount: Math.abs(paymentInput.amount),
      description: expected.name,
      date: paymentInput.date,
      isRecurring: true, // Mark it came from recurring
      tags: [],
      comment: paymentInput.comment,
      createdAt: new Date().toISOString()
    };

    const newTransactions = [newTx, ...data.transactions];

    // 2. Mark expected income as received
    const newExpected = (data.expectedIncomes || []).map(ei => 
      ei.id === expectedIncomeId ? { ...ei, status: 'received' as const, transactionId: newTx.id, updatedAt: new Date().toISOString() } : ei
    );

    const newData = { ...data, transactions: newTransactions, expectedIncomes: newExpected };
    setData(newData);
    adapter.saveData(newData);
  };

  const prepareMonthPlan = (monthKey: string) => {
    if (!data) return;
    const { newPlan, updatedExpectedIncomes } = createOrUpdateMonthPlan(data, monthKey);
    
    let newPlans = [...(data.monthPlans || [])];
    const existingIdx = newPlans.findIndex(p => p.monthKey === monthKey);
    if (existingIdx >= 0) {
      newPlans[existingIdx] = newPlan;
    } else {
      newPlans.push(newPlan);
    }

    const newData = { ...data, monthPlans: newPlans, expectedIncomes: updatedExpectedIncomes };
    setData(newData);
    adapter.saveData(newData);
  };

  const confirmMonthPlan = (monthKey: string) => {
    if (!data) return;
    const confirmedPlan = confirmMonthPlanService(data, monthKey);
    if (!confirmedPlan) return;

    let newPlans = [...(data.monthPlans || [])];
    const existingIdx = newPlans.findIndex(p => p.monthKey === monthKey);
    if (existingIdx >= 0) {
      newPlans[existingIdx] = confirmedPlan;
    }

    const newData = { ...data, monthPlans: newPlans };
    setData(newData);
    adapter.saveData(newData);
  };

  const resetMonthPlanDraft = (monthKey: string) => {
    if (!data) return;
    // Just remove it from monthPlans
    const newPlans = (data.monthPlans || []).filter(p => p.monthKey !== monthKey);
    const newData = { ...data, monthPlans: newPlans };
    setData(newData);
    adapter.saveData(newData);
  };

  const getMonthPlanByKey = (monthKey: string) => {
    if (!data) return undefined;
    return getMonthPlanService(data, monthKey);
  };

  const unlockApp = () => {
    setIsLocked(false);
    updateSettings({ lastUnlockedAt: new Date().toISOString() });
  };

  const lockApp = () => {
    if (data?.settings.pinEnabled) {
      setIsLocked(true);
    }
  };

  if (!data) {
    return <div>Laddar...</div>;
  }

  return (
    <AppDataContext.Provider value={{ 
      data, addTransaction, updateTransaction, deleteTransaction, restoreTransaction, createBalanceAdjustment, payBill, resetLocalData, exportBackup, importBackup, updateSettings, completeOnboarding,
      addAccount, updateAccount, archiveAccount, updateBudgetLimit, toggleBudgetActive, createBudgetForCategory, ensureBudgetForCategory, updateBudgetForCategory,
      addCategory, updateCategory, deactivateCategory, reactivateCategory,
      addBill, updateBill, skipBill, changeBillDueDate, restoreSkippedBill,
      addRecurringIncome, updateRecurringIncome, deactivateRecurringIncome, reactivateRecurringIncome, markIncomeAsReceived, skipExpectedIncome, ensureExpectedIncomesForMonth,
      prepareMonthPlan, confirmMonthPlan, resetMonthPlanDraft, getMonthPlanByKey,
      isLocked, unlockApp, lockApp, isLoaded: true 
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData måste användas inuti en AppDataProvider');
  }
  return context;
}
