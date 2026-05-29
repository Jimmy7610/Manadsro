import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import { getMonthName, getCurrentMonth } from '../../shared/utils/date';
import { getCurrentMonthKey } from '../../shared/utils/month';
import { getMonthlyStatus } from '../../shared/utils/monthlyStatus';
import { useAppData } from '../../storage/services/AppDataContext';
import './DashboardHero.css';

/**
 * Månadsro – Hero-kort som visar statusmeddelande för aktuell månad.
 */
export default function DashboardHero() {
  const { data } = useAppData();
  const currentMonth = getCurrentMonth();
  const currentMonthKey = getCurrentMonthKey();
  const monthName = getMonthName(currentMonth);
  const status = getMonthlyStatus(data);
  const plan = data.monthPlans?.find(p => p.monthKey === currentMonthKey);
  const navigate = useNavigate();

  const monthCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <Card variant="hero" className="dashboard-hero">
      <div className="dashboard-hero__content">
        <div className="dashboard-hero__icon">
          {/* Måne + diagram ikon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            <path d="M3 17l3-3 2 2 4-4 3 3 3-3" />
          </svg>
        </div>
        <div className="dashboard-hero__text">
          <span className="dashboard-hero__month">{monthCapitalized} 2026</span>
          <h2 className="dashboard-hero__title">{status.message}</h2>
          <p className="dashboard-hero__subtitle">
            {plan?.status === 'confirmed' 
              ? 'Månadens plan är bekräftad.' 
              : 'Den här månaden är inte bekräftad ännu. Gå igenom ny-månad-planen när du har tid.'}
          </p>
          <div style={{ marginTop: '1rem' }}>
            <button 
              className="btn-save" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              onClick={() => navigate('/insights')}
            >
              Visa insikter
            </button>
          </div>
        </div>
      </div>
      <div className="dashboard-hero__decoration" />
    </Card>
  );
}
