import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../storage/services/AppDataContext';
import { getCurrentMonthKey, getNextMonthKey, getPreviousMonthKey, formatMonthKeySv } from '../../shared/utils/month';
import { formatCurrency } from '../../shared/utils/currency';
import { getRecurringIncomesForMonth, getRecurringBillsForMonth } from '../../features/monthPlanning/monthPlanningService';
import Card from '../../shared/components/Card';
import './MonthPlanningPage.css';

export default function MonthPlanningPage() {
  const { data, prepareMonthPlan, confirmMonthPlan, getMonthPlanByKey } = useAppData();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  const plan = getMonthPlanByKey(selectedMonth);
  const activeRecurringIncomes = getRecurringIncomesForMonth(data, selectedMonth);
  const activeRecurringBills = getRecurringBillsForMonth(data, selectedMonth);

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
            <div className="month-planning-page__status-icon">✅</div>
            <div className="month-planning-page__status-text">
              Månadsplanen är bekräftad.
            </div>
            <div className="month-planning-page__item-meta">
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

      <div className="month-planning-page__actions" style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
        <button className="month-planning-page__btn" onClick={() => navigate('/incomes')}>
          Gå till inkomster
        </button>
        <button className="month-planning-page__btn" onClick={() => navigate('/bills')}>
          Gå till räkningar
        </button>
      </div>
    </div>
  );
}
