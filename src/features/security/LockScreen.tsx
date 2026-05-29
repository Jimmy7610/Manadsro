import { useState } from 'react';
import { useAppData } from '../../storage/services/AppDataContext';
import { verifyPin } from './pinUtils';
import './LockScreen.css';

export default function LockScreen() {
  const { data, unlockApp } = useAppData();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    if (!data.settings.pinHash || !data.settings.pinSalt) {
      // Falback om data saknas men ändå låst
      unlockApp();
      return;
    }

    const isValid = await verifyPin(pin, data.settings.pinSalt, data.settings.pinHash);
    
    if (isValid) {
      setError('');
      unlockApp();
    } else {
      setError('Fel PIN-kod. Försök igen.');
      setPin('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  return (
    <div className="lockscreen-overlay">
      <div className="lockscreen-content animate-fade-in">
        <div className="lockscreen-logo">Månadsro</div>
        <h2>Ange PIN-kod</h2>
        <p className="lockscreen-note">PIN-koden skyddar appvyn lokalt i den här webbläsaren.</p>
        
        {error && <div className="lockscreen-error">{error}</div>}
        
        <input 
          type="password" 
          inputMode="numeric"
          className="lockscreen-input"
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="••••"
          maxLength={8}
          autoFocus
        />

        <button className="lockscreen-btn" onClick={handleUnlock}>
          Lås upp
        </button>
      </div>
    </div>
  );
}
