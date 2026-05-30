import { useState } from 'react';
import Card from '../../shared/components/Card';
import { formatCurrency } from '../../shared/utils/currency';
import { getRelativeDateText } from '../../shared/utils/date';
import { useAppData } from '../../storage/services/AppDataContext';
import AddTransactionModal from '../../features/transactions/AddTransactionModal';
import BalanceAdjustmentModal from '../../features/transactions/BalanceAdjustmentModal';
import { filterTransactions, sortTransactionsByDate, getTransactionDisplay } from '../../features/transactions/transactionService';
import type { Transaction } from '../../types/models';
import { transactionsToCsv, buildExportFilename, downloadTextFile } from '../../features/export/exportService';
import './TransactionsPage.css';

/**
 * Månadsro – Transaktionssida (Build 4)
 *
 * INSTÄLLNING - Sök- och filtreringslogik är visuell/basic i denna version.
 */
export default function TransactionsPage() {
  const { data, deleteTransaction, restoreTransaction } = useAppData();
  const transactions = data.transactions;
  const [activeFilter, setActiveFilter] = useState('Alla');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [profileId, setProfileId] = useState('');

  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [undoTx, setUndoTx] = useState<Transaction | null>(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  const filters = ['Alla', 'Inkomst', 'Utgift', 'Räkning', 'Överföring', 'Saldojustering'];

  const handleDelete = (tx: Transaction) => {
    if (window.confirm('Vill du radera den här transaktionen?\nDetta påverkar saldo, budget och översikter.')) {
      deleteTransaction(tx.id);
      setUndoTx(tx);
      setTimeout(() => {
        setUndoTx(null);
      }, 8000);
    }
  };

  const handleUndo = () => {
    if (undoTx) {
      restoreTransaction(undoTx);
      setUndoTx(null);
      alert('Transaktionen återställdes.');
    }
  };

  const filteredTransactions = sortTransactionsByDate(
    filterTransactions(transactions, {
      searchQuery,
      dateFrom,
      dateTo,
      accountId,
      categoryId,
      profileId,
      type: activeFilter
    }, data)
  );

  const totalIn = filteredTransactions.reduce((sum, tx) => (tx.type !== 'transfer' && tx.amount > 0) ? sum + tx.amount : sum, 0);
  const totalOut = filteredTransactions.reduce((sum, tx) => (tx.type !== 'transfer' && tx.amount < 0) ? sum + tx.amount : sum, 0);
  const net = totalIn + totalOut;

  const resetFilters = () => {
    setActiveFilter('Alla');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setAccountId('');
    setCategoryId('');
    setProfileId('');
  };

  const handleExportFiltered = () => {
    if (filteredTransactions.length === 0) return;
    const csv = transactionsToCsv(filteredTransactions, data);
    let monthPart = '';
    if (dateFrom && dateTo && dateFrom.substring(0, 7) === dateTo.substring(0, 7)) {
      monthPart = dateFrom.substring(0, 7);
    }
    const filename = buildExportFilename('manadsro-transaktioner-filtrerade', 'csv', monthPart || undefined);
    downloadTextFile(filename, csv);
  };

  const handleExportAll = () => {
    if (transactions.length === 0) return;
    const csv = transactionsToCsv(transactions, data);
    const filename = buildExportFilename('manadsro-transaktioner-alla', 'csv');
    downloadTextFile(filename, csv);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="transactions-page__header-actions">
        <h1 className="page-container__title" style={{marginBottom: 0}}>Transaktioner</h1>
        <button className="btn-save" onClick={() => setShowAdjustmentModal(true)}>Justera saldo</button>
      </div>
      <p style={{marginBottom: '1rem', color: 'var(--text-secondary)'}}>Sök, filtrera och följ hushållets ekonomi över tid.</p>

      {undoTx && (
        <div className="transactions-page__undo-toast">
          Transaktionen raderades. 
          <button className="transactions-page__undo-btn" onClick={handleUndo}>Ångra?</button>
        </div>
      )}

      <div className="transactions-page__controls">
        <input 
          type="text" 
          className="transactions-page__search" 
          placeholder="Sök transaktioner..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        
        <div className="transactions-page__advanced-filters">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="transactions-page__filter-input" placeholder="Från datum" title="Från datum" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="transactions-page__filter-input" placeholder="Till datum" title="Till datum" />
          <select value={accountId} onChange={e => setAccountId(e.target.value)} className="transactions-page__filter-select">
            <option value="">Alla konton</option>
            {data.accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="transactions-page__filter-select">
            <option value="">Alla kategorier</option>
            {data.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={profileId} onChange={e => setProfileId(e.target.value)} className="transactions-page__filter-select">
            <option value="">Alla profiler</option>
            {data.profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="transactions-page__filters" style={{justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', gap: '8px', overflowX: 'auto'}}>
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
          {(searchQuery || dateFrom || dateTo || accountId || categoryId || profileId || activeFilter !== 'Alla') && (
            <button className="transactions-page__action-btn" onClick={resetFilters} style={{flexShrink: 0, padding: '4px 12px'}}>Rensa filter</button>
          )}
        </div>
      </div>

      <div className="transactions-page__summary">
        <div>{filteredTransactions.length} transaktioner · {totalIn > 0 ? '+' : ''}{formatCurrency(totalIn)} in · {formatCurrency(totalOut)} ut · Netto {net > 0 ? '+' : ''}{formatCurrency(net)}</div>
        <div className="transactions-page__export-actions">
          <button className="transactions-page__action-btn" onClick={handleExportFiltered} disabled={filteredTransactions.length === 0}>Exportera filtrerade</button>
          <button className="transactions-page__action-btn" onClick={handleExportAll} disabled={transactions.length === 0}>Exportera alla</button>
        </div>
        <div style={{fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '4px'}}>CSV-filen skapas lokalt i webbläsaren.</div>
      </div>

      <div className="transactions-page__list">
        {filteredTransactions.length === 0 && (
          <div className="transactions-page__empty">Inga transaktioner matchar filtren.</div>
        )}
        {filteredTransactions.map((tx, idx) => {
          const display = getTransactionDisplay(tx, data);
          const isTransfer = tx.type === 'transfer';
          const isAdjustment = tx.type === 'balanceAdjustment';
          const amountClass = isTransfer ? 'neutral' : (tx.amount > 0 && !isTransfer) ? 'positive' : 'negative';

          return (
            <Card key={tx.id} className="transactions-page__item" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="transactions-page__item-left">
                <div className="transactions-page__item-icon">
                  {isTransfer ? '🔄' : isAdjustment ? '⚖️' : display.categoryEmoji || '💰'}
                </div>
                <div className="transactions-page__info">
                  <div className="transactions-page__desc">{tx.description}</div>
                  <div className="transactions-page__meta">
                    {getRelativeDateText(tx.date)} • {display.typeLabel} • {display.accountName}
                    {display.profileName && ` • ${display.profileName}`}
                    {tx.billId && ' 🏷️ Räkning'}
                  </div>
                </div>
              </div>
              <div className="transactions-page__item-right">
                <div className={`transactions-page__amount transactions-page__amount--${amountClass}`}>
                  {display.sign}{formatCurrency(Math.abs(tx.amount))}
                </div>
                <div className="transactions-page__actions">
                  <button className="transactions-page__action-btn" onClick={() => setEditingTx(tx)}>Redigera</button>
                  <button className="transactions-page__action-btn transactions-page__action-btn--danger" onClick={() => handleDelete(tx)}>Radera</button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {editingTx && (
        <AddTransactionModal 
          type={editingTx.type === 'balanceAdjustment' ? 'expense' : editingTx.type as any} 
          initialData={editingTx} 
          onClose={() => setEditingTx(null)} 
        />
      )}

      {showAdjustmentModal && (
        <BalanceAdjustmentModal onClose={() => setShowAdjustmentModal(false)} />
      )}
    </div>
  );
}
