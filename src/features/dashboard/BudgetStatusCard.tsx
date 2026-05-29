import Card from '../../shared/components/Card';
import { getCurrentBudgetUsage } from '../../features/budget/budgetService';
import { getCategoryName, getCategoryEmoji } from '../../features/categories/categoryService';
import { formatCurrency } from '../../shared/utils/currency';
import './BudgetStatusCard.css';

/**
 * Månadsro – Visar budgetanvändning per kategori med progressbars.
 *
 * INSTÄLLNING - Tröskelvärden för färgändringar kan justeras nedan
 */

// INSTÄLLNING - Procent-gränser för färgbyte
const WARNING_PERCENT = 75;
const DANGER_PERCENT = 100;

function getBarStatus(percentage: number): 'ok' | 'warning' | 'over' {
  if (percentage >= DANGER_PERCENT) return 'over';
  if (percentage >= WARNING_PERCENT) return 'warning';
  return 'ok';
}

export default function BudgetStatusCard() {
  const budgetUsage = getCurrentBudgetUsage();

  return (
    <Card className="budget-status">
      <div className="budget-status__header">
        <h3 className="budget-status__title">Budget</h3>
      </div>

      {budgetUsage.length === 0 ? (
        <div className="budget-status__empty">
          Inga budgetar satta för den här månaden.
        </div>
      ) : (
        <div className="budget-status__list">
          {budgetUsage.map(({ budget, spent, percentage }) => {
            const status = getBarStatus(percentage);
            const cappedWidth = Math.min(percentage, 100);

            return (
              <div key={budget.id} className="budget-status__item">
                <div className="budget-status__item-header">
                  <div className="budget-status__category">
                    <span className="budget-status__category-emoji">
                      {getCategoryEmoji(budget.categoryId)}
                    </span>
                    <span>{getCategoryName(budget.categoryId)}</span>
                  </div>
                  <div className="budget-status__amounts">
                    <span>{formatCurrency(spent)}</span> / {formatCurrency(budget.monthlyLimit)}
                  </div>
                </div>
                <div className="budget-status__bar-container">
                  <div
                    className={`budget-status__bar budget-status__bar--${status}`}
                    style={{ width: `${cappedWidth}%` }}
                  />
                </div>
                <div className={`budget-status__percentage budget-status__percentage--${status}`}>
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
