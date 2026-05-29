import Card from '../../shared/components/Card';
import './TransactionsPage.css';

/**
 * Månadsro – Transaktionssida (placeholder).
 *
 * INSTÄLLNING - Kommer att ersättas med full transaktionslista i framtida builds
 */
export default function TransactionsPage() {
  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-container__title">Transaktioner</h1>
      <Card style={{ animationDelay: '0.1s' }}>
        <span className="page-container__placeholder-icon">💳</span>
        <p className="page-container__placeholder-text">
          Här kommer du kunna se och söka bland alla transaktioner, filtrera per konto, kategori och profil.
        </p>
        <span className="page-container__coming-soon">Kommer snart</span>
      </Card>
    </div>
  );
}
