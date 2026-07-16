// MUST be first import - patches customElements.define before any SDK loads
import './patchCustomElements';

import { createBrowserRouter, RouterProvider } from 'react-router';
import { routes } from '@/routes';
import { createRoot } from 'react-dom/client';
import './styles/global.css';

function resolveBasename(): string | undefined {
  const baseHref = document.querySelector('base')?.getAttribute('href');
  if (baseHref) {
    try {
      const parsed = new URL(baseHref, window.location.origin).pathname.replace(/\/+$/, '');
      if (parsed) {
        return parsed;
      }
    } catch {
      // Fall through to SFDC_ENV fallback.
    }
  }

  const rawBasePath = (globalThis as any).SFDC_ENV?.basePath;
  if (typeof rawBasePath === 'string') {
    const normalized = rawBasePath.replace(/\/+$/, '');
    return normalized || undefined;
  }

  return undefined;
}

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('VizVoice bootstrap failed: missing #root element');
  }
  const router = createBrowserRouter(routes, { basename: resolveBasename() });
  createRoot(rootElement).render(<RouterProvider router={router} />);
} catch (error) {
  const fallback = document.createElement('pre');
  fallback.style.whiteSpace = 'pre-wrap';
  fallback.style.padding = '16px';
  fallback.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  fallback.textContent = `VizVoice failed to initialize.\n${String(error)}`;
  document.body.replaceChildren(fallback);
  console.error('VizVoice bootstrap error', error);
}
