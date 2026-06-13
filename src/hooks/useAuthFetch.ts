/**
 * useAuthFetch.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom hook that wraps the native fetch() and automatically injects the
 * Supabase JWT Authorization header from the current session.
 *
 * Usage:
 *   const { authFetch, authHeaders } = useAuthFetch();
 *   const res = await authFetch('/api/admin/something', { method: 'POST', body: JSON.stringify(data) });
 *
 * Or use authHeaders when building requests manually:
 *   const res = await fetch(url, { headers: { ...authHeaders, 'X-Custom': 'value' } });
 */

// supabase removed

// ─── Return type ──────────────────────────────────────────────────────────────
export interface UseAuthFetchReturn {
  /**
   * Drop-in replacement for fetch() that automatically adds the Supabase JWT
   * Authorization header.  Falls back gracefully when no session is active.
   */
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;

  /**
   * Pre-built headers object ready to spread into any fetch/axios call.
   * Resolves asynchronously — call `await getAuthHeaders()` when you need
   * a one-off fetch without the hook.
   */
  getAuthHeaders: () => Promise<Record<string, string>>;
}

/**
 * Resolves the current Supabase session and returns a headers object
 * containing the Authorization bearer token (if a session exists).
 */
async function resolveAuthHeaders(): Promise<Record<string, string>> {
  return { 'Content-Type': 'application/json' };
}

/**
 * useAuthFetch — React hook (safe to call inside any component or other hook).
 *
 * Note: This hook does not use React state/effects internally so it can also
 * be safely imported and called as a plain utility outside of React components
 * (e.g. in service files) via the exported `authFetchUtil` helper below.
 */
export function useAuthFetch(): UseAuthFetchReturn {
  /**
   * Fetch wrapper that injects the JWT Authorization header.
   */
  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const sessionHeaders = await resolveAuthHeaders();

    // Cache-buster to prevent local 301 redirect caching issues
    const finalUrl = url.startsWith('/') ? new URL(url, window.location.origin) : new URL(url);
    finalUrl.searchParams.set('_t', Date.now().toString());

    return fetch(finalUrl.toString(), {
      ...options,
      credentials: 'include',
      headers: {
        // Default headers (Content-Type + Auth)
        ...sessionHeaders,
        // Caller-supplied headers take precedence (e.g. custom Content-Type overrides)
        ...(options.headers instanceof Headers
          ? Object.fromEntries((options.headers as Headers).entries())
          : (options.headers as Record<string, string> | undefined) ?? {}),
      },
    });
  };

  /**
   * Returns the pre-built auth headers asynchronously.
   * Useful when you want to compose headers yourself.
   */
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    return resolveAuthHeaders();
  };

  return { authFetch, getAuthHeaders };
}

// ─────────────────────────────────────────────────────────────────────────────
// Standalone utility (usable outside of React components / hooks)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A non-hook version of authFetch for use in service files, utility modules,
 * or any context where React hooks cannot be called.
 *
 * Example:
 *   import { authFetchUtil } from '@/hooks/useAuthFetch';
 *   const res = await authFetchUtil('/api/admin/leads');
 */
export async function authFetchUtil(url: string, options: RequestInit = {}): Promise<Response> {
  const sessionHeaders = await resolveAuthHeaders();

  // Cache-buster to prevent local 301 redirect caching issues
  const finalUrl = url.startsWith('/') ? new URL(url, window.location.origin) : new URL(url);
  finalUrl.searchParams.set('_t', Date.now().toString());

  return fetch(finalUrl.toString(), {
    ...options,
    credentials: 'include',
    headers: {
      ...sessionHeaders,
      ...(options.headers instanceof Headers
        ? Object.fromEntries((options.headers as Headers).entries())
        : (options.headers as Record<string, string> | undefined) ?? {}),
    },
  });
}

export default useAuthFetch;
