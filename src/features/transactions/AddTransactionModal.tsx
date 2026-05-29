import { useState } from 'react';
import { useAppData } from '../../storage/services/AppDataContext';
import './AddTransactionModal.css';

import type { Transaction } from '../../types/models';

interface AddTransactionModalProps {
  type: 'expense' | 'income' | 'bill';
  initialData?: Transaction;
  onClose: () => void;
}

export default function AddTransactionModal({ type, initialData, onClose }: AddTransactionModalProps) {
  const { data, addTransaction, updateTransaction } = useAppData();
  
  const [name, setName] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData ? String(Math.abs(initialData.amount)) : '');
  const [date, setDate] = useState(initialData?.date.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(initialData?.accountId || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [profileId, setProfileId] = useState(initialData?.profileId || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isExpense = type === 'expense' || type === 'bill';
  const isEdit = !!initialData;
  const title = isEdit ? 'Redigera transaktion' : (isExpense ? 'Lägg till köp' : 'Lägg till inkomst');

  const handleSave = () => {
    setError('');
    if (!name.trim()) return setError('Fyll i namn.');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return setError('Belopp måste vara större än 0.');
    if (!date) return setError('Välj ett datum.');
    if (!accountId) return setError('Välj ett konto.');
    if (isExpense && !categoryId) return setError('Välj en kategori.');

    const txData = {
      accountId,
      profileId: profileId || data.settings.activeProfileId,
      type: isExpense ? 'expense' : 'income',
      categoryId: isExpense ? categoryId : '',
      amount: isExpense ? -Math.abs(Number(amount)) : Math.abs(Number(amount)),
      description: name.trim(),
      date,
      comment: comment.trim(),
    } as any;

    if (isEdit) {
      updateTransaction(initialData.id, txData);
      setSuccess('Transaktionen uppdaterades.');
    } else {
      addTransaction({
        ...txData,
        id: `tx-${Date.now()}`,
        householdId: data.household.id,
        isRecurring: false,
        tags: [],
        createdAt: new Date().toISOString()
      });
      setSuccess('Transaktionen sparades.');
    }
    
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
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

            <div className="form-group">
              <label>Namn</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="T.ex. ICA Maxi" />
            </div>

            <div className="form-group">
              <label>Belopp</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" min="1" />
            </div>

            <div className="form-group">
              <label>Datum</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
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

            {isExpense && (
              <div className="form-group">
                <label>Kategori</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  <option value="">Välj kategori...</option>
                  {data.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Tillhör</label>
              <select value={profileId} onChange={e => setProfileId(e.target.value)}>
                <option value="">(Ingen specifik profil)</option>
                {data.profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Kommentar (frivillig)</label>
              <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="Anteckning..." />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>Avbryt</button>
              <button className="btn-save" onClick={handleSave}>Spara</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
