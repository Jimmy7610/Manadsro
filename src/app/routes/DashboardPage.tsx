import DashboardHero from '../../features/dashboard/DashboardHero';
import MoneyLeftCard from '../../features/dashboard/MoneyLeftCard';
import UpcomingBillsCard from '../../features/dashboard/UpcomingBillsCard';
import RecentTransactionsCard from '../../features/dashboard/RecentTransactionsCard';
import ProfileSplitCard from '../../features/dashboard/ProfileSplitCard';
import DashboardQuickActions from '../../features/dashboard/DashboardQuickActions';
import MonthlyNetCard from '../../features/dashboard/MonthlyNetCard';
import BiggestCategoryCard from '../../features/dashboard/BiggestCategoryCard';
import BudgetWarningCard from '../../features/dashboard/BudgetWarningCard';
import ExpectedIncomeCard from '../../features/dashboard/ExpectedIncomeCard';
import { useAppData } from '../../storage/services/AppDataContext';
import { getDashboardInsights } from '../../features/dashboard/dashboardInsightsService';
import { getCurrentMonthKey } from '../../shared/utils/month';
import { getMonthName, getCurrentMonth } from '../../shared/utils/date';
import './DashboardPage.css';

/**
 * Månadsro – Huvudsida (Dashboard).
 * Samlar alla dashboard-kort i ett responsivt grid.
 *
 * INSTÄLLNING - Ordning och synlighet av kort kan anpassas
 */
export default function DashboardPage() {
  const { data } = useAppData();
  const monthKey = getCurrentMonthKey();
  const currentMonth = getCurrentMonth();
  const monthName = getMonthName(currentMonth);
  const insights = getDashboardInsights(data, monthKey);

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Hero – full bredd */}
      <div className="dashboard-page__grid" style={{ marginBottom: '1.5rem' }}>
        <div className="dashboard-page__grid--hero" style={{ animationDelay: '0.0s' }}>
          <DashboardHero />
        </div>
      </div>
      
      {/* Quick actions */}
      <DashboardQuickActions />

      {/* Main Overview Grid */}
      <h2 className="dashboard-page__section-title">Månadsöversikt</h2>
      <div className="dashboard-page__grid">
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <MoneyLeftCard />
        </div>
        
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <MonthlyNetCard insights={insights} monthName={monthName} />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <UpcomingBillsCard />
        </div>
        
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <ExpectedIncomeCard insights={insights} />
        </div>
      </div>
      
      <h2 className="dashboard-page__section-title" style={{ marginTop: '2rem' }}>Dina Insikter</h2>
      {/* Insights Grid */}
      <div className="dashboard-page__insight-grid">
        <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <BiggestCategoryCard insights={insights} />
        </div>
        
        <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <BudgetWarningCard insights={insights} />
        </div>
        
        <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <RecentTransactionsCard />
        </div>
        
        <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <ProfileSplitCard />
        </div>
      </div>
    </div>
  );
}
