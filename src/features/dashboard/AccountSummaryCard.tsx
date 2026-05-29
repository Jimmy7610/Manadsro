import Card from '../../shared/components/Card';
import { getAllAccountsWithBalances } from '../../features/accounts/accountService';
import { formatCurrency } from '../../shared/utils/currency';
import type { AccountType } from '../../types/models';
import { useAppData } from '../../storage/services/AppDataContext';
import './AccountSummaryCard.css';

/**
 * Månadsro – Sammanfattning av alla konton med saldon.
 */

// INSTÄLLNING - Ikoner för kontotyper
const accountTypeIcons: Record<AccountType, string> = {
  checking: '🏦',
  savings: '💰',
  buffer: '🛡️',
  shared: '🏡',
  other: '📋',
};

// INSTÄLLNING - Svenska namn för kontotyper
const accountTypeLabels: Record<AccountType, string> = {
  checking: 'Lönekonto',
  savings: 'Sparkonto',
  buffer: 'Buffert',
  shared: 'Gemensamt',
  other: 'Övrigt',
};

export default function AccountSummaryCard() {
  const { data } = useAppData();
  const accountsWithBalances = getAllAccountsWithBalances(data.accounts, data.transactions);
  const totalBalance = accountsWithBalances.reduce((sum, { balance }) => sum + balance, 0);

  return (
    <Card className="account-summary">
      <div className="account-summary__header">
        <h3 className="account-summary__title">Konton</h3>
        <span className="account-summary__count">{accountsWithBalances.length} konton</span>
      </div>

      <ul className="account-summary__list">
        {accountsWithBalances.map(({ account, balance }) => (
          <li key={account.id} className="account-summary__item">
            <div className="account-summary__icon">
              {accountTypeIcons[account.type]}
            </div>
            <div className="account-summary__info">
              <div className="account-summary__name">{account.name}</div>
              <div className="account-summary__type">{accountTypeLabels[account.type]}</div>
            </div>
            <div className="account-summary__balance">
              {formatCurrency(balance)}
            </div>
          </li>
        ))}
      </ul>

      <div className="account-summary__divider" />

      <div className="account-summary__total">
        <span className="account-summary__total-label">Totalt saldo</span>
        <span className="account-summary__total-amount">{formatCurrency(totalBalance)}</span>
      </div>
    </Card>
  );
}
