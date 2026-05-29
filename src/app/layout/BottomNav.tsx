import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AddTransactionModal from '../../features/transactions/AddTransactionModal';
import BillModal from '../../features/bills/BillModal';
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
  { id: 'expense', label: 'Lägg till köp', emoji: '🛒', disabled: false },
  { id: 'income', label: 'Lägg till inkomst', emoji: '💰', disabled: false },
  { id: 'bill', label: 'Lägg till räkning', emoji: '📄', disabled: false },
  { id: 'recurring', label: 'Återkommande inkomst', emoji: '🔁', disabled: false },
];

export default function BottomNav() {
  const navigate = useNavigate(); // we need to import useNavigate at top
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'income' | 'bill' | null>(null);

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
                  key={action.id}
                  className="quick-menu__action"
                  onClick={() => {
                    setShowQuickMenu(false);
                    if (action.id === 'expense' || action.id === 'income') {
                      setModalType(action.id as 'expense' | 'income');
                    } else if (action.id === 'bill') {
                      setModalType('bill');
                    } else if (action.id === 'recurring') {
                      navigate('/incomes');
                    }
                  }}
                >
                  <span className="quick-menu__action-emoji">{action.emoji}</span>
                  <span className="quick-menu__action-label">{action.label}</span>
                  {action.disabled && <span style={{fontSize:'0.6rem', color:'gray'}}><br/>Kommer senare</span>}
                </button>
              ))}
            </div>
            <p className="quick-menu__note">
              Fler val kommer i framtida builds.
            </p>
          </div>
        </div>
      )}

      {(modalType === 'expense' || modalType === 'income') && (
        <AddTransactionModal type={modalType} onClose={() => setModalType(null)} />
      )}

      {modalType === 'bill' && (
        <BillModal onClose={() => setModalType(null)} />
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
