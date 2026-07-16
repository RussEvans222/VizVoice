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
];
