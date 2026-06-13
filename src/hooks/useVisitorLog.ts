/**
 * useVisitorLog — Enhanced with IPstack geo-location + Supabase analytics
 * ─────────────────────────────────────────────────────────────────────────
 * Called from RouterEffects in App.tsx on every route change.
 * Logs: page, referrer, city/country, device type → Supabase visitor_events table
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logVisitorEvent } from '@/lib/ipstack';

export function useVisitorLog() {
  const location = useLocation();

  useEffect(() => {
    const ref = document.referrer || undefined;

    logVisitorEvent({
      page: location.pathname,
      referrer: ref,
      eventType: 'pageview',
    }).catch(() => {
      // Analytics must NEVER break the site
    });

  }, [location.pathname]);
}
