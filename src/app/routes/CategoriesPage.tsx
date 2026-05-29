import { useState } from 'react';
import { useAppData } from '../../storage/services/AppDataContext';
import { getActiveCategories, getCategoryUsage } from '../../features/categories/categoryService';
import CategoryModal from '../../features/categories/CategoryModal';
import Card from '../../shared/components/Card';
import type { Category } from '../../types/models';
import './CategoriesPage.css';

export default function CategoriesPage() {
  const { data, deactivateCategory, reactivateCategory } = useAppData();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deactivateConfirm, setDeactivateConfirm] = useState<Category | null>(null);

  const activeCategories = getActiveCategories(data.categories);
  const inactiveCategories = data.categories.filter(c => c.active === false);

  const handleDeactivate = (category: Category) => {
    setDeactivateConfirm(category);
  };

  const confirmDeactivate = () => {
    if (deactivateConfirm) {
      deactivateCategory(deactivateConfirm.id);
      setDeactivateConfirm(null);
    }
  };

  const renderCategoryCard = (category: Category) => {
    const usage = getCategoryUsage(category.id, data);
    const budget = data.budgets.find(b => b.categoryId === category.id);
    const isInactive = category.active === false;

    return (
      <Card key={category.id} className={`categories-page__card ${isInactive ? 'inactive' : ''}`}>
        <div className="categories-page__card-header">
          <div className="categories-page__icon" style={{ backgroundColor: `${category.color}33`, color: category.color }}>
            {category.icon || category.emoji || '📦'}
          </div>
          <h3 className="categories-page__name">{category.name}</h3>
        </div>
        
        <div className="categories-page__info">
          {budget ? <span>Budget: {budget.monthlyLimit} kr</span> : <span>Ingen budget satt</span>}
          <span>Används i: {usage.total} poster</span>
        </div>

        <div className="categories-page__actions">
          <button className="categories-page__btn" onClick={() => setEditingCategory(category)}>
            Redigera
          </button>
          
          {isInactive ? (
            <button className="categories-page__btn" onClick={() => reactivateCategory(category.id)}>
              Aktivera
            </button>
          ) : (
            <button 
              className="categories-page__btn categories-page__btn--danger" 
              onClick={() => handleDeactivate(category)}
              disabled={category.system}
              title={category.system ? "Systemkategorier kan inte inaktiveras" : "Inaktivera kategori"}
            >
              Inaktivera
            </button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="categories-page page-container">
      <div className="categories-page__header">
        <h1 className="categories-page__title">Kategorier</h1>
        <button className="categories-page__btn-add" onClick={() => setIsAdding(true)}>
          + Lägg till kategori
        </button>
      </div>

      <h2 className="categories-page__section-title">Aktiva kategorier ({activeCategories.length})</h2>
      <div className="categories-page__grid">
        {activeCategories.map(renderCategoryCard)}
      </div>

      {inactiveCategories.length > 0 && (
        <>
          <h2 className="categories-page__section-title">Inaktiva kategorier ({inactiveCategories.length})</h2>
          <div className="categories-page__grid">
            {inactiveCategories.map(renderCategoryCard)}
          </div>
        </>
      )}

      {(isAdding || editingCategory) && (
        <CategoryModal 
          category={editingCategory || undefined}
          onClose={() => {
            setIsAdding(false);
            setEditingCategory(null);
          }}
        />
      )}

      {deactivateConfirm && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{maxWidth: '400px', textAlign: 'center'}}>
            <h2>Vill du inaktivera den här kategorin?</h2>
            <p style={{marginBottom: '1rem', color: 'var(--text-secondary)'}}>
              Den kommer inte längre visas som standardval i nya formulär.
            </p>
            {getCategoryUsage(deactivateConfirm.id, data).total > 0 && (
              <p style={{color: '#c62828', background: '#ffebee', padding: '8px', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem'}}>
                Kategorin används redan i befintlig data. Därför tas den inte bort permanent, utan historiken finns kvar.
              </p>
            )}
            <div className="modal-actions" style={{marginTop: '1.5rem'}}>
              <button className="btn-cancel" onClick={() => setDeactivateConfirm(null)}>Avbryt</button>
              <button className="btn-save" style={{background: '#c62828'}} onClick={confirmDeactivate}>Inaktivera</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
