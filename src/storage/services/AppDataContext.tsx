import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppData, Transaction } from '../../types/models';
import { LocalStorageAdapter } from '../adapters/localStorageAdapter';

interface AppDataContextValue {
  data: AppData;
  addTransaction: (tx: Transaction) => void;
  resetLocalData: () => void;
  isLoaded: boolean;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);
const adapter = new LocalStorageAdapter();

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    // Load from local storage
    const loadedData = adapter.loadData();
    setData(loadedData);
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

  const resetLocalData = () => {
    adapter.clearData();
    const defaultData = adapter.getDefaultData();
    setData(defaultData);
    adapter.saveData(defaultData);
  };

  if (!data) {
    return <div>Laddar...</div>;
  }

  return (
    <AppDataContext.Provider value={{ data, addTransaction, resetLocalData, isLoaded: true }}>
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
