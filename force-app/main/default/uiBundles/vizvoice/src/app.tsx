import { createBrowserRouter, RouterProvider } from 'react-router';
import { routes } from '@/routes';
import { createRoot } from 'react-dom/client';
import './styles/global.css';

// Normalize basename: strip trailing slash so it matches URLs like /lwr/application/ai/c-app
const rawBasePath = (globalThis as any).SFDC_ENV?.basePath;
const basename =
  typeof rawBasePath === 'string' ? rawBasePath.replace(/\/+$/, '') : undefined;
const router = createBrowserRouter(routes, { basename });

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);
