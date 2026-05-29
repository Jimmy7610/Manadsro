import Card from '../../shared/components/Card';
import { getRecentTransactions, getTransactionDisplay } from '../../features/transactions/transactionService';
import { formatCurrency } from '../../shared/utils/currency';
import { getRelativeDateText } from '../../shared/utils/date';
import { useAppData } from '../../storage/services/AppDataContext';
import './RecentTransactionsCard.css';

/**
 * Månadsro – Visar de 5 senaste transaktionerna.
 *
 * INSTÄLLNING - Antal transaktioner kan ändras nedan
 */

// INSTÄLLNING - Antal senaste transaktioner att visa
const TRANSACTION_COUNT = 5;

export default function RecentTransactionsCard() {
  const { data } = useAppData();
  const transactions = getRecentTransactions(data.transactions, TRANSACTION_COUNT);

  return (
    <Card className="recent-transactions">
      <div className="recent-transactions__header">
        <h3 className="recent-transactions__title">Senaste transaktioner</h3>
      </div>

      {transactions.length === 0 ? (
        <div className="recent-transactions__empty">
          Inga transaktioner ännu.
        </div>
      ) : (
        <ul className="recent-transactions__list">
          {transactions.map((tx) => {
            const display = getTransactionDisplay(tx, data);
            const isTransfer = tx.type === 'transfer';
            const isAdjustment = tx.type === 'balanceAdjustment';
            const amountClass = isTransfer ? 'neutral' : (tx.amount > 0 && !isTransfer) ? 'positive' : 'negative';

            return (
              <li key={tx.id} className="recent-transactions__item">
                <div className="recent-transactions__emoji">
                  {isTransfer ? '🔄' : isAdjustment ? '⚖️' : display.categoryEmoji || '💰'}
                </div>
                <div className="recent-transactions__info">
                  <div className="recent-transactions__description">
                    {tx.description}
                  </div>
                  <div className="recent-transactions__date">
                    {getRelativeDateText(tx.date)} • {display.typeLabel}
                  </div>
                </div>
                <div
                  className={`recent-transactions__amount recent-transactions__amount--${amountClass}`}
                >
                  {display.sign}{formatCurrency(Math.abs(tx.amount))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
