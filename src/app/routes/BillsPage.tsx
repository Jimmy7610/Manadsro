import { useState, useMemo } from 'react';
import Card from '../../shared/components/Card';
import { getBills } from '../../storage/services/appDataService';
import { getCategoryEmoji } from '../../features/categories/categoryService';
import { formatCurrency } from '../../shared/utils/currency';
import { formatDate, daysUntil } from '../../shared/utils/date';
import type { Bill } from '../../types/models';
import './BillsPage.css';

/**
 * Månadsro – Räkningssida (Build 2)
 */
export default function BillsPage() {
  const bills = getBills();
  const [activeTab, setActiveTab] = useState<'alla' | 'obetalda' | 'betalda'>('alla');

  // Gruppera räkningar
  const groupedBills = useMemo(() => {
    const groups: Record<string, Bill[]> = {
      overdue: [],
      unpaid: [],
      planned: [],
      paid: [],
    };

    bills.forEach(bill => {
      if (bill.status === 'paid') {
        groups.paid.push(bill);
      } else if (bill.status === 'planned') {
        groups.planned.push(bill);
      } else {
        // unpaid
        const isOverdue = daysUntil(bill.dueDate) < 0;
        if (isOverdue) groups.overdue.push(bill);
        else groups.unpaid.push(bill);
      }
    });

    // Sortera efter datum
    Object.values(groups).forEach(list => {
      list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    });

    return groups;
  }, [bills]);

  const renderBillCard = (bill: Bill) => {
    const days = daysUntil(bill.dueDate);
    const isOverdue = days < 0 && bill.status !== 'paid';

    return (
      <Card key={bill.id} className="bills-page__card">
        <div className="bills-page__card-header">
          <div className="bills-page__card-title">
            <span className="bills-page__emoji">{getCategoryEmoji(bill.categoryId)}</span>
            <span className="bills-page__name">{bill.name}</span>
          </div>
          <div className="bills-page__amount">{formatCurrency(bill.amount)}</div>
        </div>

        <div className="bills-page__card-meta">
          <div className="bills-page__due">
            Förfaller: {formatDate(bill.dueDate)}
            {!isOverdue && bill.status !== 'paid' && (
              <span className="bills-page__days-left"> ({days === 0 ? 'Idag' : `om ${days} d`})</span>
            )}
          </div>
          {bill.isRecurring && <div className="bills-page__recurring">🔄 Återkommande</div>}
        </div>

        {bill.status !== 'paid' && (
          <div className="bills-page__actions">
            <button className="bills-page__btn bills-page__btn--primary" disabled title="Kommer i Build 3">
              Markera betald
            </button>
            <button className="bills-page__btn" disabled title="Kommer i Build 3">
              Ändra datum
            </button>
            <button className="bills-page__btn bills-page__btn--danger" disabled title="Kommer i Build 3">
              Hoppa över
            </button>
          </div>
        )}
      </Card>
    );
  };

  const renderGroup = (title: string, list: Bill[], emptyText: string) => {
    if (activeTab === 'obetalda' && title === 'Betalda') return null;
    if (activeTab === 'betalda' && title !== 'Betalda') return null;

    if (list.length === 0) {
      return (
        <div className="bills-page__group">
          <h3 className="bills-page__group-title">{title} (0)</h3>
          <div className="bills-page__empty">{emptyText}</div>
        </div>
      );
    }

    return (
      <div className="bills-page__group">
        <h3 className="bills-page__group-title">{title} ({list.length})</h3>
        <div className="bills-page__group-list">
          {list.map(renderBillCard)}
        </div>
      </div>
    );
  };

  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-container__title">Räkningar</h1>

      <div className="bills-page__tabs">
        <button 
          className={`bills-page__tab ${activeTab === 'alla' ? 'active' : ''}`}
          onClick={() => setActiveTab('alla')}
        >
          Alla
        </button>
        <button 
          className={`bills-page__tab ${activeTab === 'obetalda' ? 'active' : ''}`}
          onClick={() => setActiveTab('obetalda')}
        >
          Att betala
        </button>
        <button 
          className={`bills-page__tab ${activeTab === 'betalda' ? 'active' : ''}`}
          onClick={() => setActiveTab('betalda')}
        >
          Betalda
        </button>
      </div>

      <div className="bills-page__content">
        {renderGroup('🚨 Försenade', groupedBills.overdue, 'Inga försenade räkningar')}
        {renderGroup('⏳ Obetalda', groupedBills.unpaid, 'Inga obetalda räkningar')}
        {renderGroup('📅 Planerade', groupedBills.planned, 'Inga planerade räkningar')}
        {renderGroup('✅ Betalda', groupedBills.paid, 'Inga betalda räkningar')}
      </div>
    </div>
  );
}
