import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import VersionBadge from './VersionBadge';
import './AppShell.css';

/**
 * Månadsro – Huvudlayout (AppShell).
 * Hanterar sidofält (desktop) och bottenmeny (mobil).
 */
export default function AppShell() {
  return (
    <div className="app-shell">
      <VersionBadge />
      <Sidebar />
      <main className="app-shell__main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
