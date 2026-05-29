import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNav.css';

/**
 * Månadsro – Mobilmeny (bottom navigation).
 * Visas bara på smala skärmar (<769px).
 *
 * INSTÄLLNING - Navigationslänkar och snabbmenyval definieras här
 */
const navItems = [
  { to: '/', label: 'Hem', emoji: '🏠' },
  { to: '/transactions', label: 'Transaktioner', emoji: '💳' },
  { to: '/bills', label: 'Räkningar', emoji: '📄' },
  { to: '/budget', label: 'Budget', emoji: '📋' },
];

// INSTÄLLNING - Snabbmenyval för plus-knappen
const quickActions = [
  { label: 'Lägg till köp', emoji: '🛒' },
  { label: 'Lägg till inkomst', emoji: '💰' },
  { label: 'Lägg till räkning', emoji: '📄' },
  { label: 'Justera saldo', emoji: '⚖️' },
];

export default function BottomNav() {
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  return (
    <>
      {/* Snabbmeny-overlay */}
      {showQuickMenu && (
        <div className="quick-menu-overlay" onClick={() => setShowQuickMenu(false)}>
          <div className="quick-menu" onClick={e => e.stopPropagation()}>
            <div className="quick-menu__header">
              <h3>Lägg till</h3>
              <button
                className="quick-menu__close"
                onClick={() => setShowQuickMenu(false)}
                aria-label="Stäng"
              >
                ✕
              </button>
            </div>
            <div className="quick-menu__actions">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  className="quick-menu__action"
                  onClick={() => setShowQuickMenu(false)}
                >
                  <span className="quick-menu__action-emoji">{action.emoji}</span>
                  <span className="quick-menu__action-label">{action.label}</span>
                </button>
              ))}
            </div>
            <p className="quick-menu__note">
              Funktionalitet kommer i framtida builds.
            </p>
          </div>
        </div>
      )}

      {/* Flytande plus-knapp */}
      <button
        className="fab"
        onClick={() => setShowQuickMenu(true)}
        aria-label="Lägg till ny post"
      >
        <span className="fab__icon">+</span>
      </button>

      {/* Bottenmeny */}
      <nav className="bottom-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`
            }
          >
            <span className="bottom-nav__emoji">{item.emoji}</span>
            <span className="bottom-nav__label">{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`
          }
        >
          <span className="bottom-nav__emoji">⋯</span>
          <span className="bottom-nav__label">Mer</span>
        </NavLink>
      </nav>
    </>
  );
}
