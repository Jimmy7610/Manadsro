import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../storage/services/AppDataContext';
import { getCurrentMonthKey, getNextMonthKey, getPreviousMonthKey, formatMonthKeySv } from '../../shared/utils/month';
import { formatCurrency } from '../../shared/utils/currency';
import { 
  getRecurringIncomesForMonth, 
  getRecurringBillsForMonth,
  getMonthPlanStatus,
  getPlannedVsActual,
  getMissingExpectedIncomes,
  getUnpaidBillsForMonth,
  getOverdueBillsForMonth,
  getMonthDeviationSummary
} from '../../features/monthPlanning/monthPlanningService';
import Card from '../../shared/components/Card';
import './MonthPlanningPage.css';

export default function MonthPlanningPage() {
  const { data, prepareMonthPlan, confirmMonthPlan, getMonthPlanByKey } = useAppData();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  const plan = getMonthPlanByKey(selectedMonth);
  const activeRecurringIncomes = getRecurringIncomesForMonth(data, selectedMonth);
  const activeRecurringBills = getRecurringBillsForMonth(data, selectedMonth);
  
  const status = getMonthPlanStatus(data, selectedMonth);
  const vsActual = getPlannedVsActual(data, selectedMonth);
  const missingIncomes = getMissingExpectedIncomes(data, selectedMonth);
  const unpaidBills = getUnpaidBillsForMonth(data, selectedMonth);
  const overdueBills = getOverdueBillsForMonth(data, selectedMonth);
  const deviations = getMonthDeviationSummary(data, selectedMonth);

  const handlePrepare = () => {
    prepareMonthPlan(selectedMonth);
  };

  const handleConfirm = () => {
    confirmMonthPlan(selectedMonth);
  };

  const getExpectedIncomeStatus = (recurringId: string) => {
    const expectedPrefix = `${selectedMonth}-`;
    const expected = data.expectedIncomes?.find(
      (ei) => ei.recurringIncomeId === recurringId && ei.expectedDate.startsWith(expectedPrefix)
    );
    if (!expected) return 'Saknas';
    if (expected.status === 'received') return 'Mottagen';
    if (expected.status === 'skipped') return 'Hoppad över';
    return 'Förväntad';
  };

  return (
    <div className="month-planning-page page-container animate-fade-in">
      <header className="month-planning-page__header page-header">
        <h1 className="page-title">Ny månad</h1>
        <p className="page-subtitle">Skapa en lugn plan för månadens inkomster och räkningar.</p>
      </header>

      <div className="month-planning-page__controls">
        <button 
          className="month-planning-page__btn"
          onClick={() => setSelectedMonth(getPreviousMonthKey(selectedMonth))}
        >
          Föregående
        </button>
        <div className="month-planning-page__month-title">
          {formatMonthKeySv(selectedMonth)}
        </div>
        <button 
          className="month-planning-page__btn"
          onClick={() => setSelectedMonth(getNextMonthKey(selectedMonth))}
        >
          Nästa
        </button>
      </div>

      <Card className="month-planning-page__status-card">
        {plan?.status === 'confirmed' ? (
          <>
            <div className="month-planning-page__status-header">
              <div className="month-planning-page__status-icon">
                {status === 'Planerad' ? '📝' : status === 'Pågår' ? '⏳' : status === 'Avvikelse' ? '⚠️' : '✅'}
              </div>
              <div className={`month-planning-page__status-badge month-planning-page__status-badge--${status.toLowerCase().replace('å', 'a')}`}>
                Status: {status}
              </div>
            </div>
            
            {deviations.length > 0 && (
              <div className="month-planning-page__deviations">
                {deviations.map((d, i) => (
                  <div key={i} className="month-planning-page__deviation-item">{d}</div>
                ))}
              </div>
            )}
            <div className="month-planning-page__item-meta" style={{marginTop: '0.5rem', textAlign: 'center'}}>
              Bekräftad {new Date(plan.confirmedAt!).toLocaleDateString('sv-SE')}
            </div>
          </>
        ) : plan?.status === 'draft' ? (
          <>
            <div className="month-planning-page__status-icon">📝</div>
            <div className="month-planning-page__status-text">
              Utkast förberett. Granska inkomster och räkningar nedan.
            </div>
            <div className="month-planning-page__actions">
              <button className="month-planning-page__btn month-planning-page__btn--primary" onClick={handleConfirm}>
                Bekräfta månadsplan
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="month-planning-page__status-icon">⏳</div>
            <div className="month-planning-page__status-text">
              Denna månad är inte förberedd ännu.
            </div>
            <div className="month-planning-page__actions">
              <button className="month-planning-page__btn month-planning-page__btn--primary" onClick={handlePrepare}>
                Förbered månad
              </button>
            </div>
          </>
        )}
      </Card>

      {plan?.status === 'confirmed' && (
        <div className="month-planning-page__section">
          <h2 className="month-planning-page__section-title">Planerat vs Faktiskt</h2>
          <div className="month-planning-page__vs-grid">
            <Card className="month-planning-page__vs-card">
              <h3 className="month-planning-page__vs-title">Inkomster</h3>
              <div className="month-planning-page__vs-row">
                <span>Planerat</span>
                <span>{formatCurrency(vsActual.plannedIncome)}</span>
              </div>
              <div className="month-planning-page__vs-row month-planning-page__vs-row--actual">
                <span>Mottaget</span>
                <span className="month-planning-page__amount--positive">{formatCurrency(vsActual.actualIncome)}</span>
              </div>
              {vsActual.missingIncome > 0 && (
                <div className="month-planning-page__vs-row month-planning-page__vs-row--missing">
                  <span>Saknas</span>
                  <span>{formatCurrency(vsActual.missingIncome)}</span>
                </div>
              )}
            </Card>

            <Card className="month-planning-page__vs-card">
              <h3 className="month-planning-page__vs-title">Räkningar</h3>
              <div className="month-planning-page__vs-row">
                <span>Planerat</span>
                <span>{formatCurrency(vsActual.plannedBills)}</span>
              </div>
              <div className="month-planning-page__vs-row month-planning-page__vs-row--actual">
                <span>Betalt</span>
                <span className="month-planning-page__amount--negative">{formatCurrency(vsActual.paidBills)}</span>
              </div>
              {vsActual.unpaidBills > 0 && (
                <div className="month-planning-page__vs-row month-planning-page__vs-row--missing">
                  <span>Obetalt</span>
                  <span>{formatCurrency(vsActual.unpaidBills)}</span>
                </div>
              )}
            </Card>

            <Card className="month-planning-page__vs-card month-planning-page__vs-card--full">
              <div className="month-planning-page__vs-row" style={{fontWeight: 600, fontSize: '1.1rem'}}>
                <span>Netto hittills</span>
                <span className={vsActual.netResult >= 0 ? 'month-planning-page__amount--positive' : 'month-planning-page__amount--negative'}>
                  {vsActual.netResult > 0 ? '+' : ''}{formatCurrency(vsActual.netResult)}
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {missingIncomes.length > 0 && (
        <div className="month-planning-page__section">
          <h2 className="month-planning-page__section-title" style={{color: 'var(--color-warning-dark)'}}>Saknade förväntade inkomster</h2>
          <div className="month-planning-page__list">
            {missingIncomes.map(inc => {
              const profile = data.profiles.find(p => p.id === inc.profileId);
              return (
                <div key={inc.id} className="month-planning-page__item month-planning-page__item--warning">
                  <div className="month-planning-page__item-left">
                    <div className="month-planning-page__item-title">{inc.name} {profile?.emoji}</div>
                    <div className="month-planning-page__item-meta">
                      Förväntades den {inc.expectedDate.split('-')[2]}
                    </div>
                  </div>
                  <div className="month-planning-page__item-right">
                    <div className="month-planning-page__item-amount">{formatCurrency(inc.amount)}</div>
                    <button className="month-planning-page__btn month-planning-page__btn--small" onClick={() => navigate('/incomes')}>Hantera</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(unpaidBills.length > 0 || overdueBills.length > 0) && (
        <div className="month-planning-page__section">
          <h2 className="month-planning-page__section-title" style={{color: 'var(--color-danger-dark)'}}>Räkningar som kräver uppmärksamhet</h2>
          <div className="month-planning-page__list">
            {[...overdueBills, ...unpaidBills.filter(b => !overdueBills.includes(b))].map(bill => {
              const isOverdue = overdueBills.includes(bill);
              const category = data.categories.find(c => c.id === bill.categoryId);
              return (
                <div key={bill.id} className={`month-planning-page__item ${isOverdue ? 'month-planning-page__item--danger' : 'month-planning-page__item--warning'}`}>
                  <div className="month-planning-page__item-left">
                    <div className="month-planning-page__item-title">{bill.name} {category?.emoji}</div>
                    <div className="month-planning-page__item-meta">
                      Förfaller den {new Date(bill.dueDate).getDate()}
                    </div>
                  </div>
                  <div className="month-planning-page__item-right">
                    <div className="month-planning-page__item-amount">{formatCurrency(bill.amount)}</div>
                    <div className={`month-planning-page__badge month-planning-page__badge--${isOverdue ? 'danger' : 'missing'}`}>
                      {isOverdue ? 'Försenad' : 'Obetald'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="month-planning-page__section">
        <h2 className="month-planning-page__section-title">Återkommande inkomster (Förväntade)</h2>
        {activeRecurringIncomes.length === 0 ? (
          <div className="month-planning-page__empty">Inga aktiva inkomstkällor.</div>
        ) : (
          <div className="month-planning-page__list">
            {activeRecurringIncomes.map(inc => {
              const status = getExpectedIncomeStatus(inc.id);
              const profile = data.profiles.find(p => p.id === inc.profileId);
              return (
                <div key={inc.id} className="month-planning-page__item">
                  <div className="month-planning-page__item-left">
                    <div className="month-planning-page__item-title">{inc.name} {profile?.emoji}</div>
                    <div className="month-planning-page__item-meta">
                      Förväntas den {inc.expectedDay}
                    </div>
                  </div>
                  <div className="month-planning-page__item-right">
                    <div className="month-planning-page__item-amount">{formatCurrency(inc.amount)}</div>
                    <div className={`month-planning-page__badge month-planning-page__badge--${status === 'Saknas' ? 'missing' : 'draft'}`}>
                      {status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="month-planning-page__section">
        <h2 className="month-planning-page__section-title">Återkommande räkningar (Kommande)</h2>
        {activeRecurringBills.length === 0 ? (
          <div className="month-planning-page__empty">Inga aktiva återkommande räkningar.</div>
        ) : (
          <div className="month-planning-page__list">
            {activeRecurringBills.map(bill => {
              const category = data.categories.find(c => c.id === bill.categoryId);
              return (
                <div key={bill.id} className="month-planning-page__item">
                  <div className="month-planning-page__item-left">
                    <div className="month-planning-page__item-title">{bill.name} {category?.emoji}</div>
                    <div className="month-planning-page__item-meta">
                      Förfaller den {bill.recurringDay || new Date(bill.dueDate).getDate()}
                    </div>
                  </div>
                  <div className="month-planning-page__item-right">
                    <div className="month-planning-page__item-amount">{formatCurrency(bill.amount)}</div>
                    <div className="month-planning-page__badge month-planning-page__badge--missing">
                      Planerad
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="month-planning-page__section">
        <Card className="month-planning-page__archive-prep">
          <h3>Månadsarkiv kommer senare</h3>
          <p>Build 17 förbereder status och avvikelser så att månadsarkiv kan byggas tryggt senare.</p>
        </Card>
      </div>

      <div className="month-planning-page__actions" style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
        <button className="month-planning-page__btn" onClick={() => navigate('/incomes')}>
          Gå till inkomster
        </button>
        <button className="month-planning-page__btn" onClick={() => navigate('/bills')}>
          Gå till räkningar
        </button>
        <button className="month-planning-page__btn" onClick={() => navigate('/insights')}>
          Visa insikter
        </button>
      </div>
    </div>
  );
}
