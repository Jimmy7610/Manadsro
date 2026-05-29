import Card from '../../shared/components/Card';
import ThemeToggle from '../../shared/components/ThemeToggle';
import './SettingsPage.css';

/**
 * Månadsro – Inställningssida (Build 2)
 */
export default function SettingsPage() {
  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-container__title">Inställningar</h1>

      <Card className="settings-page__section" style={{ animationDelay: '0.0s' }}>
        <div className="settings-page__section-header">
          <span className="settings-page__icon">🎨</span>
          <h3 className="settings-page__section-title">Tema</h3>
        </div>
        <div className="settings-page__row">
          <div className="settings-page__info">
            <div className="settings-page__label">Appens utseende</div>
            <div className="settings-page__desc">Växla mellan ljust och mörkt tema</div>
          </div>
          <ThemeToggle />
        </div>
      </Card>

      <Card className="settings-page__section" style={{ animationDelay: '0.1s' }}>
        <div className="settings-page__section-header">
          <span className="settings-page__icon">🛡️</span>
          <h3 className="settings-page__section-title">Säkerhet & Integritet</h3>
        </div>
        <div className="settings-page__row">
          <div className="settings-page__info">
            <div className="settings-page__label">PIN-inloggning</div>
            <div className="settings-page__desc">Skydda appen med en kod</div>
          </div>
          <span className="settings-page__badge">Build 3</span>
        </div>
      </Card>

      <Card className="settings-page__section" style={{ animationDelay: '0.2s' }}>
        <div className="settings-page__section-header">
          <span className="settings-page__icon">💾</span>
          <h3 className="settings-page__section-title">Backupcenter</h3>
        </div>
        <div className="settings-page__row">
          <div className="settings-page__info">
            <div className="settings-page__label">Exportera & Importera</div>
            <div className="settings-page__desc">Säkerhetskopiera din data manuellt</div>
          </div>
          <span className="settings-page__badge">Framtid</span>
        </div>
      </Card>

      <Card className="settings-page__section settings-page__demo-card" style={{ animationDelay: '0.3s' }}>
        <div className="settings-page__section-header">
          <span className="settings-page__icon">🧪</span>
          <h3 className="settings-page__section-title">Demo-läge (Build 2)</h3>
        </div>
        <p className="settings-page__text">
          Denna version (Build 2) visar Månadsro i ett rent demo-läge. 
          All data du ser är fiktiv demodata för att visa hur gränssnittet fungerar.
        </p>
        <ul className="settings-page__list">
          <li>Ingen riktig lagring ännu (kommer i Build 3)</li>
          <li>Ingen inloggning krävs</li>
          <li>Inga riktiga bankkopplingar finns (eller är planerade, appen är lokal)</li>
        </ul>
      </Card>

      <Card className="settings-page__section" style={{ animationDelay: '0.4s' }}>
        <div className="settings-page__section-header">
          <span className="settings-page__icon">ℹ️</span>
          <h3 className="settings-page__section-title">Om Månadsro</h3>
        </div>
        <p className="settings-page__text">
          Familjens ekonomi, lugnt och enkelt. 
          En modern app byggd för integritet, översikt och delad kontroll över hushållsekonomin.
        </p>
      </Card>
    </div>
  );
}
