import Card from '../../shared/components/Card';
import { formatCurrency } from '../../shared/utils/currency';
import type { DashboardInsights } from './dashboardInsightsService';
import './ExpectedIncomeCard.css';

interface ExpectedIncomeCardProps {
  insights: DashboardInsights;
}

export default function ExpectedIncomeCard({ insights }: ExpectedIncomeCardProps) {
  const { expectedIncomeCount, receivedIncomeCount, expectedIncomeAmount, receivedIncomeAmount } = insights;
  const totalCount = expectedIncomeCount + receivedIncomeCount;

  let statusText = 'Inga planerade inkomster.';
  if (totalCount > 0) {
    if (expectedIncomeCount === 0) {
      statusText = '✅ Alla planerade inkomster är mottagna.';
    } else {
      statusText = `⏳ Det finns ${expectedIncomeCount} inkomster kvar att markera som mottagna.`;
    }
  }

  return (
    <Card>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Förväntade inkomster</h3>
      <div className="expected-income-card__status">{statusText}</div>
      
      {totalCount > 0 && (
        <div className="expected-income-card__details">
          <div className="expected-income-card__row">
            <span className="expected-income-card__label">Mottaget ({receivedIncomeCount} st)</span>
            <span className="expected-income-card__value received">{formatCurrency(receivedIncomeAmount)}</span>
          </div>
          <div className="expected-income-card__row">
            <span className="expected-income-card__label">Kvar att få ({expectedIncomeCount} st)</span>
            <span className="expected-income-card__value">{formatCurrency(expectedIncomeAmount)}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
