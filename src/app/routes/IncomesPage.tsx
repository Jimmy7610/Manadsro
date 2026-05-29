import { useState, useEffect } from 'react';
import Card from '../../shared/components/Card';
import { useAppData } from '../../storage/services/AppDataContext';
import { formatCurrency } from '../../shared/utils/currency';
import RecurringIncomeModal from '../../features/incomes/RecurringIncomeModal';
import ReceiveIncomeModal from '../../features/incomes/ReceiveIncomeModal';
import type { RecurringIncome, ExpectedIncome } from '../../types/models';
import './IncomesPage.css';

export default function IncomesPage() {
  const { data, ensureExpectedIncomesForMonth, skipExpectedIncome, deactivateRecurringIncome, reactivateRecurringIncome } = useAppData();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<RecurringIncome | undefined>();
  const [receivingIncome, setReceivingIncome] = useState<ExpectedIncome | undefined>();
  
  const currentMonthKey = new Date().toISOString().substring(0, 7);

  // Ensure expected incomes are generated for the current month
  useEffect(() => {
    ensureExpectedIncomesForMonth(currentMonthKey);
  }, [currentMonthKey, data.recurringIncomes, ensureExpectedIncomesForMonth]);

  const recurringIncomes = data.recurringIncomes || [];
  const expectedIncomes = (data.expectedIncomes || []).filter(ei => ei.expectedDate.startsWith(currentMonthKey));

  const expectedThisMonth = expectedIncomes.filter(ei => ei.status === 'expected');
  const receivedThisMonth = expectedIncomes.filter(ei => ei.status === 'received' || ei.status === 'skipped');

  const getRecurrenceText = (rec: string) => {
    switch (rec) {
      case 'monthly': return 'Månadsvis';
      case 'quarterly': return 'Kvartalsvis';
      case 'yearly': return 'Årligen';
      default: return rec;
    }
  };

  const getProfileName = (id: string) => {
    const p = data.profiles.find(p => p.id === id);
    return p ? `${p.name} ${p.emoji}` : 'Okänd profil';
  };

  const getAccountName = (id: string) => {
    const a = data.accounts.find(a => a.id === id);
    return a ? a.name : 'Okänt konto';
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="incomes-page__header">
        <h1 className="page-container__title" style={{ margin: 0 }}>Inkomster</h1>
        <button className="incomes-page__add-btn" onClick={() => setShowAddModal(true)}>
          + Ny inkomst
        </button>
      </div>

      <div className="incomes-page__section">
        <h2 className="incomes-page__section-title">Förväntas denna månad</h2>
        {expectedThisMonth.length === 0 ? (
          <div className="incomes-page__empty">Inga förväntade inkomster just nu.</div>
        ) : (
          <div className="incomes-page__list">
            {expectedThisMonth.map((ei, idx) => (
              <Card key={ei.id} className="incomes-page__card" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="incomes-page__card-header">
                  <div className="incomes-page__card-title">
                    <span className="incomes-page__name">{ei.name}</span>
                    <span className="incomes-page__meta">
                      Förväntas: {ei.expectedDate} • {getProfileName(ei.profileId)}
                    </span>
                  </div>
                  <div className="incomes-page__status incomes-page__status--expected">Väntar</div>
                </div>
                <div className="incomes-page__amount">{formatCurrency(ei.amount)}</div>
                
                <div className="incomes-page__actions">
                  <button className="incomes-page__btn incomes-page__btn--primary" onClick={() => setReceivingIncome(ei)}>
                    Markera som mottagen
                  </button>
                  <button className="incomes-page__btn" onClick={() => {
                    if (window.confirm('Vill du hoppa över den här inkomsten för månaden? Den räknas då inte som förväntad.')) {
                      skipExpectedIncome(ei.id);
                    }
                  }}>
                    Hoppa över
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="incomes-page__section">
        <h2 className="incomes-page__section-title">Återkommande inkomster</h2>
        {recurringIncomes.length === 0 ? (
          <div className="incomes-page__empty">Du har inga återkommande inkomster upplagda ännu.</div>
        ) : (
          <div className="incomes-page__list">
            {recurringIncomes.map((ri, idx) => (
              <Card key={ri.id} className={`incomes-page__card ${!ri.active ? 'incomes-page__card--inactive' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="incomes-page__card-header">
                  <div className="incomes-page__card-title">
                    <span className="incomes-page__name">{ri.name}</span>
                    <span className="incomes-page__meta">
                      Dag {ri.expectedDay} • {getRecurrenceText(ri.recurrence)} • {getAccountName(ri.accountId)}
                    </span>
                  </div>
                  {!ri.active && <div className="incomes-page__status incomes-page__status--skipped">Inaktiv</div>}
                </div>
                <div className="incomes-page__amount">{formatCurrency(ri.amount)}</div>
                
                <div className="incomes-page__actions">
                  <button className="incomes-page__btn" onClick={() => setEditingIncome(ri)}>Redigera</button>
                  <button className="incomes-page__btn" onClick={() => {
                    if (ri.active) deactivateRecurringIncome(ri.id);
                    else reactivateRecurringIncome(ri.id);
                  }}>
                    {ri.active ? 'Inaktivera' : 'Aktivera'}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {receivedThisMonth.length > 0 && (
        <div className="incomes-page__section">
          <h2 className="incomes-page__section-title">Mottagna inkomster (denna månad)</h2>
          <div className="incomes-page__list">
            {receivedThisMonth.map((ei, idx) => (
              <Card key={ei.id} className={`incomes-page__card ${ei.status === 'skipped' ? 'incomes-page__card--skipped' : 'incomes-page__card--received'}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="incomes-page__card-header">
                  <div className="incomes-page__card-title">
                    <span className="incomes-page__name">{ei.name}</span>
                  </div>
                  <div className={`incomes-page__status incomes-page__status--${ei.status}`}>
                    {ei.status === 'skipped' ? 'Överhoppad' : 'Mottagen'}
                  </div>
                </div>
                <div className="incomes-page__amount">{formatCurrency(ei.amount)}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(showAddModal || editingIncome) && (
        <RecurringIncomeModal 
          incomeToEdit={editingIncome}
          onClose={() => {
            setShowAddModal(false);
            setEditingIncome(undefined);
          }} 
        />
      )}

      {receivingIncome && (
        <ReceiveIncomeModal
          expectedIncome={receivingIncome}
          onClose={() => setReceivingIncome(undefined)}
          onSuccess={() => setReceivingIncome(undefined)}
        />
      )}
    </div>
  );
}
