/**
 * Generic API fetch helper for JSON responses.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // If endpoint is relative, let it resolve to current domain (or Vite proxy in dev)
  const response = await fetch(endpoint, {
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
