import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './shared/styles/global.css';

/**
 * Månadsro – Entrypoint
 * INSTÄLLNING - StrictMode kan stängas av vid behov
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
