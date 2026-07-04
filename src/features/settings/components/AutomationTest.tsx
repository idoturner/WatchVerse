import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui';
import { getWeeklyRecapConfig, sendMovieActivity } from '@/services/weeklyRecapWebhook';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

// Realistic demo data so the row in Google Sheets looks meaningful during a demo.
const DEMO_EVENT = {
  movieId: 27205,
  title: 'Inception',
  posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
  rating: 9,
  review: 'A dazzling, layered heist through dreams — sample WatchVerse activity event.',
  watchedAt: new Date().toISOString(),
};

/**
 * A small, unobtrusive control that sends one sample `test_event` to the Weekly Recap webhook so
 * the n8n → Google Sheets connection can be demoed. Only this control ever surfaces send status.
 */
export function AutomationTest() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const runTest = async () => {
    const { webhookUrl, automationKey } = getWeeklyRecapConfig();
    if (!webhookUrl) {
      setStatus({
        kind: 'error',
        message: 'Automation isn’t configured — set VITE_WEEKLY_RECAP_WEBHOOK_URL to enable it.',
      });
      return;
    }

    setStatus({ kind: 'sending' });
    const result = await sendMovieActivity('test_event', DEMO_EVENT);
    if (result.ok) {
      setStatus({
        kind: 'success',
        message: automationKey
          ? 'Connected — a sample event was sent to your webhook.'
          : 'Sent, but VITE_WEEKLY_RECAP_AUTOMATION_KEY is missing, so n8n will reject it until you add the key.',
      });
    } else {
      setStatus({
        kind: 'error',
        message: 'Couldn’t reach the webhook. Check the URL and that your n8n workflow is active.',
      });
    }
  };

  const showMessage = status.kind === 'success' || status.kind === 'error';

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-secondary">
        Send a sample WatchVerse activity event to the Weekly WatchVerse Recap webhook.
      </p>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => void runTest()}
        disabled={status.kind === 'sending'}
      >
        {status.kind === 'sending' ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Zap className="h-4 w-4" aria-hidden="true" />
        )}
        Test automation connection
      </Button>

      <p
        role="status"
        aria-live="polite"
        className={cn(
          'flex min-h-[1.25rem] items-center gap-1.5 text-xs',
          status.kind === 'success' ? 'text-text-secondary' : 'text-accent',
        )}
      >
        {showMessage ? (
          <>
            {status.kind === 'success' ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-highlight" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            {status.message}
          </>
        ) : null}
      </p>
    </div>
  );
}
