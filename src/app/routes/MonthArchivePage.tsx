import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../storage/services/AppDataContext';
import Card from '../../shared/components/Card';
import { formatCurrency } from '../../shared/utils/currency';
import { getArchivedMonths } from '../../features/monthArchive/monthArchiveService';
import { downloadTextFile, buildExportFilename } from '../../features/export/exportService';
import { buildMonthlyReport, monthlyReportToCsv } from '../../features/export/monthlyReportService';
import './MonthArchivePage.css';

export default function MonthArchivePage() {
  const { data } = useAppData();
  const navigate = useNavigate();
  const archivedMonths = getArchivedMonths(data).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);

  const totalArchived = archivedMonths.length;
  const latestArchived = archivedMonths[0];

  const handleExportReport = (monthKey: string) => {
    const report = buildMonthlyReport(data, monthKey);
    const csv = monthlyReportToCsv(report);
    const filename = buildExportFilename('manadsrapport', 'csv', monthKey);
    downloadTextFile(filename, csv);
  };

  if (totalArchived === 0) {
    return (
      <div className="page-container animate-fade-in">
        <h1 className="page-container__title">Månadsarkiv</h1>
        <p className="page-container__subtitle">Avslutade månader sparas som lugna sammanfattningar.</p>
        
        <Card className="month-archive-page__empty">
          <div className="month-archive-page__empty-icon">📂</div>
          <h2>Inga månader är arkiverade ännu.</h2>
          <p>När du är klar med en månad kan du arkivera den från Månadsplaneringen.</p>
          <button className="month-archive-page__btn month-archive-page__btn--primary" onClick={() => navigate('/month-planning')} style={{marginTop: '1rem'}}>
            Gå till Månadsplanering
          </button>
        </Card>
      </div>
    );
  }

  const selectedMonth = archivedMonths.find(m => m.id === selectedMonthId);

  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-container__title">Månadsarkiv</h1>
      <p className="page-container__subtitle">Avslutade månader sparas som lugna sammanfattningar.</p>

      <div className="month-archive-page__overview">
        <Card className="month-archive-page__stat-card">
          <div className="month-archive-page__stat-label">Arkiverade månader</div>
          <div className="month-archive-page__stat-value">{totalArchived}</div>
        </Card>
        <Card className="month-archive-page__stat-card">
          <div className="month-archive-page__stat-label">Senast arkiverad</div>
          <div className="month-archive-page__stat-value">{latestArchived.monthLabel}</div>
        </Card>
      </div>

      <div className="month-archive-page__content">
        <div className="month-archive-page__list">
          {archivedMonths.map(month => (
            <Card 
              key={month.id} 
              className={`month-archive-page__card ${selectedMonthId === month.id ? 'month-archive-page__card--active' : ''}`}
            >
              <div className="month-archive-page__card-header">
                <h3>{month.monthLabel}</h3>
                <div className="month-archive-page__badge">Arkiverad</div>
              </div>
              <div className="month-archive-page__card-meta">
                Arkiverades: {new Date(month.archivedAt).toLocaleDateString('sv-SE')}
              </div>
              
              <div className="month-archive-page__summary-row">
                <span>Nettoresultat:</span>
                <span className={month.summary.netResult >= 0 ? 'month-archive-page__amount--positive' : 'month-archive-page__amount--negative'}>
                  {month.summary.netResult > 0 ? '+' : ''}{formatCurrency(month.summary.netResult)}
                </span>
              </div>
              
              <div className="month-archive-page__summary-row">
                <span>Inkomster:</span>
                <span>{formatCurrency(month.summary.totalIncome)}</span>
              </div>
              <div className="month-archive-page__summary-row">
                <span>Utgifter (inkl räkningar):</span>
                <span>{formatCurrency(month.summary.totalExpenses + month.summary.totalBills)}</span>
              </div>
              
              <div className="month-archive-page__card-actions">
                <button 
                  className="month-archive-page__btn"
                  onClick={() => setSelectedMonthId(selectedMonthId === month.id ? null : month.id)}
                >
                  {selectedMonthId === month.id ? 'Dölj detaljer' : 'Visa detaljer'}
                </button>
              </div>
            </Card>
          ))}
        </div>

        {selectedMonth && (
          <div className="month-archive-page__details">
            <Card className="month-archive-page__details-card">
              <div className="month-archive-page__details-header">
                <h2>{selectedMonth.monthLabel} – Detaljer</h2>
                <button className="month-archive-page__btn month-archive-page__btn--small" onClick={() => setSelectedMonthId(null)}>Stäng</button>
              </div>

              <div className="month-archive-page__details-section">
                <h3>Sammanfattning vid arkivering</h3>
                <div className="month-archive-page__details-grid">
                  <div className="month-archive-page__details-item">
                    <span className="month-archive-page__details-label">Totala inkomster</span>
                    <span className="month-archive-page__details-value">{formatCurrency(selectedMonth.summary.totalIncome)}</span>
                  </div>
                  <div className="month-archive-page__details-item">
                    <span className="month-archive-page__details-label">Betalda räkningar</span>
                    <span className="month-archive-page__details-value">{formatCurrency(selectedMonth.summary.totalBills)}</span>
                  </div>
                  <div className="month-archive-page__details-item">
                    <span className="month-archive-page__details-label">Löpande utgifter</span>
                    <span className="month-archive-page__details-value">{formatCurrency(selectedMonth.summary.totalExpenses)}</span>
                  </div>
                  <div className="month-archive-page__details-item">
                    <span className="month-archive-page__details-label">Netto</span>
                    <span className={`month-archive-page__details-value ${selectedMonth.summary.netResult >= 0 ? 'month-archive-page__amount--positive' : 'month-archive-page__amount--negative'}`}>
                      {formatCurrency(selectedMonth.summary.netResult)}
                    </span>
                  </div>
                  <div className="month-archive-page__details-item">
                    <span className="month-archive-page__details-label">Antal transaktioner</span>
                    <span className="month-archive-page__details-value">{selectedMonth.summary.transactionCount}</span>
                  </div>
                </div>
              </div>

              <div className="month-archive-page__details-section">
                <h3>Största utgifter</h3>
                <div className="month-archive-page__details-grid">
                  <div className="month-archive-page__details-item">
                    <span className="month-archive-page__details-label">Största kategori</span>
                    <span className="month-archive-page__details-value">
                      {selectedMonth.summary.biggestCategoryName || '-'} ({formatCurrency(selectedMonth.summary.biggestCategoryAmount || 0)})
                    </span>
                  </div>
                  <div className="month-archive-page__details-item">
                    <span className="month-archive-page__details-label">Största enskilda utgift</span>
                    <span className="month-archive-page__details-value">
                      {selectedMonth.summary.biggestExpenseName || '-'} ({formatCurrency(selectedMonth.summary.biggestExpenseAmount || 0)})
                    </span>
                  </div>
                </div>
              </div>

              <div className="month-archive-page__details-section">
                <h3>Avvikelser & Noteringar</h3>
                <ul className="month-archive-page__details-list">
                  {selectedMonth.summary.missingIncome > 0 && (
                    <li>Saknade inkomster uppgick till {formatCurrency(selectedMonth.summary.missingIncome)}.</li>
                  )}
                  {selectedMonth.summary.unpaidBills > 0 && (
                    <li>Obetalda räkningar uppgick till {formatCurrency(selectedMonth.summary.unpaidBills)}.</li>
                  )}
                  {selectedMonth.summary.budgetWarningCount !== undefined && selectedMonth.summary.budgetWarningCount > 0 && (
                    <li>{selectedMonth.summary.budgetWarningCount} budgetkategorier överskreds.</li>
                  )}
                  {selectedMonth.summary.balanceAdjustmentCount > 0 && (
                    <li>Månaden innehöll {selectedMonth.summary.balanceAdjustmentCount} saldojusteringar.</li>
                  )}
                  {selectedMonth.summary.missingIncome === 0 && selectedMonth.summary.unpaidBills === 0 && selectedMonth.summary.balanceAdjustmentCount === 0 && (
                    <li>Inga särskilda avvikelser noterades vid arkivering.</li>
                  )}
                </ul>
              </div>

              <div className="month-archive-page__details-footer">
                <p className="month-archive-page__details-note">
                  Arkivet är en sparad sammanfattning. Om du ändrar gamla transaktioner senare påverkas inte den arkiverade sammanfattningen automatiskt.
                </p>
                <button 
                  className="month-archive-page__btn" 
                  onClick={() => handleExportReport(selectedMonth.monthKey)}
                >
                  Exportera månadsrapport
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
