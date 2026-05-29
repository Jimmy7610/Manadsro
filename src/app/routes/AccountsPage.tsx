import { useState } from 'react';
import Card from '../../shared/components/Card';
import { getAllAccountsWithBalances } from '../../features/accounts/accountService';
import { formatCurrency } from '../../shared/utils/currency';
import { useAppData } from '../../storage/services/AppDataContext';
import AccountModal from '../../features/accounts/AccountModal';
import BalanceAdjustmentModal from '../../features/transactions/BalanceAdjustmentModal';
import type { Account } from '../../types/models';
import './AccountsPage.css';

/**
 * Månadsro – Kontosida (Build 7)
 */
export default function AccountsPage() {
  const { data, archiveAccount, updateAccount } = useAppData();
  const accountsData = getAllAccountsWithBalances(data.accounts, data.transactions);

  const [showArchived, setShowArchived] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [adjustmentAccountId, setAdjustmentAccountId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const typeLabels: Record<string, { label: string; icon: string }> = {
    checking: { label: 'Transaktionskonto', icon: '💳' },
    savings: { label: 'Sparkonto', icon: '💰' },
    buffer: { label: 'Buffertkonto', icon: '🛡️' },
    shared: { label: 'Gemensamt konto', icon: '🏡' },
    other: { label: 'Övrigt konto', icon: '🏦' },
  };

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleArchive = (account: Account) => {
    if (window.confirm('Vill du arkivera det här kontot?\nKontot döljs från aktiva översikter men historiken finns kvar.')) {
      archiveAccount(account.id);
      showToast('Kontot arkiverades.');
    }
  };

  const handleRestore = (account: Account) => {
    updateAccount(account.id, { archived: false });
    showToast('Kontot återställdes.');
  };

  const openAddModal = () => {
    setEditingAccount(undefined);
    setShowModal(true);
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setShowModal(true);
  };

  const closeAndShowToast = () => {
    setShowModal(false);
    showToast('Kontot sparades.');
  };

  const filteredAccounts = accountsData.filter(a => showArchived ? true : !a.account.archived);

  return (
    <div className="page-container animate-fade-in">
      <div className="accounts-page__header">
        <h1 className="page-container__title">Konton</h1>
        <button className="accounts-page__add-btn" onClick={openAddModal}>
          Lägg till konto
        </button>
      </div>

      {message && <div className="accounts-page__toast">{message}</div>}

      <div className="accounts-page__list">
        {filteredAccounts.map(({ account, balance }, idx) => {
          const typeInfo = typeLabels[account.type] || typeLabels.other;
          const owner = data.profiles.find(p => p.id === account.profileId);

          return (
            <Card key={account.id} className={`accounts-page__card ${account.archived ? 'accounts-page__card--archived' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="accounts-page__card-header">
                <div className="accounts-page__title-area">
                  <span className="accounts-page__icon">{typeInfo.icon}</span>
                  <div className="accounts-page__name-col">
                    <span className="accounts-page__name">{account.name}</span>
                    <span className="accounts-page__type">
                      {typeInfo.label} • {owner?.name || 'Okänd'}
                      {account.archived ? ' (Arkiverad)' : ''}
                    </span>
                    {account.note && <span className="accounts-page__note">{account.note}</span>}
                  </div>
                </div>
                <div className="accounts-page__balance">
                  {formatCurrency(balance)}
                </div>
              </div>

              <div className="accounts-page__actions">
                <button className="accounts-page__btn" onClick={() => openEditModal(account)}>
                  Redigera
                </button>
                {account.archived ? (
                  <button className="accounts-page__btn" onClick={() => handleRestore(account)}>
                    Återställ
                  </button>
                ) : (
                  <>
                    <button className="accounts-page__btn" onClick={() => handleArchive(account)}>
                      Arkivera
                    </button>
                    <button className="accounts-page__btn" onClick={() => setAdjustmentAccountId(account.id)}>
                      Justera saldo
                    </button>
                  </>
                )}
                <button className="accounts-page__btn" disabled title="Visa historik (kommer senare)">
                  Historik
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="accounts-page__toggle-archived">
        <label>
          <input 
            type="checkbox" 
            checked={showArchived}
            onChange={e => setShowArchived(e.target.checked)}
          />
          Visa arkiverade konton
        </label>
      </div>

      {showModal && (
        <AccountModal 
          accountToEdit={editingAccount} 
          onClose={closeAndShowToast} 
        />
      )}

      {adjustmentAccountId !== null && (
        <BalanceAdjustmentModal 
          initialAccountId={adjustmentAccountId}
          onClose={() => setAdjustmentAccountId(null)} 
        />
      )}
    </div>
  );
}
