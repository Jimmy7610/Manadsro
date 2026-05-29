import { useState } from 'react';
import type { RecurringIncome } from '../../types/models';
import { useAppData } from '../../storage/services/AppDataContext';
import './RecurringIncomeModal.css';

interface RecurringIncomeModalProps {
  onClose: () => void;
  incomeToEdit?: RecurringIncome;
}

export default function RecurringIncomeModal({ onClose, incomeToEdit }: RecurringIncomeModalProps) {
  const { data, addRecurringIncome, updateRecurringIncome } = useAppData();
  
  const [name, setName] = useState(incomeToEdit?.name || '');
  const [amount, setAmount] = useState(incomeToEdit?.amount?.toString() || '');
  const [expectedDay, setExpectedDay] = useState(incomeToEdit?.expectedDay?.toString() || '25');
  const [accountId, setAccountId] = useState(incomeToEdit?.accountId || data.accounts[0]?.id || '');
  const [profileId, setProfileId] = useState(incomeToEdit?.profileId || data.settings.activeProfileId || data.profiles[0]?.id || '');
  const [recurrence, setRecurrence] = useState<'monthly' | 'quarterly' | 'yearly'>(incomeToEdit?.recurrence || 'monthly');
  const [active, setActive] = useState(incomeToEdit ? incomeToEdit.active : true);
  const [note, setNote] = useState(incomeToEdit?.note || '');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Namn krävs.');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Belopp måste vara större än 0.');
      return;
    }

    const dayNum = parseInt(expectedDay, 10);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      setError('Förväntad dag måste vara mellan 1 och 31.');
      return;
    }

    if (!accountId) {
      setError('Konto krävs.');
      return;
    }

    if (!profileId) {
      setError('Tillhör/profil krävs.');
      return;
    }

    if (incomeToEdit) {
      updateRecurringIncome(incomeToEdit.id, {
        name: name.trim(),
        amount: amountNum,
        expectedDay: dayNum,
        accountId,
        profileId,
        recurrence,
        active,
        note: note.trim()
      });
    } else {
      addRecurringIncome({
        id: `inc-${Date.now()}`,
        name: name.trim(),
        amount: amountNum,
        expectedDay: dayNum,
        accountId,
        profileId,
        recurrence,
        active,
        note: note.trim(),
        createdAt: new Date().toISOString()
      });
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content income-modal">
        <h2>{incomeToEdit ? 'Redigera återkommande inkomst' : 'Lägg till återkommande inkomst'}</h2>
        
        {error && <div className="income-modal__error">{error}</div>}

        <div className="income-modal__field">
          <label>Namn *</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="T.ex. Lön"
          />
        </div>

        <div className="income-modal__field">
          <label>Belopp *</label>
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            placeholder="0"
          />
        </div>

        <div className="income-modal__field">
          <label>Förväntad dag (1-31) *</label>
          <input 
            type="number" 
            min="1"
            max="31"
            value={expectedDay} 
            onChange={e => setExpectedDay(e.target.value)} 
          />
        </div>

        <div className="income-modal__field">
          <label>Konto *</label>
          <select value={accountId} onChange={e => setAccountId(e.target.value)}>
            <option value="">Välj konto...</option>
            {data.accounts.filter(a => !a.archived).map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="income-modal__field">
          <label>Tillhör *</label>
          <select value={profileId} onChange={e => setProfileId(e.target.value)}>
            <option value="">Välj profil...</option>
            {data.profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name} {p.emoji}</option>
            ))}
          </select>
        </div>

        <div className="income-modal__field">
          <label>Upprepas</label>
          <select value={recurrence} onChange={e => setRecurrence(e.target.value as any)}>
            <option value="monthly">Varje månad</option>
            <option value="quarterly">Varje kvartal</option>
            <option value="yearly">Varje år</option>
          </select>
        </div>

        <div className="income-modal__field income-modal__field--checkbox">
          <label>
            <input 
              type="checkbox" 
              checked={active}
              onChange={e => setActive(e.target.checked)}
            />
            Aktiv inkomst
          </label>
        </div>

        <div className="income-modal__field">
          <label>Anteckning</label>
          <input 
            type="text" 
            value={note} 
            onChange={e => setNote(e.target.value)} 
            placeholder="Frivillig anteckning"
          />
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Avbryt</button>
          <button className="btn-save" onClick={handleSubmit}>Spara</button>
        </div>
      </div>
    </div>
  );
}
