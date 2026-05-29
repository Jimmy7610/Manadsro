import { useState } from 'react';
import type { Budget } from '../../types/models';
import { useAppData } from '../../storage/services/AppDataContext';
import './BudgetModal.css';

interface BudgetModalProps {
  onClose: () => void;
  budget: Budget;
}

export default function BudgetModal({ onClose, budget }: BudgetModalProps) {
  const { data, updateBudgetLimit, toggleBudgetActive } = useAppData();
  
  const category = data.categories.find(c => c.id === budget.categoryId);
  
  const [limit, setLimit] = useState(budget.monthlyLimit.toString());
  const [active, setActive] = useState(budget.active !== false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (limit.trim() === '') {
      setError('Fyll i alla obligatoriska fält (Budgetgräns).');
      return;
    }

    const limitNum = parseFloat(limit);
    if (isNaN(limitNum) || limitNum < 0) {
      setError('Budgetgränsen måste vara 0 kr eller högre.');
      return;
    }

    updateBudgetLimit(budget.id, limitNum);
    toggleBudgetActive(budget.id, active);
    
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content budget-modal">
        <h2>Redigera budget</h2>
        <p className="budget-modal__category">{category?.emoji} {category?.name}</p>
        
        {error && <div className="budget-modal__error">{error}</div>}

        <div className="budget-modal__field">
          <label>Budgetgräns</label>
          <input 
            type="number" 
            value={limit} 
            onChange={e => setLimit(e.target.value)} 
            placeholder="0"
            min="0"
          />
        </div>

        <div className="budget-modal__field budget-modal__field--checkbox">
          <label>
            <input 
              type="checkbox" 
              checked={active}
              onChange={e => setActive(e.target.checked)}
            />
            Aktiv budget
          </label>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Avbryt</button>
          <button className="btn-save" onClick={handleSubmit}>Spara</button>
        </div>
      </div>
    </div>
  );
}
