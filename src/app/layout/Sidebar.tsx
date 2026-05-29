import { NavLink } from 'react-router-dom';
import LogoMark from '../../shared/components/LogoMark';
import ThemeToggle from '../../shared/components/ThemeToggle';
import './Sidebar.css';

/**
 * Månadsro – Sidofält för desktop.
 * Visas bara på bredare skärmar (>768px).
 *
 * INSTÄLLNING - Navigationslänkar definieras här
 */
const navItems = [
  { to: '/', label: 'Dashboard', emoji: '📊' },
  { to: '/transactions', label: 'Transaktioner', emoji: '💳' },
  { to: '/bills', label: 'Räkningar', emoji: '📄' },
  { to: '/incomes', label: 'Inkomster', emoji: '💰' },
  { to: '/budget', label: 'Budget', emoji: '📋' },
  { to: '/accounts', label: 'Konton', emoji: '🏦' },
  { to: '/categories', label: 'Kategorier', emoji: '🏷️' },
  { to: '/settings', label: 'Inställningar', emoji: '⚙️' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <LogoMark size={36} showText />
        <p className="sidebar__slogan">Familjens ekonomi, lugnt och enkelt.</p>
      </div>

      <nav className="sidebar__nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <span className="sidebar__link-emoji">{item.emoji}</span>
            <span className="sidebar__link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <ThemeToggle />
      </div>
    </aside>
  );
}
