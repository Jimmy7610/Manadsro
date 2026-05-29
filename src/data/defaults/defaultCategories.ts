import type { Category } from '../../types/models';

// INSTÄLLNING - Standardkategorier som skapas för nya hushåll
export const defaultCategories: Omit<Category, 'id' | 'householdId'>[] = [
  { name: 'Boende', emoji: '🏠', icon: '🏠', color: '#5B8C6F', sortOrder: 0, isDefault: true, active: true, system: true },
  { name: 'Mat', emoji: '🍽️', icon: '🍽️', color: '#E8A87C', sortOrder: 1, isDefault: true, active: true, system: true },
  { name: 'Transport', emoji: '🚗', icon: '🚗', color: '#6886A0', sortOrder: 2, isDefault: true, active: true, system: true },
  { name: 'Försäkringar', emoji: '🛡️', icon: '🛡️', color: '#8B7EC8', sortOrder: 3, isDefault: true, active: true, system: true },
  { name: 'Abonnemang', emoji: '📱', icon: '📱', color: '#4A9B9B', sortOrder: 4, isDefault: true, active: true, system: true },
  { name: 'Barn', emoji: '👶', icon: '👶', color: '#D4A574', sortOrder: 5, isDefault: true, active: true, system: true },
  { name: 'Husdjur', emoji: '🐾', icon: '🐾', color: '#A0785A', sortOrder: 6, isDefault: true, active: true, system: true },
  { name: 'Sparande', emoji: '💰', icon: '💰', color: '#5FAD7A', sortOrder: 7, isDefault: true, active: true, system: true },
  { name: 'Nöje', emoji: '🎉', icon: '🎉', color: '#C96B8C', sortOrder: 8, isDefault: true, active: true, system: true },
  { name: 'Hälsa', emoji: '🩺', icon: '🩺', color: '#D4726A', sortOrder: 9, isDefault: true, active: true, system: true },
  { name: 'Kläder', emoji: '👕', icon: '👕', color: '#7B9EA8', sortOrder: 10, isDefault: true, active: true, system: true },
  { name: 'Övrigt', emoji: '📦', icon: '📦', color: '#9E9E9E', sortOrder: 11, isDefault: true, active: true, system: true },
];
