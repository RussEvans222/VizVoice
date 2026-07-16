import type { RouteObject } from 'react-router';
import AppLayout from './appLayout';
import VizVoicePage from './pages/VizVoicePage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <VizVoicePage />,
      },
    ],
  },
  {
    // App Launcher and org-hosted routes can include non-root paths.
    // Render VizVoice for any unmatched path to avoid blank screens.
    path: '*',
    element: <AppLayout />,
    children: [
      {
        path: '*',
        element: <VizVoicePage />,
      },
    ],
  },
];
