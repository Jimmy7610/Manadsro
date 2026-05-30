import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import { getMonthName, getCurrentMonth } from '../../shared/utils/date';
import { getCurrentMonthKey } from '../../shared/utils/month';
import { useAppData } from '../../storage/services/AppDataContext';
import { getMonthPlanStatus, getMonthDeviationSummary } from '../monthPlanning/monthPlanningService';
import { getPreviousMonthKey } from '../../shared/utils/month';
import { isMonthArchived as checkMonthArchived } from '../monthArchive/monthArchiveService';
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

  const monthStatus = getMonthPlanStatus(data, currentMonthKey);
  const deviations = getMonthDeviationSummary(data, currentMonthKey);

  let titleMessage = 'Månaden är planerad och ser stabil ut.';
  let subtitleMessage = 'Månadens plan är bekräftad.';

  if (monthStatus === 'Planerad') {
    if (insights.planStatus !== 'confirmed') {
      titleMessage = 'Månadsplanen är inte bekräftad ännu.';
      subtitleMessage = 'Gå igenom ny-månad-planen när du har tid.';
    } else {
      titleMessage = 'Månaden är planerad.';
      subtitleMessage = 'Inga avvikelser hittills.';
    }
  } else if (monthStatus === 'Pågår') {
    titleMessage = 'Månaden pågår och ser stabil ut.';
    subtitleMessage = 'Fortsätt följa planen.';
  } else if (monthStatus === 'Avvikelse') {
    titleMessage = 'Det finns avvikelser att titta på.';
    subtitleMessage = deviations.length > 0 ? deviations[0] : 'Öppna månadsplanen för detaljer.';
  } else if (monthStatus === 'Klar') {
    titleMessage = 'Månaden ser klar ut.';
    subtitleMessage = 'Bra jobbat! Inga obetalda räkningar kvar.';
  }

  const prevMonthKey = getPreviousMonthKey(currentMonthKey);
  const isCurrentArchived = checkMonthArchived(data, currentMonthKey);
  const isPrevArchived = checkMonthArchived(data, prevMonthKey);

  let archiveNote = 'Månadsarkivet är redo när månaden är klar.';
  if (isCurrentArchived) {
    archiveNote = 'Den här månaden är arkiverad.';
  } else if (isPrevArchived) {
    archiveNote = 'Föregående månad är arkiverad. Den här månaden är öppen.';
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
          <p className="dashboard-hero__subtitle" style={{marginTop: '0.5rem', opacity: 0.8, fontSize: '0.85rem'}}>{archiveNote}</p>
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
              Öppna månadsplan
            </button>
          </div>
        </div>
      </div>
      <div className="dashboard-hero__decoration" />
    </Card>
  );
}
