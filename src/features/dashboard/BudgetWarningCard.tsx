import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import { formatCurrency } from '../../shared/utils/currency';
import type { DashboardInsights } from './dashboardInsightsService';
import './BudgetWarningCard.css';

interface BudgetWarningCardProps {
  insights: DashboardInsights;
}

export default function BudgetWarningCard({ insights }: BudgetWarningCardProps) {
  const navigate = useNavigate();
  const warning = insights.strongestBudgetWarning;

  return (
    <Card className="budget-warning-card">
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Budgetvarning</h3>
      
      {!warning ? (
        <div className="budget-warning-card__empty">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          Budgetläget ser lugnt ut.
        </div>
      ) : (
        <div className="budget-warning-card__content">
          <div className="budget-warning-card__icon">⚠️</div>
          <div className="budget-warning-card__name">{warning.categoryName}</div>
          
          <div className={`budget-warning-card__status ${warning.status}`}>
            {warning.status === 'over' ? 'Över budget' : 'Nära gränsen'}
          </div>
          
          <div className="budget-warning-card__details">
            {formatCurrency(warning.spent)} av {formatCurrency(warning.limit)}
          </div>
          
          <div className="budget-warning-card__footer">
            <button 
              className="btn-outline" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: '100%' }}
              onClick={() => navigate('/budget')}
            >
              Öppna budget
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
