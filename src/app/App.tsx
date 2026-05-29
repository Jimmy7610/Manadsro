import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import AppShell from './layout/AppShell';
import DashboardPage from './routes/DashboardPage';
import TransactionsPage from './routes/TransactionsPage';
import BillsPage from './routes/BillsPage';
import BudgetPage from './routes/BudgetPage';
import AccountsPage from './routes/AccountsPage';
import SettingsPage from './routes/SettingsPage';

/**
 * Månadsro – Huvudapp med routing.
 * Build 1: Alla sidor finns, men bara Dashboard har riktigt innehåll.
 */
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
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="bills" element={<BillsPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
