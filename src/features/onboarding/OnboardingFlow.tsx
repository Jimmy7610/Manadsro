import { useState } from 'react';
import { useAppData } from '../../storage/services/AppDataContext';
import { createPinSalt, hashPin } from '../security/pinUtils';
import type { Account, Budget, Bill } from '../../types/models';
import './OnboardingFlow.css';

export default function OnboardingFlow() {
  const { data, completeOnboarding } = useAppData();
  
  const [step, setStep] = useState(1);
  const [dataMode, setDataMode] = useState<'demo' | 'local'>('local');
  const [householdName, setHouseholdName] = useState('Mitt hushåll');
  
  // Step 4: Profiles
  const [profiles, setProfiles] = useState([
    { id: `p-${Date.now()}-1`, name: 'Person 1', emoji: '👨', color: '#4A7B9D', isShared: false },
    { id: `p-${Date.now()}-2`, name: 'Person 2', emoji: '👩', color: '#9B6B8E', isShared: false },
    { id: `p-${Date.now()}-3`, name: 'Gemensamt', emoji: '🏡', color: '#5B8C6F', isShared: true },
  ]);

  // Step 5: Accounts
  const [accounts, setAccounts] = useState([
    { id: `a-${Date.now()}-1`, name: 'Gemensamt konto', type: 'shared' as const, initialBalance: '0', profileId: profiles[2].id },
    { id: `a-${Date.now()}-2`, name: 'Mitt konto', type: 'checking' as const, initialBalance: '0', profileId: profiles[0].id },
    { id: `a-${Date.now()}-3`, name: 'Sparkonto', type: 'savings' as const, initialBalance: '0', profileId: profiles[2].id },
  ]);

  // Step 6: Budgets (using categories from demo data/defaults)
  const [budgets, setBudgets] = useState([
    { categoryName: 'Mat', limit: '' },
    { categoryName: 'Transport', limit: '' },
    { categoryName: 'Nöje', limit: '' },
    { categoryName: 'Abonnemang', limit: '' },
    { categoryName: 'Husdjur', limit: '' },
  ]);

  // Step 7: Bills
  const [bills, setBills] = useState([
    { id: `b-${Date.now()}-1`, name: 'Hyra', amount: '', dueDate: '', isRecurring: true },
    { id: `b-${Date.now()}-2`, name: 'El', amount: '', dueDate: '', isRecurring: true },
    { id: `b-${Date.now()}-3`, name: 'Internet', amount: '', dueDate: '', isRecurring: true },
    { id: `b-${Date.now()}-4`, name: 'Försäkring', amount: '', dueDate: '', isRecurring: true },
    { id: `b-${Date.now()}-5`, name: 'Netflix', amount: '', dueDate: '', isRecurring: true },
  ]);

  // Step 8: PIN
  const [pin, setPin] = useState('');
  const [pinRepeat, setPinRepeat] = useState('');
  const [pinError, setPinError] = useState('');

  const nextStep = () => {
    if (step === 2 && dataMode === 'demo') {
      setStep(8); // skip to PIN if demo
    } else {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    if (step === 8 && dataMode === 'demo') {
      setStep(2);
    } else {
      setStep(s => s - 1);
    }
  };

  const finishOnboarding = async (createPin: boolean) => {
    let pinEnabled = false;
    let pinHash = '';
    let pinSalt = '';

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
      pinEnabled = true;
      pinSalt = salt;
      pinHash = hash;
    }

    if (dataMode === 'demo') {
      completeOnboarding({ dataMode: 'demo', pinEnabled, pinHash, pinSalt });
      return;
    }

    // Process Accounts
    const validAccounts: Account[] = accounts
      .filter(a => a.name.trim() !== '' && !isNaN(parseFloat(a.initialBalance)))
      .map((a, i) => ({
        id: a.id,
        householdId: 'local-hh',
        profileId: a.profileId,
        name: a.name.trim(),
        type: a.type,
        initialBalance: parseFloat(a.initialBalance) || 0,
        currency: 'SEK',
        sortOrder: i,
        isActive: true,
      }));

    // Process Budgets
    const validBudgets: Budget[] = budgets
      .filter(b => b.limit !== '' && !isNaN(parseFloat(b.limit)) && parseFloat(b.limit) > 0)
      .map((b, i) => {
        // Find category ID based on name in existing categories
        const cat = data.categories.find(c => c.name === b.categoryName);
        return {
          id: `bud-local-${Date.now()}-${i}`,
          householdId: 'local-hh',
          categoryId: cat ? cat.id : data.categories[0]?.id || 'cat-1',
          profileId: profiles.find(p => p.isShared)?.id || profiles[0].id,
          monthlyLimit: parseFloat(b.limit),
          month: new Date().toISOString().substring(0, 7), // 'YYYY-MM'
          active: true
        };
      });

    // Process Bills
    const validBills: Bill[] = bills
      .filter(b => b.name.trim() !== '' && b.amount !== '' && !isNaN(parseFloat(b.amount)) && b.dueDate !== '')
      .map((b) => {
        // default category 'Boende' or similar if we can guess, otherwise just first
        let catId = data.categories[0]?.id;
        if (b.name.toLowerCase().includes('hyra') || b.name.toLowerCase().includes('el')) {
          catId = data.categories.find(c => c.name === 'Boende')?.id || catId;
        } else if (b.name.toLowerCase().includes('netflix') || b.name.toLowerCase().includes('internet')) {
          catId = data.categories.find(c => c.name === 'Abonnemang')?.id || catId;
        }

        return {
          id: b.id,
          householdId: 'local-hh',
          categoryId: catId,
          name: b.name.trim(),
          amount: parseFloat(b.amount),
          dueDate: b.dueDate, // Should be valid date if HTML5 date picker was used
          status: 'unpaid',
          recurring: b.isRecurring,
          recurrence: b.isRecurring ? 'monthly' : 'none',
          accountId: validAccounts.find(a => a.type === 'shared')?.id || validAccounts[0]?.id,
          profileId: profiles.find(p => p.isShared)?.id || profiles[0].id,
          createdAt: new Date().toISOString()
        };
      });

    const finalProfiles = profiles.map(p => ({ ...p, householdId: 'local-hh' }));

    completeOnboarding({
      dataMode: 'local',
      householdName,
      pinEnabled,
      pinHash,
      pinSalt,
      profiles: finalProfiles,
      accounts: validAccounts,
      budgets: validBudgets,
      bills: validBills
    });
  };

  const updateProfileName = (index: number, newName: string) => {
    const p = [...profiles];
    p[index].name = newName;
    setProfiles(p);
  };

  const updateAccountField = (index: number, field: string, value: any) => {
    const a = [...accounts];
    (a[index] as any)[field] = value;
    setAccounts(a);
  };

  const updateBudgetLimit = (index: number, value: string) => {
    const b = [...budgets];
    b[index].limit = value;
    setBudgets(b);
  };

  const updateBillField = (index: number, field: string, value: any) => {
    const b = [...bills];
    (b[index] as any)[field] = value;
    setBills(b);
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
            <div className="onboarding-actions onboarding-actions--split">
              <button className="onboarding-btn onboarding-btn--secondary" onClick={prevStep}>Tillbaka</button>
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
            <div className="onboarding-actions onboarding-actions--split">
              <button className="onboarding-btn onboarding-btn--secondary" onClick={prevStep}>Tillbaka</button>
              <button className="onboarding-btn" onClick={nextStep}>Nästa</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="onboarding-step animate-fade-in">
            <h2>Vilka ingår i hushållet?</h2>
            <p className="onboarding-note">Skapa profiler för att se vems konto som är vems.</p>
            
            <div className="onboarding-list">
              {profiles.map((p, i) => (
                <div key={p.id} className="onboarding-list-item">
                  <span className="onboarding-emoji">{p.emoji}</span>
                  <input 
                    type="text" 
                    className="onboarding-input"
                    value={p.name}
                    onChange={e => updateProfileName(i, e.target.value)}
                    placeholder={`Namn ${i+1}`}
                    disabled={p.isShared}
                  />
                </div>
              ))}
            </div>

            <div className="onboarding-actions onboarding-actions--split">
              <button className="onboarding-btn onboarding-btn--secondary" onClick={prevStep}>Tillbaka</button>
              <button className="onboarding-btn" onClick={nextStep}>Nästa</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="onboarding-step animate-fade-in">
            <h2>Skapa konton</h2>
            <p className="onboarding-note">Börja med några grundläggande konton.</p>
            
            <div className="onboarding-list">
              {accounts.map((a, i) => (
                <div key={a.id} className="onboarding-list-item onboarding-list-item--stacked">
                  <input 
                    type="text" 
                    className="onboarding-input"
                    value={a.name}
                    onChange={e => updateAccountField(i, 'name', e.target.value)}
                    placeholder="Kontonamn"
                  />
                  <div style={{display:'flex', gap: '8px'}}>
                    <select 
                      className="onboarding-input" 
                      value={a.profileId}
                      onChange={e => updateAccountField(i, 'profileId', e.target.value)}
                    >
                      {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input 
                      type="number" 
                      className="onboarding-input"
                      value={a.initialBalance}
                      onChange={e => updateAccountField(i, 'initialBalance', e.target.value)}
                      placeholder="Startsaldo"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="onboarding-actions onboarding-actions--split">
              <button className="onboarding-btn onboarding-btn--secondary" onClick={nextStep}>Hoppa över</button>
              <button className="onboarding-btn" onClick={nextStep}>Nästa</button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="onboarding-step animate-fade-in">
            <h2>Budgetgränser</h2>
            <p className="onboarding-note">Sätt preliminära gränser för en månad. (Frivilligt)</p>
            
            <div className="onboarding-list">
              {budgets.map((b, i) => (
                <div key={i} className="onboarding-list-item">
                  <span style={{flex: 1, fontWeight: 500, color:'var(--text-primary)'}}>{b.categoryName}</span>
                  <input 
                    type="number" 
                    className="onboarding-input"
                    value={b.limit}
                    onChange={e => updateBudgetLimit(i, e.target.value)}
                    placeholder="0 kr"
                    style={{width: '120px'}}
                  />
                </div>
              ))}
            </div>
            
            <div className="onboarding-actions onboarding-actions--split">
              <button className="onboarding-btn onboarding-btn--secondary" onClick={nextStep}>Hoppa över</button>
              <button className="onboarding-btn" onClick={nextStep}>Nästa</button>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="onboarding-step animate-fade-in">
            <h2>Kommande räkningar</h2>
            <p className="onboarding-note">Lägg in återkommande räkningar för att få bra prognoser. (Frivilligt)</p>
            
            <div className="onboarding-list onboarding-list--scrollable">
              {bills.map((b, i) => (
                <div key={b.id} className="onboarding-list-item onboarding-list-item--stacked">
                  <div style={{display:'flex', gap: '8px'}}>
                    <input 
                      type="text" 
                      className="onboarding-input"
                      value={b.name}
                      onChange={e => updateBillField(i, 'name', e.target.value)}
                      placeholder="Räkning (t.ex. Hyra)"
                    />
                    <input 
                      type="number" 
                      className="onboarding-input"
                      value={b.amount}
                      onChange={e => updateBillField(i, 'amount', e.target.value)}
                      placeholder="Belopp"
                      style={{width: '100px'}}
                    />
                  </div>
                  <input 
                    type="date" 
                    className="onboarding-input"
                    value={b.dueDate}
                    onChange={e => updateBillField(i, 'dueDate', e.target.value)}
                  />
                </div>
              ))}
            </div>
            
            <div className="onboarding-actions onboarding-actions--split">
              <button className="onboarding-btn onboarding-btn--secondary" onClick={nextStep}>Hoppa över</button>
              <button className="onboarding-btn" onClick={nextStep}>Nästa</button>
            </div>
          </div>
        )}

        {step === 8 && (
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
              <button className="onboarding-btn onboarding-btn--secondary" onClick={prevStep}>Tillbaka</button>
              <button className="onboarding-btn" onClick={nextStep}>Nästa</button>
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="onboarding-step animate-fade-in">
            <h2>Sammanfattning</h2>
            <div className="onboarding-summary">
              <div className="onboarding-summary-row">
                <span>Hushåll:</span>
                <strong>{dataMode === 'demo' ? 'Demohushåll' : householdName}</strong>
              </div>
              <div className="onboarding-summary-row">
                <span>Läge:</span>
                <strong>{dataMode === 'demo' ? 'Testa med demo' : 'Lokal ekonomi'}</strong>
              </div>
              {dataMode === 'local' && (
                <>
                  <div className="onboarding-summary-row">
                    <span>Konton:</span>
                    <strong>{accounts.filter(a => a.name.trim() !== '').length} st</strong>
                  </div>
                  <div className="onboarding-summary-row">
                    <span>Budgetar:</span>
                    <strong>{budgets.filter(b => b.limit !== '').length} st</strong>
                  </div>
                  <div className="onboarding-summary-row">
                    <span>Räkningar:</span>
                    <strong>{bills.filter(b => b.name.trim() !== '' && b.amount !== '' && b.dueDate !== '').length} st</strong>
                  </div>
                </>
              )}
              <div className="onboarding-summary-row">
                <span>Lås (PIN):</span>
                <strong>{pin.length >= 4 && pin === pinRepeat ? 'Aktiv' : 'Inte aktiv'}</strong>
              </div>
            </div>

            <div className="onboarding-actions onboarding-actions--split">
              <button className="onboarding-btn onboarding-btn--secondary" onClick={() => finishOnboarding(false)}>
                Klar (Utan PIN)
              </button>
              <button 
                className="onboarding-btn" 
                onClick={() => finishOnboarding(pin.length >= 4 && pin === pinRepeat)}
                disabled={pin.length > 0 && (pin.length < 4 || pin !== pinRepeat)}
              >
                Öppna Månadsro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
