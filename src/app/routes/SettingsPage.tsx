import { useState } from 'react';
import Card from '../../shared/components/Card';
import ThemeToggle from '../../shared/components/ThemeToggle';
import { useAppData } from '../../storage/services/AppDataContext';
import './SettingsPage.css';

/**
 * Månadsro – Inställningssida (Build 4)
 */
export default function SettingsPage() {
  const { resetLocalData } = useAppData();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    if (showConfirm) {
      resetLocalData();
      setShowConfirm(false);
      alert('Lokal data har återställts till demodata.');
    } else {
      setShowConfirm(true);
    }
  };

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
          <span className="settings-page__badge">Build 5</span>
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
          <h3 className="settings-page__section-title">Lokal Lagring (Build 4)</h3>
        </div>
        <p className="settings-page__text">
          Denna version (Build 4) använder lokal lagring (localStorage) i din webbläsare.
          Din data stannar på denna enhet. Appen initialiseras med fiktiv demodata.
        </p>
        <ul className="settings-page__list">
          <li>Transaktioner sparas lokalt i webbläsaren.</li>
          <li>Räkningar kan nu betalas och transaktioner kan redigeras/raderas.</li>
          <li>Inga riktiga bankkopplingar finns (appen är lokal).</li>
          <li>Backup/export är planerat för en senare build.</li>
        </ul>
        
        <div className="settings-page__reset-area">
          <button 
            className={`settings-page__btn-reset ${showConfirm ? 'confirm' : ''}`}
            onClick={handleReset}
          >
            {showConfirm ? 'Är du säker? Bekräfta' : 'Återställ lokal data'}
          </button>
          {showConfirm && (
            <p className="settings-page__warning-text">
              Detta tar bort lokala ändringar i den här webbläsaren.
            </p>
          )}
        </div>
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
