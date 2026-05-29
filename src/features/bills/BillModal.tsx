import { useState } from 'react';
import type { Bill } from '../../types/models';
import { useAppData } from '../../storage/services/AppDataContext';
import { getCategoryDisplay } from '../categories/categoryService';
import './BillModal.css';

interface BillModalProps {
  onClose: () => void;
  billToEdit?: Bill;
}

export default function BillModal({ onClose, billToEdit }: BillModalProps) {
  const { data, addBill, updateBill } = useAppData();
  
  const [name, setName] = useState(billToEdit?.name || '');
  const [amount, setAmount] = useState(billToEdit?.amount?.toString() || '');
  const [dueDate, setDueDate] = useState(billToEdit?.dueDate || new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState(billToEdit?.categoryId || data.categories[0]?.id || '');
  const [accountId, setAccountId] = useState(billToEdit?.accountId || '');
  const [profileId, setProfileId] = useState(billToEdit?.profileId || data.settings.activeProfileId || data.profiles[0]?.id || '');
  const [recurring, setRecurring] = useState(billToEdit?.recurring || billToEdit?.isRecurring || false);
  const [recurrence, setRecurrence] = useState<'monthly' | 'quarterly' | 'yearly' | 'none'>(billToEdit?.recurrence || 'monthly');
  const [note, setNote] = useState(billToEdit?.note || '');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Fyll i alla obligatoriska fält (Namn).');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Belopp måste vara större än 0.');
      return;
    }

    if (!dueDate) {
      setError('Förfallodatum saknas.');
      return;
    }

    if (!categoryId) {
      setError('Kategori saknas.');
      return;
    }

    if (billToEdit) {
      updateBill(billToEdit.id, {
        name: name.trim(),
        amount: amountNum,
        dueDate,
        categoryId,
        accountId: accountId || undefined,
        profileId: profileId || undefined,
        recurring,
        recurrence: recurring ? recurrence : 'none',
        note: note.trim()
      });
    } else {
      addBill({
        id: `bill-${Date.now()}`,
        householdId: data.household.id,
        categoryId,
        name: name.trim(),
        amount: amountNum,
        dueDate,
        status: 'unpaid',
        accountId: accountId || undefined,
        profileId: profileId || undefined,
        recurring,
        recurrence: recurring ? recurrence : 'none',
        note: note.trim(),
        createdAt: new Date().toISOString()
      });
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content bill-modal">
        <h2>{billToEdit ? 'Redigera räkning' : 'Lägg till räkning'}</h2>
        
        {error && <div className="bill-modal__error">{error}</div>}

        <div className="bill-modal__field">
          <label>Namn *</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="T.ex. Elräkning"
          />
        </div>

        <div className="bill-modal__field">
          <label>Belopp *</label>
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            placeholder="0"
          />
        </div>

        <div className="bill-modal__field">
          <label>Förfallodatum *</label>
          <input 
            type="date" 
            value={dueDate} 
            onChange={e => setDueDate(e.target.value)} 
          />
        </div>

        <div className="bill-modal__field">
          <label>Kategori *</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            {data.categories
              .filter(c => c.active !== false || c.id === billToEdit?.categoryId)
              .map(c => {
                const display = getCategoryDisplay(c);
                return <option key={c.id} value={c.id}>{display.icon} {display.name}</option>;
              })}
          </select>
        </div>

        <div className="bill-modal__field">
          <label>Konto (Frivilligt)</label>
          <select value={accountId} onChange={e => setAccountId(e.target.value)}>
            <option value="">Välj konto...</option>
            {data.accounts.filter(a => !a.archived).map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="bill-modal__field">
          <label>Tillhör</label>
          <select value={profileId} onChange={e => setProfileId(e.target.value)}>
            <option value="">Ingen specifik</option>
            {data.profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name} {p.emoji}</option>
            ))}
          </select>
        </div>

        <div className="bill-modal__field bill-modal__field--checkbox">
          <label>
            <input 
              type="checkbox" 
              checked={recurring}
              onChange={e => setRecurring(e.target.checked)}
            />
            Återkommande räkning
          </label>
        </div>

        {recurring && (
          <div className="bill-modal__field">
            <label>Upprepas</label>
            <select value={recurrence} onChange={e => setRecurrence(e.target.value as any)}>
              <option value="monthly">Varje månad</option>
              <option value="quarterly">Varje kvartal</option>
              <option value="yearly">Varje år</option>
            </select>
          </div>
        )}

        <div className="bill-modal__field">
          <label>Anteckning (frivillig)</label>
          <input 
            type="text" 
            value={note} 
            onChange={e => setNote(e.target.value)} 
            placeholder="T.ex. Autogiro"
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
