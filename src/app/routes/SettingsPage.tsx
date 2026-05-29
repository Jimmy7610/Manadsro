import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import ThemeToggle from '../../shared/components/ThemeToggle';
import { useAppData } from '../../storage/services/AppDataContext';
import { formatDate } from '../../shared/utils/date';
import type { BackupPayload } from '../../features/backup/backupService';
import { parseBackupFile } from '../../features/backup/backupService';
import { createPinSalt, hashPin } from '../../features/security/pinUtils';
import './SettingsPage.css';

/**
 * Månadsro – Inställningssida (Build 5)
 */
export default function SettingsPage() {
  const { data, resetLocalData, exportBackup, importBackup, updateSettings, lockApp } = useAppData();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<{ file: File, payload: BackupPayload } | null>(null);

  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinRepeat, setPinRepeat] = useState('');
  const [pinError, setPinError] = useState('');

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleReset = () => {
    if (showConfirm) {
      resetLocalData();
      setShowConfirm(false);
      showMessage('Lokal data återställdes.');
    } else {
      setShowConfirm(true);
    }
  };

  const handleExport = () => {
    exportBackup();
    showMessage('Backupen exporterades.');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const payload = await parseBackupFile(file);
      setPendingImport({ file, payload });
    } catch (err) {
      showMessage('Backupfilen kunde inte läsas. Kontrollera att det är en Månadsro-backup.');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmImport = async () => {
    if (pendingImport) {
      await importBackup(pendingImport.file);
      setPendingImport(null);
      showMessage('Backupen importerades.');
    }
  };

  const savePin = async () => {
    if (pin.length < 4 || pin.length > 8) {
      setPinError('PIN-koden måste vara 4-8 siffror.');
      return;
    }
    if (pin !== pinRepeat) {
      setPinError('PIN-koderna matchar inte.');
      return;
    }
    const salt = createPinSalt();
    const hash = await hashPin(pin, salt);
    updateSettings({ pinEnabled: true, pinSalt: salt, pinHash: hash });
    setShowPinModal(false);
    setPin('');
    setPinRepeat('');
    showMessage('PIN-koden uppdaterades.');
  };

  const disablePin = () => {
    if (window.confirm('Vill du verkligen stänga av PIN-koden?')) {
      updateSettings({ pinEnabled: false, pinHash: '', pinSalt: '' });
      showMessage('PIN-koden stängdes av.');
    }
  };

  const restartOnboarding = () => {
    updateSettings({ onboardingCompleted: false });
  };


  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-container__title">Inställningar</h1>

      {message && <div className="settings-page__toast">{message}</div>}

      {pendingImport && (
        <div className="modal-overlay">
          <div className="modal-content settings-page__import-modal">
            <h2>Vill du importera den här backupen?</h2>
            <p>Nuvarande lokal data i den här webbläsaren kommer att ersättas.</p>
            
            <div className="settings-page__import-info">
              <div><strong>Exportdatum:</strong> {formatDate(pendingImport.payload.exportedAt.split('T')[0])}</div>
              <div><strong>Backupversion:</strong> {pendingImport.payload.backupVersion}</div>
              <div><strong>Transaktioner:</strong> {pendingImport.payload.data.transactions.length}</div>
              <div><strong>Konton:</strong> {pendingImport.payload.data.accounts.length}</div>
              <div><strong>Räkningar:</strong> {pendingImport.payload.data.bills.length}</div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setPendingImport(null)}>Avbryt</button>
              <button className="btn-save" onClick={confirmImport}>Importera backup</button>
            </div>
          </div>
        </div>
      )}

      {showPinModal && (
        <div className="modal-overlay">
          <div className="modal-content settings-page__import-modal">
            <h2>Ändra PIN</h2>
            <p>Ange en ny PIN-kod (4-8 siffror).</p>
            {pinError && <div className="settings-page__warning-text" style={{marginBottom: '1rem'}}>{pinError}</div>}
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px'}}>
              <input type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)} placeholder="Ny PIN-kod" maxLength={8} className="settings-page__input" />
              <input type="password" inputMode="numeric" value={pinRepeat} onChange={e => setPinRepeat(e.target.value)} placeholder="Upprepa PIN-kod" maxLength={8} className="settings-page__input" />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowPinModal(false)}>Avbryt</button>
              <button className="btn-save" onClick={savePin}>Spara</button>
            </div>
          </div>
        </div>
      )}

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
          <h3 className="settings-page__section-title">Säkerhet & PIN</h3>
        </div>
        <p className="settings-page__text">
          PIN-koden skyddar appvyn lokalt i den här webbläsaren. Den ersätter inte kryptering eller bankinloggning.
        </p>
        <div className="settings-page__backup-status">
          <div><strong>PIN-status:</strong> {data.settings.pinEnabled ? 'Aktiv' : 'Inte aktiv'}</div>
        </div>
        <div className="settings-page__backup-actions" style={{ flexWrap: 'wrap' }}>
          <button className="settings-page__btn" onClick={() => setShowPinModal(true)}>
            {data.settings.pinEnabled ? 'Ändra PIN' : 'Skapa PIN'}
          </button>
          {data.settings.pinEnabled && (
            <>
              <button className="settings-page__btn" onClick={() => lockApp()}>
                Lås appen nu
              </button>
              <button className="settings-page__btn settings-page__btn--danger" onClick={disablePin} style={{ color: '#c62828' }}>
                Stäng av PIN
              </button>
            </>
          )}
        </div>
      </Card>

      <Card className="settings-page__section" style={{ animationDelay: '0.15s' }}>
        <div className="settings-page__section-header">
          <span className="settings-page__icon">🚀</span>
          <h3 className="settings-page__section-title">Start och data</h3>
        </div>
        <div className="settings-page__backup-status">
          <div><strong>Hushåll:</strong> {data.settings.householdName}</div>
          <div><strong>Data-läge:</strong> {data.settings.dataMode === 'demo' ? 'Demo' : 'Lokal ekonomi'}</div>
          <div><strong>Startguide:</strong> {data.settings.onboardingCompleted ? 'Slutförd' : 'Ej slutförd'}</div>
        </div>
        <p className="settings-page__text" style={{ marginTop: '0.5rem' }}>
          {data.settings.dataMode === 'demo' 
            ? 'Demoläget använder exempeldata så att du kan testa Månadsro utan riktig ekonomi.' 
            : 'Lokal ekonomi sparas i den här webbläsaren och är avsedd för din egen hushållsdata.'}
        </p>
        <div className="settings-page__backup-actions">
          <button className="settings-page__btn" onClick={restartOnboarding}>
            Visa startguiden igen
          </button>
        </div>
        <p className="settings-page__text settings-page__text--warning" style={{marginTop: '0.5rem', color: 'var(--text-secondary)'}}>
          Du kan visa startguiden igen utan att radera din data.
        </p>
      </Card>

      <Card className="settings-page__section" style={{ animationDelay: '0.18s' }}>
        <div className="settings-page__section-header">
          <span className="settings-page__icon">🏷️</span>
          <h3 className="settings-page__section-title">Kategorier</h3>
        </div>
        <p className="settings-page__text">
          Hantera dina kategorier, sätt färger, ikoner och koppla dem till din budget.
        </p>
        <div className="settings-page__backup-actions">
          <button className="settings-page__btn" onClick={() => navigate('/categories')}>
            Hantera kategorier
          </button>
        </div>
      </Card>

      <Card className="settings-page__section" style={{ animationDelay: '0.19s' }}>
        <div className="settings-page__section-header">
          <span className="settings-page__icon">💰</span>
          <h3 className="settings-page__section-title">Inkomster</h3>
        </div>
        <p className="settings-page__text">
          Hantera dina återkommande inkomster och planera din månadsinkomst.
        </p>
        <div className="settings-page__backup-actions">
          <button className="settings-page__btn" onClick={() => navigate('/incomes')}>
            Gå till Inkomster
          </button>
        </div>
      </Card>

      <Card className="settings-page__section" style={{ animationDelay: '0.2s' }}>
        <div className="settings-page__section-header">
          <span className="settings-page__icon">💾</span>
          <h3 className="settings-page__section-title">Backupcenter</h3>
        </div>
        <p className="settings-page__text">
          Din ekonomi sparas lokalt i den här webbläsaren. Exportera en backup regelbundet så att du kan återställa datan om något händer.
        </p>
        <div className="settings-page__backup-status">
          <div><strong>Lokal lagring:</strong> Aktiv</div>
          <div><strong>Lagringsnyckel:</strong> manadsro.appData.v1</div>
          <div><strong>Senaste backup:</strong> {data.settings.latestBackupAt ? formatDate(data.settings.latestBackupAt.split('T')[0]) : 'Ingen backup exporterad ännu'}</div>
          <div className="settings-page__backup-stats">
            <span>{data.transactions.length} transaktioner</span> • <span>{data.accounts.length} konton</span> • <span>{data.bills.length} räkningar</span>
          </div>
        </div>
        <div className="settings-page__backup-actions">
          <button className="settings-page__btn" onClick={handleExport}>Exportera backup</button>
          <button className="settings-page__btn settings-page__btn--import" onClick={() => fileInputRef.current?.click()}>
            Importera backup
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".json"
            onChange={handleFileChange}
          />
        </div>
        <p className="settings-page__text settings-page__text--warning" style={{marginTop: '1rem'}}>
          Import ersätter nuvarande lokal data. Exportera gärna en backup innan du importerar.
        </p>
      </Card>

      <Card className="settings-page__section settings-page__demo-card" style={{ animationDelay: '0.3s' }}>
        <div className="settings-page__section-header">
          <span className="settings-page__icon">🧪</span>
          <h3 className="settings-page__section-title">Återställ data</h3>
        </div>
        <div className="settings-page__reset-area">
          <button 
            className={`settings-page__btn-reset ${showConfirm ? 'confirm' : ''}`}
            onClick={handleReset}
          >
            {showConfirm ? 'Avbryt' : 'Återställ lokal data'}
          </button>
          {showConfirm && (
             <button className="settings-page__btn-reset settings-page__btn-reset--danger" onClick={() => {
               resetLocalData();
               setShowConfirm(false);
               showMessage('Lokal data återställdes.');
             }}>Återställ lokal data</button>
          )}
          <p className="settings-page__warning-text" style={{marginTop: '1rem', textAlign: 'center'}}>
            Detta tar bort alla lokala ändringar i den här webbläsaren och återställer demodatan.
          </p>
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
        <p className="settings-page__text" style={{marginTop: '0.5rem', fontStyle: 'italic', color: 'var(--text-secondary)'}}>
          Build 12-uppdatering: Ny-månad-vy finns nu. Månadsplan kan förberedas och bekräftas. Dubbletter undviks för förväntade inkomster och räkningar. Backup rekommenderas innan större månadsändringar. (Inkluderar även Build 11:s inkomstplanering.)
        </p>
      </Card>
    </div>
  );
}
