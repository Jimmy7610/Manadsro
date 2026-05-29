import { useState } from 'react';
import Card from '../../shared/components/Card';
import { getCurrentBudgetUsage } from '../../features/budget/budgetService';
import { getCategoryDisplay, getActiveCategories } from '../../features/categories/categoryService';
import { formatCurrency } from '../../shared/utils/currency';
import { useAppData } from '../../storage/services/AppDataContext';
import BudgetModal from '../../features/budget/BudgetModal';
import type { Budget } from '../../types/models';
import './BudgetPage.css';

/**
 * Månadsro – Budgetsida (Build 7)
 */
export default function BudgetPage() {
  const { data, ensureBudgetForCategory } = useAppData();
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

  const handleCreateBudget = (categoryId: string) => {
    if (ensureBudgetForCategory) {
      ensureBudgetForCategory(categoryId);
      setTimeout(() => {
        showToast('Budget skapades med 0 kr. Klicka på redigera för att sätta gräns.');
      }, 100);
    }
  };

  const activeCategoriesWithoutBudget = getActiveCategories(data.categories).filter(c => !data.budgets.find(b => b.categoryId === c.id));

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
          const cat = data.categories.find(c => c.id === budget.categoryId);
          const catDisplay = getCategoryDisplay(cat);

          return (
            <Card key={budget.id} className={`budget-page__card ${!isActive ? 'budget-page__card--inactive' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="budget-page__card-header">
                <div className="budget-page__card-title">
                  <span className="budget-page__emoji" style={{ backgroundColor: `${catDisplay.color}33`, color: catDisplay.color, borderRadius: '4px', padding: '4px', display: 'inline-flex' }}>{catDisplay.icon}</span>
                  <span className="budget-page__name">{catDisplay.name}</span>
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

      {activeCategoriesWithoutBudget.length > 0 && (
        <Card className="budget-page__info" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Skapa budget från kategori</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {activeCategoriesWithoutBudget.map(c => {
              const display = getCategoryDisplay(c);
              return (
                <button 
                  key={c.id} 
                  className="budget-page__btn"
                  onClick={() => handleCreateBudget(c.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span style={{ backgroundColor: `${display.color}33`, color: display.color, padding: '4px', borderRadius: '4px' }}>{display.icon}</span>
                  {display.name}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {showModal && editingBudget && (
        <BudgetModal 
          budget={editingBudget} 
          onClose={closeAndShowToast} 
        />
      )}
    </div>
  );
}
