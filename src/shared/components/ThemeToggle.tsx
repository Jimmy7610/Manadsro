import { useState, useEffect } from 'react';
import './ThemeToggle.css';

/**
 * Månadsro – Temväxlare (ljust/mörkt).
 * Sparar valet i localStorage.
 *
 * INSTÄLLNING - Standard-tema sätts här
 */
const STORAGE_KEY = 'manadsro-theme';
const DEFAULT_THEME = 'light';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'dark' || stored === 'light') ? stored : DEFAULT_THEME;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Byt till mörkt tema' : 'Byt till ljust tema'}
      title={theme === 'light' ? 'Mörkt tema' : 'Ljust tema'}
    >
      <span className="theme-toggle__icon">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
