import { useState, useEffect, useCallback } from 'react';

interface ChatbaseUser {
  user_id: string;
  email?: string;
  stripe_accounts?: string[];
}

interface ChatbaseTokenResponse {
  success: boolean;
  token?: string;
  expires_in?: number;
  error?: string;
}

export const useChatbaseToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chatbot-identity.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: ChatbaseTokenResponse = await response.json();

      if (data.success && data.token) {
        setToken(data.token);
        // Store token in localStorage for persistence
        localStorage.setItem('chatbase_token', data.token);
        localStorage.setItem('chatbase_token_expiry', String(Date.now() + (data.expires_in || 3600) * 1000));
        return data.token;
      } else {
        throw new Error(data.error || 'Failed to fetch Chatbase token');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching Chatbase token:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    // Check if we have a valid token in state
    if (token) {
      return token;
    }

    // Check if we have a valid token in localStorage
    const storedToken = localStorage.getItem('chatbase_token');
    const expiryTime = localStorage.getItem('chatbase_token_expiry');

    if (storedToken && expiryTime) {
      const now = Date.now();
      if (now < parseInt(expiryTime)) {
        setToken(storedToken);
        return storedToken;
      } else {
        // Token expired, remove from storage
        localStorage.removeItem('chatbase_token');
        localStorage.removeItem('chatbase_token_expiry');
      }
    }

    // Fetch new token
    return await fetchToken();
  }, [token, fetchToken]);

  const clearToken = useCallback(() => {
    setToken(null);
    localStorage.removeItem('chatbase_token');
    localStorage.removeItem('chatbase_token_expiry');
  }, []);

  // Auto-refresh token when component mounts
  useEffect(() => {
    // Only fetch token if we don't have one
    if (!token && !localStorage.getItem('chatbase_token')) {
      fetchToken();
    }
  }, [token, fetchToken]);

  return {
    token,
    isLoading,
    error,
    getToken,
    fetchToken,
    clearToken,
  };
};