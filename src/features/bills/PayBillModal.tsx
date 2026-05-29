import { useState } from 'react';
import { useAppData } from '../../storage/services/AppDataContext';
import type { Bill } from '../../types/models';
import './PayBillModal.css';

interface PayBillModalProps {
  bill: Bill;
  onClose: () => void;
}

export default function PayBillModal({ bill, onClose }: PayBillModalProps) {
  const { data, payBill } = useAppData();
  
  const [amount, setAmount] = useState(String(bill.amount));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(bill.accountId || '');
  const [categoryId, setCategoryId] = useState(bill.categoryId || '');
  const [comment, setComment] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = () => {
    setError('');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return setError('Belopp måste vara större än 0.');
    if (!date) return setError('Välj ett datum.');
    if (!accountId) return setError('Välj ett konto.');
    if (!categoryId) return setError('Välj en kategori.');

    payBill(bill.id, {
      amount: Number(amount),
      accountId,
      date,
      categoryId,
      comment: comment.trim()
    });

    setSuccess('Räkningen markerades som betald.');
    
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Betala räkning</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {success ? (
          <div className="modal-success">
            <span className="modal-success-icon">✅</span>
            <p>{success}</p>
          </div>
        ) : (
          <div className="modal-body">
            {error && <div className="modal-error">{error}</div>}

            <div className="pay-bill-meta">
              <strong>{bill.name}</strong>
              Förfaller: {bill.dueDate}
            </div>

            <div className="form-group">
              <label>Belopp</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="1" />
            </div>

            <div className="form-group">
              <label>Konto</label>
              <select value={accountId} onChange={e => setAccountId(e.target.value)}>
                <option value="">Välj konto...</option>
                {data.accounts.filter(a => a.isActive).map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Datum</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Kategori</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">Välj kategori...</option>
                {data.categories.map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Kommentar (frivillig)</label>
              <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="Anteckning..." />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>Avbryt</button>
              <button className="btn-save" onClick={handleSave}>Skapa betalning</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
