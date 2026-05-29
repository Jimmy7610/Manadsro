import Card from '../../shared/components/Card';
import './AccountsPage.css';

/**
 * Månadsro – Kontosida (placeholder).
 *
 * INSTÄLLNING - Kommer att ersättas med full kontohantering i framtida builds
 */
export default function AccountsPage() {
  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-container__title">Konton</h1>
      <Card style={{ animationDelay: '0.1s' }}>
        <span className="page-container__placeholder-icon">🏦</span>
        <p className="page-container__placeholder-text">
          Här ser du alla dina konton, listan över saldon och kan hantera kontoinställningar.
        </p>
        <span className="page-container__coming-soon">Kommer snart</span>
      </Card>
    </div>
  );
}
