import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { routes } from '@/config/routes';
import { Button } from '@/shared/ui';

/**
 * Calm, on-brand fallback for route errors and unmatched paths. Self-contained so it
 * works both inside the app shell (child route errorElement) and standalone (if the
 * layout itself fails). Reassures that local data is safe and offers a way forward.
 */
export function RouteError() {
  const error = useRouteError();
  // Rendered as a normal element for the catch-all route → no error in context (404).
  const status = isRouteErrorResponse(error) ? error.status : error == null ? 404 : 500;
  const notFound = status === 404;

  if (import.meta.env.DEV && error != null && !isRouteErrorResponse(error)) {
    console.error('[WatchVerse] Route error:', error);
  }

  return (
    <div
      role="alert"
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
    >
      <AlertTriangle className="mb-4 h-10 w-10 text-accent" aria-hidden="true" />
      <h1 className="font-display text-2xl font-bold text-text-primary">
        {notFound ? 'Page not found' : 'Something went wrong'}
      </h1>
      <p className="mt-2 max-w-md text-sm text-text-secondary">
        {notFound
          ? "That page doesn't exist — it may have moved. Your tracked library is safe on this device."
          : 'An unexpected error interrupted this page. Your tracked library is safe on this device.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link to={routes.home}>Back to Home</Link>
        </Button>
        {!notFound ? (
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Reload
          </Button>
        ) : null}
      </div>
    </div>
  );
}
