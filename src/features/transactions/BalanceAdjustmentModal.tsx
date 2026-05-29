import { useState } from 'react';
import { useAppData } from '../../storage/services/AppDataContext';
import { calculateAccountBalance } from '../../shared/utils/calculations';
import './BalanceAdjustmentModal.css';

interface BalanceAdjustmentModalProps {
  initialAccountId?: string;
  onClose: () => void;
}

export default function BalanceAdjustmentModal({ initialAccountId, onClose }: BalanceAdjustmentModalProps) {
  const { data, createBalanceAdjustment } = useAppData();
  const activeAccounts = data.accounts.filter(a => a.isActive && !a.archived);

  const [accountId, setAccountId] = useState(initialAccountId || (activeAccounts.length > 0 ? activeAccounts[0].id : ''));
  const [realBalanceStr, setRealBalanceStr] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [note, setNote] = useState('');

  const currentCalculatedBalance = accountId 
    ? calculateAccountBalance(accountId, data.accounts, data.transactions) 
    : 0;

  const realBalance = parseFloat(realBalanceStr);
  const isRealBalanceValid = !isNaN(realBalance);
  const difference = isRealBalanceValid ? realBalance - currentCalculatedBalance : 0;

  const handleSave = () => {
    if (!accountId || !isRealBalanceValid || !date || difference === 0) return;
    
    createBalanceAdjustment(accountId, realBalance, `${date}T12:00:00Z`, note);
    alert('Saldojustering skapades.');
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content balance-modal">
        <h2>Justera saldo</h2>
        
        <p className="balance-modal__help">
          Saldojustering skapar en separat transaktion som rättar kontots saldo. Den ändrar inte startsaldot.
        </p>

        <div className="balance-modal__form">
          <div className="form-group">
            <label>Konto</label>
            <select 
              value={accountId} 
              onChange={e => setAccountId(e.target.value)}
              className="balance-modal__input"
            >
              <option value="" disabled>Välj konto</option>
              {activeAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Beräknat saldo i Månadsro</label>
            <input 
              type="text" 
              value={currentCalculatedBalance.toString()} 
              readOnly 
              className="balance-modal__input balance-modal__input--readonly"
            />
          </div>

          <div className="form-group">
            <label>Verkligt saldo</label>
            <input 
              type="number" 
              step="0.01"
              value={realBalanceStr} 
              onChange={e => setRealBalanceStr(e.target.value)}
              placeholder="Ex: 12450"
              className="balance-modal__input"
            />
          </div>

          <div className="form-group">
            <label>Skillnad</label>
            <div className={`balance-modal__diff ${difference > 0 ? 'positive' : difference < 0 ? 'negative' : 'neutral'}`}>
              {difference > 0 ? '+' : ''}{difference.toFixed(2)} kr
            </div>
          </div>

          <div className="form-group">
            <label>Datum</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="balance-modal__input"
            />
          </div>

          <div className="form-group">
            <label>Anteckning (frivillig)</label>
            <input 
              type="text" 
              value={note} 
              onChange={e => setNote(e.target.value)}
              placeholder="Ex: Justerat enligt bankutdrag"
              className="balance-modal__input"
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Avbryt</button>
          <button 
            className="btn-save" 
            onClick={handleSave}
            disabled={!accountId || !isRealBalanceValid || difference === 0 || !date}
          >
            Skapa saldojustering
          </button>
        </div>
      </div>
    </div>
  );
}
