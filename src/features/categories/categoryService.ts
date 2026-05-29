import { getCategories } from '../../storage/services/appDataService';
import type { Category } from '../../types/models';

export function getCategoryById(id: string): Category | undefined {
  return getCategories().find(c => c.id === id);
}

export function getCategoryName(id: string): string {
  return getCategoryById(id)?.name ?? 'Okänd';
}

export function getCategoryEmoji(id: string): string {
  return getCategoryById(id)?.emoji ?? '📦';
}
