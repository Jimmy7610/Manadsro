import { useState, useRef } from 'react';
import Card from '../../shared/components/Card';
import ThemeToggle from '../../shared/components/ThemeToggle';
import { useAppData } from '../../storage/services/AppDataContext';
import { formatDate } from '../../shared/utils/date';
import type { BackupPayload } from '../../features/backup/backupService';
import { parseBackupFile } from '../../features/backup/backupService';
import './SettingsPage.css';

/**
 * Månadsro – Inställningssida (Build 5)
 */
export default function SettingsPage() {
  const { data, resetLocalData, exportBackup, importBackup } = useAppData();
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<{ file: File, payload: BackupPayload } | null>(null);

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
          <h3 className="settings-page__section-title">Säkerhet & integritet</h3>
        </div>
        <p className="settings-page__text">
          Månadsro använder ingen bankkoppling. Ingen data skickas till molnet. Data sparas lokalt i denna webbläsare. Backupfiler skapas bara när du själv exporterar dem. Den som har tillgång till webbläsaren/enheten kan se lokal data om appen inte är låst. PIN/låsskärm planeras för en senare build.
        </p>
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
      </Card>
    </div>
  );
}
