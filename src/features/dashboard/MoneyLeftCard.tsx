import Card from '../../shared/components/Card';

import { getMonthlyStatus } from '../../shared/utils/monthlyStatus';
import { formatCurrency } from '../../shared/utils/currency';
import { useAppData } from '../../storage/services/AppDataContext';
import './MoneyLeftCard.css';

/**
 * Månadsro – Visar "Fritt utrymme" – det som finns kvar efter räkningar & budget.
 *
 * INSTÄLLNING - Tröskelvärden för varning/fara kan justeras nedan
 */

// INSTÄLLNING - Gränsvärden för statusfärg
const WARNING_THRESHOLD = 5000;
const DANGER_THRESHOLD = 0;

export default function MoneyLeftCard() {
  const { data } = useAppData();

  const statusObj = getMonthlyStatus(data);
  const freeSpace = statusObj.freeSpace;

  const getStatus = (amount: number): 'positive' | 'warning' | 'danger' => {
    if (amount <= DANGER_THRESHOLD) return 'danger';
    if (amount <= WARNING_THRESHOLD) return 'warning';
    return 'positive';
  };

  const status = getStatus(freeSpace);

  const statusLabels: Record<string, string> = {
    positive: '✨ Bra marginal',
    warning: '⚠️ Lite tight',
    danger: '🚨 Under noll',
  };

  return (
    <Card className="money-left">
      <span className="money-left__label">Fritt utrymme</span>
      <div className={`money-left__amount money-left__amount--${status}`}>
        {formatCurrency(freeSpace)}
      </div>
      <p className="money-left__description">
        Efter kommande räkningar och kvarvarande budget.
      </p>
      {statusObj.missingExpectedIncomeAmount > 0 && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          + {formatCurrency(statusObj.missingExpectedIncomeAmount)} förväntas i inkomst
        </div>
      )}
      <span className={`money-left__indicator money-left__indicator--${status}`}>
        {statusLabels[status]}
      </span>
    </Card>
  );
}
