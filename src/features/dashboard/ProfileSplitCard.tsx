import Card from '../../shared/components/Card';

import { formatCurrency } from '../../shared/utils/currency';
import { useAppData } from '../../storage/services/AppDataContext';
import './ProfileSplitCard.css';

/**
 * Månadsro – Visar fördelning mellan profiler (t.ex. vad Jimmy vs Malin har på sina respektive transaktionskonton, plus det gemensamma).
 *
 * INSTÄLLNING - Visuella färger för staplarna sätts i CSS eller via styles.
 */

import type { Profile, Transaction, ExpectedIncome } from '../../types/models';

interface ProfileIncome {
  profile: Profile;
  income: number;
  percentage: number;
}

function calculateProfileIncomes(
  profiles: Profile[],
  transactions: Transaction[],
  expectedIncomes: ExpectedIncome[]
): ProfileIncome[] {
  const currentMonthKey = new Date().toISOString().substring(0, 7);

  const incomeByProfile: ProfileIncome[] = profiles
    .filter((p) => !p.isShared)
    .map((profile) => {
      // Find actual received incomes this month
      const received = transactions
        .filter((tx) => tx.profileId === profile.id && tx.type === 'income' && tx.date.startsWith(currentMonthKey))
        .reduce((sum, tx) => sum + tx.amount, 0);

      // Find expected but not yet received
      const missingExpected = expectedIncomes
        .filter(ei => ei.profileId === profile.id && ei.status === 'expected' && ei.expectedDate.startsWith(currentMonthKey))
        .reduce((sum, ei) => sum + ei.amount, 0);

      const income = received + missingExpected;
      return { profile, income, percentage: 0 };
    });

  const totalIncome = incomeByProfile.reduce((sum, p) => sum + p.income, 0);

  return incomeByProfile.map((p) => ({
    ...p,
    percentage: totalIncome > 0 ? Math.round((p.income / totalIncome) * 100) : 0,
  }));
}

export default function ProfileSplitCard() {
  const { data } = useAppData();
  const profiles = data.profiles;
  const transactions = data.transactions;
  const expectedIncomes = data.expectedIncomes || [];
  const profileIncomes = calculateProfileIncomes(profiles, transactions, expectedIncomes);
  const totalIncome = profileIncomes.reduce((sum, p) => sum + p.income, 0);

  return (
    <Card className="profile-split">
      <div className="profile-split__header">
        <h3 className="profile-split__title">Inkomstfördelning (inkl. förväntat)</h3>
      </div>

      {profileIncomes.length === 0 ? (
        <div className="profile-split__empty">Inga profiler med inkomster.</div>
      ) : (
        <>
          <div className="profile-split__list">
            {profileIncomes.map(({ profile, income, percentage }) => (
              <div key={profile.id} className="profile-split__item">
                <div className="profile-split__item-header">
                  <div className="profile-split__profile">
                    <div
                      className="profile-split__emoji"
                      style={{ background: `${profile.color}18` }}
                    >
                      {profile.emoji}
                    </div>
                    <span className="profile-split__name">{profile.name}</span>
                  </div>
                  <div className="profile-split__amounts">
                    <div className="profile-split__income">{formatCurrency(income)}</div>
                    <div className="profile-split__percentage-text">{percentage}%</div>
                  </div>
                </div>
                <div className="profile-split__bar-container">
                  <div
                    className="profile-split__bar"
                    style={{
                      width: `${percentage}%`,
                      background: profile.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Visuell sammanfattning – en horisontell bar med segmenten */}
          <div className="profile-split__summary">
            {profileIncomes.map(({ profile, percentage }) => (
              <div
                key={profile.id}
                className="profile-split__summary-segment"
                style={{
                  flex: percentage,
                  background: profile.color,
                }}
              />
            ))}
          </div>

          <div className="profile-split__total">
            <span className="profile-split__total-label">Total hushållsinkomst</span>
            <span className="profile-split__total-amount">{formatCurrency(totalIncome)}</span>
          </div>
        </>
      )}
    </Card>
  );
}
