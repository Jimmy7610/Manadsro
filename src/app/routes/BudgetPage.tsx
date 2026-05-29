import Card from '../../shared/components/Card';
import './BudgetPage.css';

/**
 * Månadsro – Budgetsida (placeholder).
 *
 * INSTÄLLNING - Kommer att ersättas med full budgethantering i framtida builds
 */
export default function BudgetPage() {
  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-container__title">Budget</h1>
      <Card style={{ animationDelay: '0.1s' }}>
        <span className="page-container__placeholder-icon">📊</span>
        <p className="page-container__placeholder-text">
          Här kan du sätta och följa budgetar per kategori, se hur mycket som är kvar varje månad.
        </p>
        <span className="page-container__coming-soon">Kommer snart</span>
      </Card>
    </div>
  );
}
