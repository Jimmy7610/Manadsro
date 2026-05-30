import { useState } from 'react';
import Card from '../../shared/components/Card';
import { useAppData } from '../../storage/services/AppDataContext';
import { getCurrentMonthKey, getPreviousMonthKey, getNextMonthKey } from '../../shared/utils/month';
import { 
  getMonthlyInsight, 
  getExpensesByCategory, 
  getBiggestTransactions, 
  getBudgetWarnings,
  getInsightMonthLabel
} from '../../features/insights/insightsService';
import { formatCurrency } from '../../shared/utils/currency';
import { formatDate } from '../../shared/utils/date';
import { buildMonthlyReport, monthlyReportToCsv } from '../../features/export/monthlyReportService';
import { transactionsToCsv, buildExportFilename, downloadTextFile } from '../../features/export/exportService';
import './InsightsPage.css';

export default function InsightsPage() {
  const { data } = useAppData();
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey());

  const insight = getMonthlyInsight(data, monthKey);
  const categoryExpenses = getExpensesByCategory(data, monthKey);
  const biggestTxs = getBiggestTransactions(data, monthKey, 5);
  const budgetWarnings = getBudgetWarnings(data, monthKey);

  const monthLabel = getInsightMonthLabel(monthKey);

  const goPrev = () => setMonthKey(getPreviousMonthKey(monthKey));
  const goNext = () => setMonthKey(getNextMonthKey(monthKey));
  const goCurrent = () => setMonthKey(getCurrentMonthKey());

  const handleExportReport = () => {
    const report = buildMonthlyReport(data, monthKey);
    const csv = monthlyReportToCsv(report);
    const filename = buildExportFilename('manadsro-rapport', 'csv', monthKey);
    downloadTextFile(filename, csv);
  };

  const handleExportTransactions = () => {
    const monthTxs = data.transactions.filter(tx => tx.date.startsWith(monthKey));
    if (monthTxs.length === 0) return;
    const csv = transactionsToCsv(monthTxs, data);
    const filename = buildExportFilename('manadsro-transaktioner', 'csv', monthKey);
    downloadTextFile(filename, csv);
  };

  const hasData = insight.transactionCount > 0;
  
  // Calculate bar widths for Income vs Expense
  const totalBarAmount = insight.totalIncome + insight.totalExpenses + insight.totalBillsPaid;
  const totalOut = insight.totalExpenses + insight.totalBillsPaid;
  const incomePct = totalBarAmount > 0 ? (insight.totalIncome / totalBarAmount) * 100 : 50;
  const expensePct = totalBarAmount > 0 ? (totalOut / totalBarAmount) * 100 : 50;

  // Calm message determination
  let messageIcon = '📊';
  let messageText = 'Det finns inte tillräckligt med data för en tydlig analys ännu.';
  if (hasData) {
    if (insight.netResult > 0) {
      messageIcon = '🌱';
      messageText = 'Den här månaden går plus.';
    } else if (insight.netResult < 0) {
      messageIcon = '🌧️';
      messageText = 'Utgifterna är högre än inkomsterna den här månaden.';
    } else {
      messageIcon = '⚖️';
      messageText = 'Inkomster och utgifter är i balans.';
    }
  }

  return (
    <div className="insights-page animate-fade-in">
      <div className="insights-page__header">
        <h1 className="page-title">Insikter</h1>
        <div className="insights-page__month-controls">
          <button className="insights-page__month-btn" onClick={goPrev} aria-label="Föregående månad">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <span className="insights-page__month-label" onClick={goCurrent} style={{cursor: 'pointer'}} title="Gå till nuvarande månad">
            {monthLabel}
          </span>
          <button className="insights-page__month-btn" onClick={goNext} aria-label="Nästa månad">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>

      <p className="page-subtitle" style={{marginBottom: '1.5rem'}}>En lugn överblick över hur månaden ser ut.</p>

      {/* Summary grid */}
      <div className="insights-page__summary-grid">
        <Card className="insights-page__summary-item">
          <span className="insights-page__summary-label">Inkomster</span>
          <span className="insights-page__summary-value positive">+{formatCurrency(insight.totalIncome)}</span>
        </Card>
        <Card className="insights-page__summary-item">
          <span className="insights-page__summary-label">Utgifter</span>
          <span className="insights-page__summary-value negative">-{formatCurrency(insight.totalExpenses)}</span>
        </Card>
        <Card className="insights-page__summary-item">
          <span className="insights-page__summary-label">Räkningar</span>
          <span className="insights-page__summary-value negative">-{formatCurrency(insight.totalBillsPaid)}</span>
        </Card>
        <Card className="insights-page__summary-item">
          <span className="insights-page__summary-label">Netto</span>
          <span className={`insights-page__summary-value ${insight.netResult > 0 ? 'positive' : insight.netResult < 0 ? 'negative' : ''}`}>
            {insight.netResult > 0 ? '+' : ''}{formatCurrency(insight.netResult)}
          </span>
        </Card>
      </div>

      {/* Calm message */}
      <Card className="insights-page__message-card">
        <div className="insights-page__message-icon">{messageIcon}</div>
        <div className="insights-page__message-text">{messageText}</div>
        {hasData && (
          <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem'}}>
            Baserat på {insight.transactionCount} transaktioner
          </div>
        )}
      </Card>

      {/* Income vs Expenses Bar */}
      {hasData && totalBarAmount > 0 && (
        <Card style={{marginBottom: '1.5rem'}}>
          <h3 style={{marginTop: 0, marginBottom: '1rem'}}>Inkomster vs Utgifter</h3>
          <div className="insights-page__bar-container">
            <div className="insights-page__bar-segment insights-page__bar-segment--income" style={{width: `${incomePct}%`}}>
              {incomePct > 15 ? 'Inkomster' : ''}
            </div>
            <div className="insights-page__bar-segment insights-page__bar-segment--expense" style={{width: `${expensePct}%`}}>
              {expensePct > 15 ? 'Utgifter' : ''}
            </div>
          </div>
          <div className="insights-page__bar-legend">
            <span>Inkomst: {formatCurrency(insight.totalIncome)}</span>
            <span>Utgift: {formatCurrency(totalOut)}</span>
          </div>
        </Card>
      )}

      {/* Categories */}
      <Card style={{marginBottom: '1.5rem'}}>
        <h3 style={{marginTop: 0, marginBottom: '1rem'}}>Utgifter per kategori</h3>
        {categoryExpenses.length === 0 ? (
          <p style={{color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem'}}>Inga kategoriserade utgifter den här månaden.</p>
        ) : (
          <div className="insights-page__cat-list">
            {categoryExpenses.map(cat => (
              <div key={cat.categoryId} className="insights-page__cat-item">
                <div className="insights-page__cat-header">
                  <div className="insights-page__cat-info">
                    <span>{cat.categoryIcon}</span>
                    <span>{cat.categoryName}</span>
                    <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>({cat.transactionCount} st)</span>
                  </div>
                  <div className="insights-page__cat-amount">
                    {formatCurrency(cat.totalAmount)}
                  </div>
                </div>
                <div className="insights-page__cat-bar-bg">
                  <div 
                    className="insights-page__cat-bar-fill" 
                    style={{width: `${cat.percentageOfExpenses}%`, backgroundColor: cat.categoryColor}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Budget warnings */}
      <Card style={{marginBottom: '1.5rem'}}>
        <h3 style={{marginTop: 0, marginBottom: '1rem'}}>Budgetkoll</h3>
        {budgetWarnings.length === 0 ? (
          <p style={{color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem'}}>Inga budgetvarningar, allt ser lugnt ut.</p>
        ) : (
          <div className="insights-page__warning-list">
            {budgetWarnings.map(bw => (
              <div key={bw.budget.id} className={`insights-page__warning-item ${bw.status}`}>
                <div>
                  <div style={{fontWeight: 500}}>{bw.categoryName}</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                    {formatCurrency(bw.spent)} av {formatCurrency(bw.limit)}
                  </div>
                </div>
                <div className={`insights-page__warning-badge ${bw.status}`}>
                  {bw.status === 'over' ? 'Över budget' : 'Nära gränsen'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Biggest transactions */}
      <Card>
        <h3 style={{marginTop: 0, marginBottom: '1rem'}}>Största utgifterna</h3>
        {biggestTxs.length === 0 ? (
          <p style={{color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem'}}>Inga större utgifter att visa ännu.</p>
        ) : (
          <ul className="insights-page__tx-list">
            {biggestTxs.map(tx => (
              <li key={tx.id} className="insights-page__tx-item">
                <div className="insights-page__tx-info">
                  <span className="insights-page__tx-desc">{tx.description}</span>
                  <span className="insights-page__tx-meta">{formatDate(tx.date)}</span>
                </div>
                <div className="insights-page__tx-amount">
                  -{formatCurrency(Math.abs(tx.amount))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Balance Adjustments Note */}
      {insight.hasBalanceAdjustments && (
        <div className="insights-page__note">
          <span>⚖️</span>
          <span>Den här månaden innehåller saldojusteringar. De påverkar saldo men räknas inte som vanliga inkomster eller utgifter.</span>
        </div>
      )}

      {/* Export */}
      <Card style={{marginTop: '1.5rem'}}>
        <h3 style={{marginTop: 0, marginBottom: '1rem'}}>Export</h3>
        <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem'}}>
          Rapporten bygger på den data som redan finns i Månadsro.
        </p>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          <button className="btn-save" onClick={handleExportReport} disabled={!hasData} style={{flex: 1, minWidth: '200px'}}>Exportera månadsrapport</button>
          <button className="btn-cancel" onClick={handleExportTransactions} disabled={!hasData} style={{flex: 1, minWidth: '200px'}}>Exportera månadens transaktioner</button>
        </div>
      </Card>
    </div>
  );
}
