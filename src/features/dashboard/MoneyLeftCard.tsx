import Card from '../../shared/components/Card';
import { getAccounts, getTransactions, getBills, getBudgets } from '../../storage/services/appDataService';
import { calculateFreeSpace } from '../../shared/utils/calculations';
import { formatCurrency } from '../../shared/utils/currency';
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
  const accounts = getAccounts();
  const transactions = getTransactions();
  const bills = getBills();
  const budgets = getBudgets();

  const freeSpace = calculateFreeSpace(accounts, transactions, bills, budgets);

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
      <span className={`money-left__indicator money-left__indicator--${status}`}>
        {statusLabels[status]}
      </span>
    </Card>
  );
}
