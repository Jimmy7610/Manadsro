import Card from '../../shared/components/Card';
import { formatCurrency } from '../../shared/utils/currency';
import type { DashboardInsights } from './dashboardInsightsService';
import './MonthlyNetCard.css';

interface MonthlyNetCardProps {
  insights: DashboardInsights;
  monthName: string;
}

export default function MonthlyNetCard({ insights, monthName }: MonthlyNetCardProps) {
  const { 
    netResult, 
    totalIncome, 
    totalExpenses, 
    totalBillsPaid, 
    hasBalanceAdjustments 
  } = insights;

  const totalOut = totalExpenses + totalBillsPaid;
  const hasData = totalIncome > 0 || totalOut > 0;

  let toneClass = 'neutral';
  let statusText = 'För lite data ännu';

  if (hasData) {
    if (netResult > 0) {
      toneClass = 'positive';
      statusText = 'Plus den här månaden';
    } else if (netResult < 0) {
      toneClass = 'negative';
      statusText = 'Minus den här månaden';
    } else {
      toneClass = 'neutral';
      statusText = 'Inkomster och utgifter i balans';
    }
  }

  return (
    <Card>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Månadens netto ({monthName})</h3>
      
      <div className={`monthly-net-card__amount ${toneClass}`}>
        {netResult > 0 ? '+' : ''}{formatCurrency(netResult)}
      </div>
      <div className="monthly-net-card__status">{statusText}</div>

      <div className="monthly-net-card__details">
        <div className="monthly-net-card__detail-item">
          <span>Inkomster</span>
          <span className="monthly-net-card__detail-value">{formatCurrency(totalIncome)}</span>
        </div>
        <div className="monthly-net-card__detail-item" style={{ textAlign: 'right' }}>
          <span>Utgifter & Räkningar</span>
          <span className="monthly-net-card__detail-value">{formatCurrency(totalOut)}</span>
        </div>
      </div>

      {hasBalanceAdjustments && (
        <div className="monthly-net-card__note">
          <span>⚖️</span>
          <span>Saldojusteringar finns den här månaden och räknas separat.</span>
        </div>
      )}
    </Card>
  );
}
