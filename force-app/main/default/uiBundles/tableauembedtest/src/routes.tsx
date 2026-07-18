import type { RouteObject } from 'react-router';
import AppLayout from './appLayout';
import EmbedTestPage from './pages/EmbedTestPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <EmbedTestPage />,
      },
    ],
  },
  {
    // App Launcher and org-hosted routes can include non-root paths.
    // Render the embed test for any unmatched path to avoid blank screens
    // (and so the OAuth redirect back to this bundle's URL still renders it).
    path: '*',
    element: <AppLayout />,
    children: [
      {
        path: '*',
        element: <EmbedTestPage />,
      },
    ],
  },
];
