import { useState, useMemo } from 'react';
import Card from '../../shared/components/Card';
import { getCategoryEmoji, getCategoryName } from '../../features/categories/categoryService';
import { formatCurrency } from '../../shared/utils/currency';
import { formatDate, daysUntil } from '../../shared/utils/date';
import type { Bill } from '../../types/models';
import { useAppData } from '../../storage/services/AppDataContext';
import PayBillModal from '../../features/bills/PayBillModal';
import BillModal from '../../features/bills/BillModal';
import './BillsPage.css';

/**
 * Månadsro – Räkningssida (Build 8)
 */
export default function BillsPage() {
  const { data, skipBill } = useAppData();
  const bills = data.bills;
  const [activeTab, setActiveTab] = useState<'alla' | 'obetalda' | 'betalda' | 'hoppade'>('alla');
  const [payingBill, setPayingBill] = useState<Bill | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | undefined>(undefined);
  const [showBillModal, setShowBillModal] = useState(false);
  const [message, setMessage] = useState('');

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const currentMonthKey = new Date().toISOString().substring(0, 7); // 'YYYY-MM'

  // Gruppera räkningar
  const groupedBills = useMemo(() => {
    const groups: Record<string, Bill[]> = {
      overdue: [],
      unpaid: [],
      planned: [],
      paid: [],
      skipped: [],
      recurring: [],
    };

    bills.forEach(bill => {
      const isRecurring = bill.recurring || bill.isRecurring;
      
      if (bill.status === 'skipped' || bill.skippedForMonth === currentMonthKey) {
        groups.skipped.push(bill);
      } else if (bill.status === 'paid') {
        groups.paid.push(bill);
      } else if (bill.status === 'planned') {
        groups.planned.push(bill);
      } else {
        // unpaid
        const isOverdue = daysUntil(bill.dueDate) < 0;
        if (isOverdue) groups.overdue.push(bill);
        else groups.unpaid.push(bill);
      }
      
      if (isRecurring && bill.status !== 'skipped' && bill.skippedForMonth !== currentMonthKey) {
        groups.recurring.push(bill);
      }
    });

    // Sortera efter datum
    Object.values(groups).forEach(list => {
      list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    });

    return groups;
  }, [bills, currentMonthKey]);

  const handleSkip = (bill: Bill) => {
    if (window.confirm('Vill du hoppa över den här räkningen för månaden?\nDen markeras som hoppad över och räknas inte som kommande räkning den här månaden.')) {
      skipBill(bill.id, currentMonthKey);
      showToast('Räkningen hoppades över för månaden.');
    }
  };

  const openAddModal = () => {
    setEditingBill(undefined);
    setShowBillModal(true);
  };

  const openEditModal = (bill: Bill) => {
    setEditingBill(bill);
    setShowBillModal(true);
  };

  const closeBillModal = () => {
    setShowBillModal(false);
    showToast('Räkningen sparades.');
  };

  const renderBillCard = (bill: Bill) => {
    const days = daysUntil(bill.dueDate);
    const isOverdue = days < 0 && bill.status !== 'paid' && bill.status !== 'skipped' && bill.skippedForMonth !== currentMonthKey;
    const isSkipped = bill.status === 'skipped' || bill.skippedForMonth === currentMonthKey;
    const isRecurring = bill.recurring || bill.isRecurring;

    return (
      <Card key={bill.id} className={`bills-page__card ${isSkipped ? 'bills-page__card--skipped' : ''}`}>
        <div className="bills-page__card-header">
          <div className="bills-page__card-title">
            <span className="bills-page__emoji">{getCategoryEmoji(bill.categoryId)}</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="bills-page__name">{bill.name}</span>
              <span className="bills-page__category-name">{getCategoryName(bill.categoryId)}</span>
            </div>
          </div>
          <div className="bills-page__amount">{formatCurrency(bill.amount)}</div>
        </div>

        <div className="bills-page__card-meta">
          <div className="bills-page__due">
            Förfaller: {formatDate(bill.dueDate)}
            {!isOverdue && bill.status !== 'paid' && !isSkipped && (
              <span className="bills-page__days-left"> ({days === 0 ? 'Idag' : `om ${days} d`})</span>
            )}
            {isSkipped && <span className="bills-page__days-left"> (Hoppade över)</span>}
          </div>
          {isRecurring && <div className="bills-page__recurring">🔄 {bill.recurrence === 'yearly' ? 'Varje år' : bill.recurrence === 'quarterly' ? 'Varje kvartal' : 'Varje månad'}</div>}
        </div>

        {bill.status !== 'paid' && !isSkipped && (
          <div className="bills-page__actions">
            <button className="bills-page__btn bills-page__btn--primary" onClick={() => setPayingBill(bill)}>
              Markera som betald
            </button>
            <button className="bills-page__btn" onClick={() => openEditModal(bill)}>
              Redigera
            </button>
            <button className="bills-page__btn" onClick={() => handleSkip(bill)}>
              Hoppa över
            </button>
          </div>
        )}
        
        {isSkipped && (
          <div className="bills-page__actions">
             <button className="bills-page__btn" onClick={() => openEditModal(bill)}>
              Redigera
            </button>
          </div>
        )}
      </Card>
    );
  };

  const renderGroup = (title: string, list: Bill[], emptyText: string, requireTab?: string) => {
    if (requireTab && activeTab !== requireTab && activeTab !== 'alla') return null;

    if (list.length === 0) {
      if (activeTab === 'alla' && title !== '🚨 Försenade' && title !== '⏳ Obetalda') return null; // Hide empty in 'alla' unless important
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
      <div className="bills-page__header">
        <h1 className="page-container__title">Räkningar</h1>
        <button className="bills-page__add-btn" onClick={openAddModal}>
          Lägg till räkning
        </button>
      </div>

      {message && <div className="bills-page__toast">{message}</div>}

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
        <button 
          className={`bills-page__tab ${activeTab === 'hoppade' ? 'active' : ''}`}
          onClick={() => setActiveTab('hoppade')}
        >
          Hoppade över
        </button>
      </div>

      <div className="bills-page__content">
        {renderGroup('🚨 Försenade', groupedBills.overdue, 'Inga försenade räkningar', 'obetalda')}
        {renderGroup('⏳ Obetalda', groupedBills.unpaid, 'Inga obetalda räkningar', 'obetalda')}
        {renderGroup('📅 Planerade', groupedBills.planned, 'Inga planerade räkningar', 'obetalda')}
        {renderGroup('✅ Betalda', groupedBills.paid, 'Inga betalda räkningar', 'betalda')}
        {renderGroup('⏭️ Hoppade över', groupedBills.skipped, 'Inga räkningar hoppades över', 'hoppade')}
      </div>

      {payingBill && (
        <PayBillModal 
          bill={payingBill} 
          onClose={() => setPayingBill(null)} 
        />
      )}

      {showBillModal && (
        <BillModal 
          billToEdit={editingBill}
          onClose={closeBillModal}
        />
      )}
    </div>
  );
}
