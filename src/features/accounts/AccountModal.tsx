import { useState } from 'react';
import type { Account, AccountType } from '../../types/models';
import { useAppData } from '../../storage/services/AppDataContext';
import './AccountModal.css';

interface AccountModalProps {
  onClose: () => void;
  accountToEdit?: Account;
}

export default function AccountModal({ onClose, accountToEdit }: AccountModalProps) {
  const { data, addAccount, updateAccount } = useAppData();
  
  const [name, setName] = useState(accountToEdit?.name || '');
  const [type, setType] = useState<AccountType>(accountToEdit?.type || 'checking');
  const [profileId, setProfileId] = useState(accountToEdit?.profileId || data.profiles[0]?.id || '');
  const [initialBalance, setInitialBalance] = useState(accountToEdit?.initialBalance?.toString() || '0');
  const [note, setNote] = useState(accountToEdit?.note || '');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Fyll i alla obligatoriska fält (Kontonamn).');
      return;
    }

    const balanceNum = parseFloat(initialBalance);
    if (isNaN(balanceNum)) {
      setError('Startsaldo måste vara en giltig siffra.');
      return;
    }

    if (accountToEdit) {
      updateAccount(accountToEdit.id, {
        name: name.trim(),
        type,
        profileId,
        initialBalance: balanceNum,
        note: note.trim()
      });
    } else {
      addAccount({
        id: `acc-${Date.now()}`,
        householdId: data.household.id,
        profileId,
        name: name.trim(),
        type,
        initialBalance: balanceNum,
        currency: 'SEK',
        sortOrder: data.accounts.length,
        isActive: true,
        archived: false,
        note: note.trim(),
        createdAt: new Date().toISOString()
      });
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content account-modal">
        <h2>{accountToEdit ? 'Redigera konto' : 'Lägg till konto'}</h2>
        
        {error && <div className="account-modal__error">{error}</div>}

        <div className="account-modal__field">
          <label>Kontonamn *</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="T.ex. ICA-kortet"
          />
        </div>

        <div className="account-modal__field">
          <label>Kontotyp</label>
          <select value={type} onChange={e => setType(e.target.value as AccountType)}>
            <option value="checking">Lönekonto / Vardag</option>
            <option value="savings">Sparkonto</option>
            <option value="buffer">Buffert</option>
            <option value="shared">Gemensamt</option>
            <option value="other">Annat</option>
          </select>
        </div>

        <div className="account-modal__field">
          <label>Tillhör</label>
          <select value={profileId} onChange={e => setProfileId(e.target.value)}>
            {data.profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name} {p.emoji}</option>
            ))}
          </select>
        </div>

        <div className="account-modal__field">
          <label>Startsaldo</label>
          <input 
            type="number" 
            value={initialBalance} 
            onChange={e => setInitialBalance(e.target.value)} 
            placeholder="0"
          />
          {accountToEdit && (
            <p className="account-modal__helper">
              Startsaldot påverkar kontots beräknade saldo. Använd saldojustering om du bara vill rätta dagens saldo.
            </p>
          )}
        </div>

        <div className="account-modal__field">
          <label>Anteckning (frivillig)</label>
          <input 
            type="text" 
            value={note} 
            onChange={e => setNote(e.target.value)} 
            placeholder="T.ex. Ränta 2.5%"
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
