import { getVisitorGeoData, logVisitorToSupabase, VisitorGeoData } from '@/services/ipstackService';

// To avoid duplicate tracking of the same page in the same session
const trackedPages = new Set<string>();

export function detectDevice(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

export function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
  if (ua.indexOf('Trident') > -1) return 'Internet Explorer';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  return 'Unknown';
}

export function detectOS(): string {
  const ua = navigator.userAgent;
  if (ua.indexOf('Win') !== -1) return 'Windows';
  if (ua.indexOf('Mac') !== -1) return 'MacOS';
  if (ua.indexOf('Linux') !== -1) return 'Linux';
  if (ua.indexOf('Android') !== -1) return 'Android';
  if (ua.indexOf('like Mac') !== -1) return 'iOS';
  return 'Unknown';
}

export async function trackPageVisit(pageUrl: string = window.location.pathname): Promise<void> {
  // Prevent duplicate tracking
  if (trackedPages.has(pageUrl)) {
    return;
  }
  
  // Exclude admin routes
  if (pageUrl.startsWith('/admin') || pageUrl.startsWith('/login') || pageUrl.startsWith('/register')) {
    return;
  }

  trackedPages.add(pageUrl);

  try {
    // 1. Get Geo Data from IP API
    const geoData = await getVisitorGeoData();
    
    // 2. Combine with client data
    const fullData: VisitorGeoData = {
      ...(geoData || {
        ip: 'unknown',
        country_name: 'Unknown',
        country_code: 'UN',
        region_name: 'Unknown',
        city: 'Unknown',
        latitude: 0,
        longitude: 0
      }),
      device_type: detectDevice(),
      browser: detectBrowser(),
      os: detectOS(),
      referrer: document.referrer || 'direct',
      current_url: window.location.href,
    };

    // 3. Log to Supabase
    await logVisitorToSupabase(fullData);
  } catch (error: unknown) {
    console.warn('[Analytics] Failed to track visitor:', error);
  }
}
