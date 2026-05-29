import { useState } from 'react';
import Card from '../../shared/components/Card';
import { getCurrentBudgetUsage } from '../../features/budget/budgetService';
import { getCategoryEmoji, getCategoryName } from '../../features/categories/categoryService';
import { formatCurrency } from '../../shared/utils/currency';
import { useAppData } from '../../storage/services/AppDataContext';
import BudgetModal from '../../features/budget/BudgetModal';
import type { Budget } from '../../types/models';
import './BudgetPage.css';

/**
 * Månadsro – Budgetsida (Build 7)
 */
export default function BudgetPage() {
  const { data } = useAppData();
  const usage = getCurrentBudgetUsage(data.budgets, data.transactions);

  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setShowModal(true);
  };

  const closeAndShowToast = () => {
    setShowModal(false);
    showToast('Budgeten uppdaterades.');
  };

  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-container__title">Budget</h1>

      {message && <div className="budget-page__toast">{message}</div>}

      <Card className="budget-page__info">
        <div className="budget-page__info-icon">💡</div>
        <p>Budgetgränser hjälper Månadsro att räkna fritt utrymme mer realistiskt.</p>
      </Card>

      <div className="budget-page__list">
        {usage.map(({ budget, spent, percentage }, idx) => {
          const isActive = budget.active !== false;
          const remaining = Math.max(0, budget.monthlyLimit - spent);
          
          let statusText = 'Lugnt';
          let statusClass = 'positive';
          
          if (!isActive) {
            statusText = 'Inaktiv';
            statusClass = 'inactive';
          } else if (percentage >= 100) {
            statusText = 'Över budget';
            statusClass = 'danger';
          } else if (percentage >= 75) {
            statusText = 'Nära gräns';
            statusClass = 'warning';
          }

          const progressWidth = Math.min(100, percentage);

          return (
            <Card key={budget.id} className={`budget-page__card ${!isActive ? 'budget-page__card--inactive' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="budget-page__card-header">
                <div className="budget-page__card-title">
                  <span className="budget-page__emoji">{getCategoryEmoji(budget.categoryId)}</span>
                  <span className="budget-page__name">{getCategoryName(budget.categoryId)}</span>
                </div>
                <div className={`budget-page__status budget-page__status--${statusClass}`}>
                  {statusText}
                </div>
              </div>

              <div className="budget-page__progress-bg">
                <div 
                  className={`budget-page__progress-bar budget-page__progress-bar--${statusClass}`} 
                  style={{ width: isActive ? `${progressWidth}%` : '0%' }}
                />
              </div>

              <div className="budget-page__card-meta">
                <div className="budget-page__spent">
                  {formatCurrency(spent)} spenderat
                </div>
                <div className="budget-page__remaining">
                  {isActive 
                    ? `${formatCurrency(remaining)} kvar av ${formatCurrency(budget.monthlyLimit)}`
                    : `Gräns: ${formatCurrency(budget.monthlyLimit)}`}
                </div>
              </div>

              <div className="budget-page__actions">
                <button className="budget-page__btn" onClick={() => openEditModal(budget)}>
                  Redigera gräns
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {showModal && editingBudget && (
        <BudgetModal 
          budget={editingBudget} 
          onClose={closeAndShowToast} 
        />
      )}
    </div>
  );
}
