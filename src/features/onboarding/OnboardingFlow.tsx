import { useState } from 'react';
import { useAppData } from '../../storage/services/AppDataContext';
import { createPinSalt, hashPin } from '../security/pinUtils';
import './OnboardingFlow.css';

export default function OnboardingFlow() {
  const { data, updateSettings } = useAppData();
  
  const [step, setStep] = useState(1);
  const [dataMode, setDataMode] = useState<'demo' | 'local'>('local');
  const [householdName, setHouseholdName] = useState(data.settings.householdName || 'Mitt hushåll');
  
  const [pin, setPin] = useState('');
  const [pinRepeat, setPinRepeat] = useState('');
  const [pinError, setPinError] = useState('');

  const nextStep = () => setStep(s => s + 1);

  const finishOnboarding = async (createPin: boolean) => {
    let updates: any = {
      onboardingCompleted: true,
      dataMode,
      householdName
    };

    if (createPin) {
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
      updates.pinEnabled = true;
      updates.pinSalt = salt;
      updates.pinHash = hash;
    } else {
      updates.pinEnabled = false;
      updates.pinHash = '';
      updates.pinSalt = '';
    }

    updateSettings(updates);
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        {step === 1 && (
          <div className="onboarding-step animate-fade-in">
            <h2>Välkommen till Månadsro</h2>
            <p>Familjens ekonomi, lugnt och enkelt.</p>
            <p className="onboarding-note">All data sparas lokalt i den här webbläsaren.</p>
            <div className="onboarding-actions">
              <button className="onboarding-btn" onClick={nextStep}>Börja</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step animate-fade-in">
            <h2>Välj startläge</h2>
            <div className="onboarding-options">
              <button 
                className={`onboarding-option ${dataMode === 'demo' ? 'active' : ''}`}
                onClick={() => setDataMode('demo')}
              >
                <h3>Testa med demo</h3>
                <p>Använd testdata för att utforska appen</p>
              </button>
              <button 
                className={`onboarding-option ${dataMode === 'local' ? 'active' : ''}`}
                onClick={() => setDataMode('local')}
              >
                <h3>Skapa lokal ekonomi</h3>
                <p>Börja använda appen på riktigt (fortfarande lokalt)</p>
              </button>
            </div>
            <div className="onboarding-actions">
              <button className="onboarding-btn" onClick={nextStep}>Nästa</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step animate-fade-in">
            <h2>Hushållets namn</h2>
            <input 
              type="text" 
              className="onboarding-input"
              value={householdName}
              onChange={e => setHouseholdName(e.target.value)}
              placeholder="Mitt hushåll"
            />
            <div className="onboarding-actions">
              <button className="onboarding-btn" onClick={nextStep}>Nästa</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="onboarding-step animate-fade-in">
            <h2>Lås appen lokalt?</h2>
            <p className="onboarding-note">
              PIN-koden skyddar appvyn lokalt i den här webbläsaren. Den ersätter inte kryptering eller bankinloggning.
            </p>
            {pinError && <div className="onboarding-error">{pinError}</div>}
            
            <div className="onboarding-pin-inputs">
              <input 
                type="password" 
                inputMode="numeric"
                className="onboarding-input"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Ange 4-8 siffror"
                maxLength={8}
              />
              <input 
                type="password" 
                inputMode="numeric"
                className="onboarding-input"
                value={pinRepeat}
                onChange={e => setPinRepeat(e.target.value)}
                placeholder="Upprepa PIN-kod"
                maxLength={8}
              />
            </div>

            <div className="onboarding-actions onboarding-actions--split">
              <button className="onboarding-btn onboarding-btn--secondary" onClick={() => finishOnboarding(false)}>
                Hoppa över
              </button>
              <button className="onboarding-btn" onClick={() => finishOnboarding(true)}>
                Spara PIN & fortsätt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
