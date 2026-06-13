// Supabase removed

const IPSTACK_KEY = import.meta.env.VITE_IPSTACK_KEY || '211d6d43647c4e92375abe5004f362b0';

export interface VisitorGeoData {
  ip: string;
  country_name: string;
  country_code: string;
  region_name: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone_id?: string;
  postal?: string;
  flag?: string; // We'll compute this from country_code
  device_type?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  os?: string;
  referrer?: string;
  current_url?: string;
}

/**
 * Gets geographical data for the current user based on their IP
 */
export async function getVisitorGeoData(): Promise<VisitorGeoData | null> {
  try {
    // We'll use ipapi.co as it has a generous free tier with HTTPS support and no API key required
    // (ipstack free tier doesn't support HTTPS which causes mixed content errors on Vercel/Netlify)
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      // Fallback to IPstack if ipapi fails (assuming we're on localhost HTTP, otherwise it might fail)
      if (window.location.protocol === 'http:') {
        return getFallbackIpstackData();
      }
      throw new Error('ipapi.co failed and cannot use ipstack on HTTPS');
    }
    
    const data = await response.json();
    
    if (data.error) {
      if (window.location.protocol === 'http:') {
        return getFallbackIpstackData();
      }
      return null;
    }

    return {
      ip: data.ip,
      country_name: data.country_name,
      country_code: data.country,
      region_name: data.region,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone_id: data.timezone,
      postal: data.postal,
      flag: getFlagEmoji(data.country)
    };
  } catch (error: unknown) {
    console.error('Error fetching geo data:', error);
    // If we're on HTTP (localhost), try IPstack as fallback
    if (window.location.protocol === 'http:') {
      return getFallbackIpstackData();
    }
    return null;
  }
}

async function getFallbackIpstackData(): Promise<VisitorGeoData | null> {
  try {
    // Note: IPstack free tier only works on HTTP!
    const response = await fetch(`http://api.ipstack.com/check?access_key=${IPSTACK_KEY}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.error) return null;

    return {
      ip: data.ip,
      country_name: data.country_name,
      country_code: data.country_code,
      region_name: data.region_name,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      flag: getFlagEmoji(data.country_code)
    };
  } catch (error: unknown) {
    console.error('IPstack fallback failed:', error);
    return null;
  }
}

/**
 * Logs visitor details to backend database
 */
export async function logVisitorToSupabase(data: VisitorGeoData): Promise<void> {
  try {
    const url = new URL('/api/visitors/log.php', window.location.origin);
    if (data.current_url) {
      url.searchParams.set('page', data.current_url);
    }
    if (data.referrer) {
      url.searchParams.set('ref', data.referrer);
    }
    
    // We fire and forget
    fetch(url.toString(), { keepalive: true }).catch(() => {});
  } catch (err: unknown) {
    console.warn('Could not log visitor to database:', err);
  }
}

/**
 * Converts a 2-letter country code to a flag emoji
 */
export function getFlagEmoji(countryCode: string | undefined): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('panya_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('panya_session_id', sessionId);
  }
  return sessionId;
}
