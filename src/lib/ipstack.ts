/**
 * IPstack Geo-IP & Visitor Analytics Service
 * ─────────────────────────────────────────────
 * Refactored to use native PHP backend log.php
 */

export interface GeoLocation {
  ip: string;
  city: string | null;
  region: string | null;
  country_name: string | null;
  country_code: string | null;
  latitude: number | null;
  longitude: number | null;
  zip: string | null;
  isp?: string | null;
  connection_type?: string | null;
}

/**
 * Get visitor's geo-location. 
 * Since the backend now does this automatically during logging,
 * we can return a dummy or fetch if strictly needed for UI.
 */
export async function getVisitorGeo(): Promise<GeoLocation | null> {
  return null;
}

/**
 * Log a visitor event.
 * Hits the PHP backend which automatically resolves IP, Geo, OS, etc.
 */
export async function logVisitorEvent(params: {
  page: string;
  referrer?: string;
  geo?: GeoLocation | null;
  eventType?: 'pageview' | 'quote_click' | 'track_search' | 'whatsapp_click' | 'call_click' | 'form_submit';
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const pageName = params.eventType && params.eventType !== 'pageview' 
      ? `Action: ${params.eventType} on ${params.page}`
      : params.page;

    const url = new URL('/api/visitors/log.php', window.location.origin);
    url.searchParams.set('page', pageName);
    if (params.referrer) url.searchParams.set('ref', params.referrer);

    // Using sendBeacon for analytics so it fires even if the user navigates away
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url.toString());
    } else {
      fetch(url.toString(), { keepalive: true }).catch(() => {});
    }
  } catch (err: unknown) {
    // Analytics errors should NEVER break the app — fail silently
    console.warn('[Analytics] Failed to log event:', err);
  }
}

/**
 * Track a specific user action (quote click, WhatsApp tap, etc.)
 */
export async function trackUserAction(
  eventType: 'quote_click' | 'track_search' | 'whatsapp_click' | 'call_click' | 'form_submit' | 'brochure_download' | 'pay_click',
  metadata?: Record<string, unknown>
) {
  await logVisitorEvent({
    page: window.location.pathname,
    eventType,
    metadata,
  });
}
