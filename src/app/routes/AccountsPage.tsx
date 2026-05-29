import Card from '../../shared/components/Card';
import { getAllAccountsWithBalances } from '../../features/accounts/accountService';
import { formatCurrency } from '../../shared/utils/currency';
import './AccountsPage.css';

/**
 * Månadsro – Kontosida (Build 2)
 */
export default function AccountsPage() {
  const accountsData = getAllAccountsWithBalances();

  const typeLabels: Record<string, { label: string; icon: string }> = {
    checking: { label: 'Transaktionskonto', icon: '💳' },
    savings: { label: 'Sparkonto', icon: '💰' },
    buffer: { label: 'Buffertkonto', icon: '🛡️' },
    shared: { label: 'Gemensamt konto', icon: '🏡' },
    other: { label: 'Övrigt konto', icon: '🏦' },
  };

  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-container__title">Konton</h1>

      <div className="accounts-page__list">
        {accountsData.map(({ account, balance }, idx) => {
          const typeInfo = typeLabels[account.type] || typeLabels.other;

          return (
            <Card key={account.id} className="accounts-page__card" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="accounts-page__card-header">
                <div className="accounts-page__title-area">
                  <span className="accounts-page__icon">{typeInfo.icon}</span>
                  <div className="accounts-page__name-col">
                    <span className="accounts-page__name">{account.name}</span>
                    <span className="accounts-page__type">{typeInfo.label}</span>
                  </div>
                </div>
                <div className="accounts-page__balance">
                  {formatCurrency(balance)}
                </div>
              </div>

              <div className="accounts-page__actions">
                <button className="accounts-page__btn" disabled title="Kommer i Build 3">
                  Lägg till transaktion
                </button>
                <button className="accounts-page__btn" disabled title="Kommer i Build 3">
                  Justera saldo
                </button>
                <button className="accounts-page__btn" disabled title="Kommer i Build 3">
                  Visa historik
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
