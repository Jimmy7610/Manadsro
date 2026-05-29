import { useState } from 'react';
import type { ExpectedIncome } from '../../types/models';
import { useAppData } from '../../storage/services/AppDataContext';
import './ReceiveIncomeModal.css';

interface ReceiveIncomeModalProps {
  expectedIncome: ExpectedIncome;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReceiveIncomeModal({ expectedIncome, onClose, onSuccess }: ReceiveIncomeModalProps) {
  const { data, markIncomeAsReceived } = useAppData();
  
  const [amount, setAmount] = useState(expectedIncome.amount.toString());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(expectedIncome.accountId || data.accounts[0]?.id || '');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Belopp måste vara större än 0.');
      return;
    }

    if (!accountId) {
      setError('Konto krävs.');
      return;
    }

    if (!date) {
      setError('Datum krävs.');
      return;
    }

    markIncomeAsReceived(expectedIncome.id, {
      amount: amountNum,
      accountId,
      date,
      comment: comment.trim()
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content receive-income-modal">
        <h2>Ta emot inkomst</h2>
        
        {error && <div className="receive-income-modal__error">{error}</div>}

        <div className="receive-income-modal__info">
          Du markerar <strong>{expectedIncome.name}</strong> som mottagen. 
          Detta skapar en inkomsttransaktion som ökar saldot på valt konto.
        </div>

        <div className="receive-income-modal__field">
          <label>Faktiskt belopp *</label>
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
          />
        </div>

        <div className="receive-income-modal__field">
          <label>Datum *</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
          />
        </div>

        <div className="receive-income-modal__field">
          <label>Insatt på konto *</label>
          <select value={accountId} onChange={e => setAccountId(e.target.value)}>
            {data.accounts.filter(a => !a.archived).map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="receive-income-modal__field">
          <label>Anteckning (frivillig)</label>
          <input 
            type="text" 
            value={comment} 
            onChange={e => setComment(e.target.value)} 
            placeholder="T.ex. Inkluderade bonus"
          />
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Avbryt</button>
          <button className="btn-save" onClick={handleSubmit}>Spara inkomst</button>
        </div>
      </div>
    </div>
  );
}
