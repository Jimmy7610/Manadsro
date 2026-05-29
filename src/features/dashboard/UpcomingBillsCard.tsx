import Card from '../../shared/components/Card';
import { useAppData } from '../../storage/services/AppDataContext';
import { calculateUpcomingBills } from '../../shared/utils/calculations';
import { formatCurrency } from '../../shared/utils/currency';
import { formatDate, daysUntil } from '../../shared/utils/date';
import './UpcomingBillsCard.css';

/**
 * Månadsro – Visar kommande obetalda/planerade räkningar.
 *
 * INSTÄLLNING - Antal dagar som räknas som "urgent" kan ändras nedan
 */

// INSTÄLLNING - Gräns i dagar för varningsfärg
const URGENT_DAYS = 3;

const statusLabels: Record<string, string> = {
  planned: 'Planerad',
  unpaid: 'Obetald',
};

export default function UpcomingBillsCard() {
  const { data } = useAppData();
  const currentMonthKey = new Date().toISOString().substring(0, 7);
  const upcomingBills = calculateUpcomingBills(data.bills, currentMonthKey);

  const getDaysLabel = (days: number): string => {
    if (days < 0) return `${Math.abs(days)} dagar sedan`;
    if (days === 0) return 'Idag';
    if (days === 1) return 'Imorgon';
    return `om ${days} dagar`;
  };

  return (
    <Card className="upcoming-bills">
      <div className="upcoming-bills__header">
        <h3 className="upcoming-bills__title">Kommande räkningar</h3>
        <span className="upcoming-bills__count">{upcomingBills.length} st</span>
      </div>

      {upcomingBills.length === 0 ? (
        <div className="upcoming-bills__empty">
          🎉 Inga kommande räkningar just nu – lugn och ro!
        </div>
      ) : (
        <ul className="upcoming-bills__list">
          {upcomingBills.map((bill) => {
            const days = daysUntil(bill.dueDate);
            const isUrgent = days <= URGENT_DAYS && days >= 0;
            const isOverdue = days < 0;

            return (
              <li
                key={bill.id}
                className={`upcoming-bills__item${isUrgent ? ' upcoming-bills__item--urgent' : ''}`}
              >
                <div className="upcoming-bills__info">
                  <div className="upcoming-bills__name">{bill.name}</div>
                  <div className="upcoming-bills__due">
                    <span>{formatDate(bill.dueDate)}</span>
                    <span>·</span>
                    <span
                      className={`upcoming-bills__days${
                        isOverdue
                          ? ' upcoming-bills__days--overdue'
                          : isUrgent
                          ? ' upcoming-bills__days--urgent'
                          : ''
                      }`}
                    >
                      {getDaysLabel(days)}
                    </span>
                  </div>
                </div>
                <div className="upcoming-bills__right">
                  <span className="upcoming-bills__amount">
                    {formatCurrency(bill.amount)}
                  </span>
                  <span
                    className={`upcoming-bills__badge upcoming-bills__badge--${bill.status}`}
                  >
                    {statusLabels[bill.status] ?? bill.status}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
