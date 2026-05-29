import { useState, useEffect } from 'react';
import type { Category } from '../../types/models';
import { useAppData } from '../../storage/services/AppDataContext';
import { getCategoryUsage } from './categoryService';
import './CategoryModal.css';

interface CategoryModalProps {
  onClose: () => void;
  category?: Category; // If provided, we are editing
}

const ICONS = ['🏠', '🍽️', '🚗', '🛡️', '📱', '👶', '🐾', '💰', '🎉', '🩺', '👕', '📦'];
const COLORS = ['#5B8C6F', '#E8A87C', '#6886A0', '#8B7EC8', '#4A9B9B', '#D4A574', '#A0785A', '#5FAD7A', '#C96B8C', '#D4726A', '#7B9EA8', '#9E9E9E'];

export default function CategoryModal({ onClose, category }: CategoryModalProps) {
  const { data, addCategory, updateCategory, createBudgetForCategory, updateBudgetForCategory } = useAppData();
  
  const [name, setName] = useState(category?.name || '');
  const [icon, setIcon] = useState(category?.icon || category?.emoji || ICONS[0]);
  const [color, setColor] = useState(category?.color || COLORS[0]);
  const [active, setActive] = useState(category?.active !== false); // default true

  // Budget
  const existingBudget = category ? data.budgets.find(b => b.categoryId === category.id) : undefined;
  const [createBudget, setCreateBudget] = useState(!!existingBudget);
  const [budgetLimit, setBudgetLimit] = useState(existingBudget ? existingBudget.monthlyLimit.toString() : '');

  const [error, setError] = useState('');
  const [usageWarning, setUsageWarning] = useState('');

  useEffect(() => {
    if (category && category.active !== false && !active) {
      const usage = getCategoryUsage(category.id, data);
      if (usage.total > 0) {
        setUsageWarning(`Kategorin används i ${usage.total} poster (transaktioner, räkningar, budgetar). Den kan inaktiveras, men historiken finns kvar.`);
      } else {
        setUsageWarning('');
      }
    } else {
      setUsageWarning('');
    }
  }, [active, category, data]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Kategorinamn är obligatoriskt.');
      return;
    }

    // Check duplicate name
    const duplicate = data.categories.find(c => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== category?.id && c.active !== false);
    if (duplicate) {
      setError('En aktiv kategori med det namnet finns redan.');
      return;
    }

    if (createBudget && budgetLimit !== '') {
      const parsedLimit = parseFloat(budgetLimit);
      if (isNaN(parsedLimit) || parsedLimit < 0) {
        setError('Budgetgräns måste vara 0 eller högre.');
        return;
      }
    }

    if (category) {
      updateCategory(category.id, {
        name: name.trim(),
        emoji: icon,
        icon: icon,
        color: color,
        active: active
      });

      if (createBudget) {
        if (existingBudget) {
          updateBudgetForCategory(category.id, { monthlyLimit: parseFloat(budgetLimit) || 0 });
        } else {
          createBudgetForCategory(category.id, parseFloat(budgetLimit) || 0);
        }
      }
    } else {
      const newCatId = `cat-local-${Date.now()}`;
      addCategory({
        id: newCatId,
        householdId: data.household.id,
        name: name.trim(),
        emoji: icon,
        icon: icon,
        color: color,
        sortOrder: data.categories.length,
        isDefault: false,
        active: active,
        system: false,
      });

      if (createBudget) {
        // AppContext expects category ID immediately, but React state update is async. 
        // We're mutating via context, so the category might not be fully propagated before we add budget?
        // Actually, createBudgetForCategory just pushes to budget array, it relies on ID string.
        createBudgetForCategory(newCatId, parseFloat(budgetLimit) || 0);
      }
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{maxWidth: '450px'}}>
        <h2>{category ? 'Redigera kategori' : 'Lägg till kategori'}</h2>
        
        {error && <div className="settings-page__error" style={{color: '#c62828', background: '#ffebee', padding: '8px', marginBottom: '16px', borderRadius: '4px'}}>{error}</div>}

        <div className="category-modal__grid">
          <div>
            <label className="category-modal__label">Kategorinamn</label>
            <input 
              type="text" 
              className="category-modal__input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="T.ex. Fika"
              disabled={category?.system}
            />
            {category?.system && <span className="category-modal__label" style={{marginTop: 4}}>Systemkategorier kan inte byta namn.</span>}
          </div>

          <div>
            <label className="category-modal__label">Ikon</label>
            <div className="category-modal__icon-grid">
              {ICONS.map(i => (
                <button 
                  key={i} 
                  className={`category-modal__icon-btn ${icon === i ? 'selected' : ''}`}
                  onClick={() => setIcon(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="category-modal__label">Färg</label>
            <div className="category-modal__color-grid">
              {COLORS.map(c => (
                <button 
                  key={c} 
                  className={`category-modal__color-btn ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {!category?.system && (
            <label className="category-modal__checkbox-container">
              <input 
                type="checkbox" 
                className="category-modal__checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
              />
              <span style={{color: 'var(--text-primary)'}}>Aktiv kategori</span>
            </label>
          )}

          {usageWarning && !active && (
            <div className="category-modal__warning">{usageWarning}</div>
          )}

          <div style={{marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px'}}>
            <label className="category-modal__checkbox-container" style={{marginTop: 0, marginBottom: '16px'}}>
              <input 
                type="checkbox" 
                className="category-modal__checkbox"
                checked={createBudget}
                onChange={e => setCreateBudget(e.target.checked)}
              />
              <span style={{color: 'var(--text-primary)'}}>Skapa budget</span>
            </label>

            {createBudget && (
              <div>
                <label className="category-modal__label">Budgetgräns (kr)</label>
                <input 
                  type="number" 
                  className="category-modal__input"
                  value={budgetLimit}
                  onChange={e => setBudgetLimit(e.target.value)}
                  placeholder="0"
                />
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Avbryt</button>
          <button className="btn-save" onClick={handleSave}>Spara</button>
        </div>
      </div>
    </div>
  );
}
