import DashboardHero from '../../features/dashboard/DashboardHero';
import MoneyLeftCard from '../../features/dashboard/MoneyLeftCard';
import AccountSummaryCard from '../../features/dashboard/AccountSummaryCard';
import UpcomingBillsCard from '../../features/dashboard/UpcomingBillsCard';
import BudgetStatusCard from '../../features/dashboard/BudgetStatusCard';
import RecentTransactionsCard from '../../features/dashboard/RecentTransactionsCard';
import ProfileSplitCard from '../../features/dashboard/ProfileSplitCard';
import './DashboardPage.css';

/**
 * Månadsro – Huvudsida (Dashboard).
 * Samlar alla dashboard-kort i ett responsivt grid.
 *
 * INSTÄLLNING - Ordning och synlighet av kort kan anpassas
 */
export default function DashboardPage() {
  return (
    <div className="dashboard-page animate-fade-in">
      <div className="dashboard-page__grid">
        {/* Hero – full bredd */}
        <div className="dashboard-page__grid--hero" style={{ animationDelay: '0.0s' }}>
          <DashboardHero />
        </div>

        {/* Fritt utrymme – full bredd */}
        <div className="dashboard-page__grid--full animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <MoneyLeftCard />
        </div>

        {/* Konton */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <AccountSummaryCard />
        </div>

        {/* Kommande räkningar */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <UpcomingBillsCard />
        </div>

        {/* Budget */}
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <BudgetStatusCard />
        </div>

        {/* Senaste transaktioner */}
        <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <RecentTransactionsCard />
        </div>

        {/* Inkomstfördelning – full bredd */}
        <div className="dashboard-page__grid--full animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <ProfileSplitCard />
        </div>
      </div>
    </div>
  );
}
