import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadRuntimeConfig } from './lib/config.ts';
import { initializePwaInstall } from './lib/pwaInstall.ts';

// Capture Chromium's one-time install event before React and runtime config load.
// This keeps the Install button reliable even on slow networks.
initializePwaInstall();

function mountApp() {
  if (
    document
      .querySelector('meta[name="prerender-static-page"]')
      ?.getAttribute('content') === 'blog'
  ) {
    return;
  }

  createRoot(document.getElementById('root')!).render(<App />);
  window.requestAnimationFrame(() => {
    window.setTimeout(() => document.getElementById('cf-splash')?.classList.add('cf-ready'), 180);
  });
}

// Never let the branded splash hide a usable page if a script or network task stalls.
window.setTimeout(() => document.getElementById('cf-splash')?.classList.add('cf-ready'), 1200);

// Public first paint must not wait on /api/config. Same-origin relative URLs
// work immediately; runtime config can still refine the API host afterwards.
void loadRuntimeConfig().catch(() => undefined);
mountApp();
