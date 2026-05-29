import Card from '../../shared/components/Card';
import ThemeToggle from '../../shared/components/ThemeToggle';
import './SettingsPage.css';

/**
 * Månadsro – Inställningssida.
 * Funktionell temväxlare + platshållare för framtida inställningar.
 *
 * INSTÄLLNING - Fler inställningar läggs till i framtida builds
 */
export default function SettingsPage() {
  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-container__title">Inställningar</h1>

      {/* Tema-sektion */}
      <Card className="settings-page__section" style={{ animationDelay: '0.1s' }}>
        <h3 className="settings-page__section-title">Utseende</h3>
        <div className="settings-page__theme-row">
          <div className="settings-page__theme-info">
            <div className="settings-page__theme-label">Tema</div>
            <div className="settings-page__theme-description">
              Växla mellan ljust och mörkt tema
            </div>
          </div>
          <ThemeToggle />
        </div>
      </Card>

      {/* Framtida inställningar */}
      <Card style={{ animationDelay: '0.2s' }}>
        <span className="page-container__placeholder-icon">⚙️</span>
        <p className="page-container__placeholder-text">
          Här kan du ändra tema, hantera profiler, hushåll och framtida säkerhetskopiering.
        </p>
        <span className="page-container__coming-soon">Fler inställningar kommer snart</span>
      </Card>
    </div>
  );
}
