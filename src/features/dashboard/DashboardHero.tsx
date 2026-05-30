import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import { getMonthName, getCurrentMonth } from '../../shared/utils/date';
import { getCurrentMonthKey } from '../../shared/utils/month';
import { useAppData } from '../../storage/services/AppDataContext';
import { getDashboardInsights } from './dashboardInsightsService';
import './DashboardHero.css';

/**
 * Månadsro – Hero-kort som visar statusmeddelande för aktuell månad.
 */
export default function DashboardHero() {
  const { data } = useAppData();
  const currentMonth = getCurrentMonth();
  const currentMonthKey = getCurrentMonthKey();
  const monthName = getMonthName(currentMonth);
  const insights = getDashboardInsights(data, currentMonthKey);
  const navigate = useNavigate();

  const monthCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  let titleMessage = 'Månaden är planerad och ser stabil ut.';
  let subtitleMessage = 'Månadens plan är bekräftad.';

  if (insights.planStatus !== 'confirmed') {
    titleMessage = 'Månadsplanen är inte bekräftad ännu.';
    subtitleMessage = 'Gå igenom ny-månad-planen när du har tid.';
  } else if (insights.overdueBillsCount > 0) {
    titleMessage = insights.overdueBillsCount === 1 ? 'En räkning är försenad.' : `${insights.overdueBillsCount} räkningar är försenade.`;
  } else if (insights.expectedIncomeCount > 0) {
    titleMessage = insights.expectedIncomeCount === 1 ? 'En förväntad inkomst saknas fortfarande.' : `${insights.expectedIncomeCount} förväntade inkomster saknas.`;
  } else if (insights.netResult > 0) {
    titleMessage = 'Månadens netto är positivt.';
  } else if (insights.netResult < 0) {
    titleMessage = 'Månadens netto är negativt.';
  }

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
          <h2 className="dashboard-hero__title">{titleMessage}</h2>
          <p className="dashboard-hero__subtitle">{subtitleMessage}</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className="btn-save" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              onClick={() => navigate('/insights')}
            >
              Visa insikter
            </button>
            <button 
              className="btn-outline" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', backgroundColor: 'transparent', borderColor: 'currentColor', color: 'inherit', opacity: 0.9 }}
              onClick={() => navigate('/month-planning')}
            >
              Ny månad
            </button>
          </div>
        </div>
      </div>
      <div className="dashboard-hero__decoration" />
    </Card>
  );
}
