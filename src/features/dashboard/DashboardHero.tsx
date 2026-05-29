import Card from '../../shared/components/Card';
import { getMonthName, getCurrentMonth } from '../../shared/utils/date';
import { getMonthlyStatus } from '../../shared/utils/monthlyStatus';
import { useAppData } from '../../storage/services/AppDataContext';
import './DashboardHero.css';

/**
 * Månadsro – Hero-kort som visar statusmeddelande för aktuell månad.
 */
export default function DashboardHero() {
  const { data } = useAppData();
  const currentMonth = getCurrentMonth();
  const monthName = getMonthName(currentMonth);
  const status = getMonthlyStatus(data);

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
            {status.freeSpace >= 0 ? 'Ni har bra marginal efter räkningar och planerad budget.' : 'Försök hålla nere utgifterna resten av månaden.'}
          </p>
        </div>
      </div>
      <div className="dashboard-hero__decoration" />
    </Card>
  );
}
