/**
 * Generic API fetch helper for JSON responses.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // Use absolute URL if VITE_API_BASE_URL is set (for decoupled deployments like Netlify + InfinityFree)
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    if (!data.success && data.error) {
      throw new Error(data.error);
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return data;
}
