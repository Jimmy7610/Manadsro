import Card from '../../shared/components/Card';
import { getBudgets, getTransactions } from '../../storage/services/appDataService';
import { calculateBudgetUsage } from '../../shared/utils/calculations';
import { getCategoryEmoji, getCategoryName } from '../../features/categories/categoryService';
import { formatCurrency } from '../../shared/utils/currency';
import './BudgetPage.css';

/**
 * Månadsro – Budgetsida (Build 2)
 */
export default function BudgetPage() {
  const budgets = getBudgets();
  const transactions = getTransactions();
  const usage = calculateBudgetUsage(budgets, transactions);

  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-container__title">Budget</h1>

      <Card className="budget-page__info">
        <div className="budget-page__info-icon">💡</div>
        <p>Budgeten bygger på demo-transaktioner i den här versionen. Här ser du hur mycket som är spenderat i varje kategori för pågående månad.</p>
      </Card>

      <div className="budget-page__list">
        {usage.map(({ budget, spent, percentage }, idx) => {
          const remaining = Math.max(0, budget.monthlyLimit - spent);
          
          let statusText = 'Lugnt';
          let statusClass = 'positive';
          
          if (percentage >= 100) {
            statusText = 'Över budget';
            statusClass = 'danger';
          } else if (percentage >= 75) {
            statusText = 'Nära gräns';
            statusClass = 'warning';
          }

          const progressWidth = Math.min(100, percentage);

          return (
            <Card key={budget.id} className="budget-page__card" style={{ animationDelay: `${idx * 0.1}s` }}>
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
                  style={{ width: `${progressWidth}%` }}
                />
              </div>

              <div className="budget-page__card-meta">
                <div className="budget-page__spent">
                  {formatCurrency(spent)} spenderat
                </div>
                <div className="budget-page__remaining">
                  {formatCurrency(remaining)} kvar av {formatCurrency(budget.monthlyLimit)}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
