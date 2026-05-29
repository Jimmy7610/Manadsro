import Card from '../../shared/components/Card';
import './BillsPage.css';

/**
 * Månadsro – Räkningssida (placeholder).
 *
 * INSTÄLLNING - Kommer att ersättas med full räkningshantering i framtida builds
 */
export default function BillsPage() {
  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-container__title">Räkningar</h1>
      <Card style={{ animationDelay: '0.1s' }}>
        <span className="page-container__placeholder-icon">📄</span>
        <p className="page-container__placeholder-text">
          Här kan du se och hantera alla räkningar, spåra vad som är betalt och vad som är planerat.
        </p>
        <span className="page-container__coming-soon">Kommer snart</span>
      </Card>
    </div>
  );
}
