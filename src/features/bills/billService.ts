import { getBills } from '../../storage/services/appDataService';
import { calculateUpcomingBills } from '../../shared/utils/calculations';
import type { Bill } from '../../types/models';

export function getUpcomingBills(): Bill[] {
  return calculateUpcomingBills(getBills());
}

export function getBillsByStatus(status: Bill['status']): Bill[] {
  return getBills().filter(b => b.status === status);
}
