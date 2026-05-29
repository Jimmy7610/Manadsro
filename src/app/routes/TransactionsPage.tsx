import { useState } from 'react';
import Card from '../../shared/components/Card';
import { getCategoryEmoji } from '../../features/categories/categoryService';
import { formatCurrency } from '../../shared/utils/currency';
import { getRelativeDateText } from '../../shared/utils/date';
import { useAppData } from '../../storage/services/AppDataContext';
import './TransactionsPage.css';

/**
 * Månadsro – Transaktionssida (Build 2)
 *
 * INSTÄLLNING - Sök- och filtreringslogik är visuell/basic i denna version.
 */
export default function TransactionsPage() {
  const { data } = useAppData();
  const transactions = data.transactions;
  const [activeFilter, setActiveFilter] = useState('Alla');

  const filters = ['Alla', 'Inkomst', 'Köp/utgift', 'Räkning', 'Överföring', 'Saldojustering'];

  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-container__title">Transaktioner</h1>

      <div className="transactions-page__controls">
        <input 
          type="text" 
          className="transactions-page__search" 
          placeholder="Sök transaktioner..." 
        />
        <div className="transactions-page__filters">
          {filters.map(f => (
            <button 
              key={f}
              className={`transactions-page__filter ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="transactions-page__list">
        {transactions.map((tx, idx) => {
          const isTransfer = tx.type === 'transfer';
          const isPositive = !isTransfer && tx.amount > 0;
          const amountClass = isTransfer ? 'neutral' : isPositive ? 'positive' : 'negative';

          return (
            <Card key={tx.id} className="transactions-page__item" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="transactions-page__item-left">
                <div className="transactions-page__emoji">
                  {isTransfer ? '🔄' : getCategoryEmoji(tx.categoryId)}
                </div>
                <div className="transactions-page__info">
                  <div className="transactions-page__desc">{tx.description}</div>
                  <div className="transactions-page__meta">
                    {getRelativeDateText(tx.date)} • {isTransfer ? 'Överföring' : 'Köp'}
                  </div>
                </div>
              </div>
              <div className={`transactions-page__amount transactions-page__amount--${amountClass}`}>
                {isPositive ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
