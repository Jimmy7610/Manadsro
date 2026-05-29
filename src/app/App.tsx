import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import AppShell from './layout/AppShell';
import DashboardPage from './routes/DashboardPage';
import TransactionsPage from './routes/TransactionsPage';
import BillsPage from './routes/BillsPage';
import BudgetPage from './routes/BudgetPage';
import AccountsPage from './routes/AccountsPage';
import SettingsPage from './routes/SettingsPage';
import CategoriesPage from './routes/CategoriesPage';
import IncomesPage from './routes/IncomesPage';
import MonthPlanningPage from './routes/MonthPlanningPage';
import InsightsPage from './routes/InsightsPage';
import { AppDataProvider, useAppData } from '../storage/services/AppDataContext';
import OnboardingFlow from '../features/onboarding/OnboardingFlow';
import LockScreen from '../features/security/LockScreen';

function AppInner() {
  const { data, isLoaded, isLocked } = useAppData();

  if (!isLoaded) return null;

  if (!data.settings.onboardingCompleted) {
    return <OnboardingFlow />;
  }

  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="bills" element={<BillsPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="incomes" element={<IncomesPage />} />
          <Route path="month-planning" element={<MonthPlanningPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  // Sätt tema vid start
  useEffect(() => {
    const stored = localStorage.getItem('manadsro-theme');
    if (stored === 'dark' || stored === 'light') {
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  return (
    <AppDataProvider>
      <AppInner />
    </AppDataProvider>
  );
}
