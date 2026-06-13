/**
 * Sentry Error Monitoring — Panya Global
 * ─────────────────────────────────────────────
 * Setup:
 * 1. Sign up at https://sentry.io (free 5,000 errors/month)
 * 2. Create a new project → React
 * 3. Copy the DSN and add to .env:
 *    VITE_SENTRY_DSN=https://xxx@o123456.ingest.sentry.io/789
 *
 * Features enabled:
 * - Automatic JavaScript error capture
 * - React component error boundaries
 * - Performance tracing (page loads, API calls)
 * - User context (email when logged in)
 * - Breadcrumbs (what user did before the error)
 */

import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';
const IS_PROD = import.meta.env.PROD;
const APP_ENV = import.meta.env.MODE || 'development';

/**
 * Initialize Sentry — call this ONCE at app startup (main.tsx)
 */
export function initSentry() {
  if (!SENTRY_DSN) {
    if (IS_PROD) {
      console.warn('[Sentry] VITE_SENTRY_DSN not set. Error tracking disabled.');
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENV,
    release: `panya-global@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,

    // Performance monitoring — trace 20% of transactions in prod
    tracesSampleRate: IS_PROD ? 0.2 : 1.0,

    // Session replay — capture 10% of sessions, 100% with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Filter out noise
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error exception captured',
      'Network request failed',
      /^Loading chunk .* failed/,
    ],

    // Before sending — strip sensitive data
    beforeSend(event) {
      // Remove any credit card or password data from breadcrumbs
      if (event.request?.data) {
        const data = event.request.data as Record<string, unknown>;
        if (data.password) data.password = '[FILTERED]';
        if (data.cardNumber) data.cardNumber = '[FILTERED]';
      }
      return event;
    },
  });
}

/**
 * Set user context so errors are linked to a specific admin
 */
export function setSentryUser(user: { id: string; email: string; role?: string } | null) {
  if (!SENTRY_DSN) return;
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email, role: user.role });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Manually capture an error with extra context
 */
export function captureError(error: Error | unknown, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) {
    console.error('[Error]', error, context);
    return;
  }
  Sentry.withScope((scope) => {
    if (context) scope.setExtras(context);
    Sentry.captureException(error);
  });
}

/**
 * Log a custom event / breadcrumb (e.g., quote submitted, payment initiated)
 */
export function trackEvent(category: string, message: string, data?: Record<string, unknown>) {
  if (!SENTRY_DSN) return;
  Sentry.addBreadcrumb({
    category,
    message,
    level: 'info',
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Sentry Error Boundary component — wraps parts of the UI
 * Usage: <SentryErrorBoundary fallback={<p>Something went wrong</p>}>
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

export default Sentry;
