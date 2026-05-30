import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import { formatCurrency } from '../../shared/utils/currency';
import type { DashboardInsights } from './dashboardInsightsService';
import './BiggestCategoryCard.css';

interface BiggestCategoryCardProps {
  insights: DashboardInsights;
}

export default function BiggestCategoryCard({ insights }: BiggestCategoryCardProps) {
  const navigate = useNavigate();
  const cat = insights.biggestCategory;

  return (
    <Card className="biggest-category-card">
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Största utgiftskategori</h3>
      
      {!cat ? (
        <div className="biggest-category-card__empty">
          Inga kategoriserade utgifter ännu.
        </div>
      ) : (
        <div className="biggest-category-card__content">
          <div className="biggest-category-card__icon">{cat.categoryIcon}</div>
          <div className="biggest-category-card__name">{cat.categoryName}</div>
          <div className="biggest-category-card__amount">{formatCurrency(cat.totalAmount)}</div>
          <div className="biggest-category-card__meta">
            {Math.round(cat.percentageOfExpenses)}% av totala utgifter
          </div>
          
          <div className="biggest-category-card__bar-bg">
            <div 
              className="biggest-category-card__bar-fill" 
              style={{ width: `${cat.percentageOfExpenses}%`, backgroundColor: cat.categoryColor }}
            />
          </div>
          
          <div className="biggest-category-card__footer">
            <button 
              className="btn-outline" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: '100%' }}
              onClick={() => navigate('/insights')}
            >
              Visa alla insikter
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
