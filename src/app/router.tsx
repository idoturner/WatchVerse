import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { routes } from '@/config/routes';
import { CinemaModeScreen } from '@/features/cinema-mode';
import { CollectionDetailScreen, CollectionsScreen } from '@/features/collections';
import { DiscoverScreen } from '@/features/discover';
import { HomeScreen } from '@/features/home';
import { LibraryScreen } from '@/features/library';
import { SettingsScreen } from '@/features/settings';
import { TitleDetailScreen } from '@/features/title-details';
import { AppLayout } from './AppLayout';
import { RouteError } from './RouteError';

// Lazy-loaded so its charting dependency (Recharts) stays out of the main bundle.
const DashboardScreen = lazy(() =>
  import('@/features/dashboard').then((m) => ({ default: m.DashboardScreen })),
);

export const router = createBrowserRouter([
  {
    path: routes.home,
    element: <AppLayout />,
    // If the shell itself fails, fall back to a standalone error page.
    errorElement: <RouteError />,
    children: [
      {
        // Pathless layout route: page errors render inside the shell (header/nav/footer kept).
        errorElement: <RouteError />,
        children: [
          { index: true, element: <HomeScreen /> },
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<p className="py-10 text-text-tertiary">Loading…</p>}>
                <DashboardScreen />
              </Suspense>
            ),
          },
          { path: 'discover', element: <DiscoverScreen /> },
          { path: 'library', element: <LibraryScreen /> },
          { path: 'cinema', element: <CinemaModeScreen /> },
          { path: 'collections', element: <CollectionsScreen /> },
          { path: 'collections/:id', element: <CollectionDetailScreen /> },
          { path: 'settings', element: <SettingsScreen /> },
          { path: 'title/:mediaType/:id', element: <TitleDetailScreen /> },
          // Unmatched paths render the calm 404 inside the shell.
          { path: '*', element: <RouteError /> },
        ],
      },
    ],
  },
]);
