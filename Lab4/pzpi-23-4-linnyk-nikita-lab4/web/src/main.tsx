import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './theme/design-system.css';
import './theme/animations.css';
import './i18n/index';
import { applyTheme, getTheme } from './theme/theme';
import App from './App';

// Apply saved theme before first render to prevent flash
applyTheme(getTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
