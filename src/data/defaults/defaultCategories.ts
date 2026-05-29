import type { Category } from '../../types/models';

// INSTÄLLNING - Standardkategorier som skapas för nya hushåll
export const defaultCategories: Omit<Category, 'id' | 'householdId'>[] = [
  { name: 'Boende', emoji: '🏠', color: '#5B8C6F', sortOrder: 0, isDefault: true },
  { name: 'Mat', emoji: '🛒', color: '#E8A87C', sortOrder: 1, isDefault: true },
  { name: 'Transport', emoji: '🚗', color: '#6886A0', sortOrder: 2, isDefault: true },
  { name: 'Försäkringar', emoji: '🛡️', color: '#8B7EC8', sortOrder: 3, isDefault: true },
  { name: 'Abonnemang', emoji: '📱', color: '#4A9B9B', sortOrder: 4, isDefault: true },
  { name: 'Barn', emoji: '👶', color: '#D4A574', sortOrder: 5, isDefault: true },
  { name: 'Husdjur', emoji: '🐾', color: '#A0785A', sortOrder: 6, isDefault: true },
  { name: 'Sparande', emoji: '💰', color: '#5FAD7A', sortOrder: 7, isDefault: true },
  { name: 'Nöje', emoji: '🎬', color: '#C96B8C', sortOrder: 8, isDefault: true },
  { name: 'Hälsa', emoji: '❤️', color: '#D4726A', sortOrder: 9, isDefault: true },
  { name: 'Kläder', emoji: '👕', color: '#7B9EA8', sortOrder: 10, isDefault: true },
  { name: 'Övrigt', emoji: '📦', color: '#9E9E9E', sortOrder: 11, isDefault: true },
];
