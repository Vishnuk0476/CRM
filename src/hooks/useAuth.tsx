/**
 * useAuth.tsx
 * Authentication and authorization hook utilizing PHP backend.
 */
import { useState, useEffect } from 'react';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'manager';
  name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user data in local storage
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ data: any; error: Error | null }> => {
    try {
      // Fetch CSRF token first (with cache-buster to bypass any cached 301 redirects)
      const csrfRes = await fetch(`/api/csrf.php?_t=${Date.now()}`, { credentials: 'include' });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrf_token || '';

      const response = await fetch(`/api/admin-login.php?_t=${Date.now()}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Login failed');
      }

      const loggedInUser: AdminUser = result.data.user;
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      return { data: loggedInUser, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin-logout.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        }
      });
    } catch (err: unknown) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return { user, loading, login, logout };
}

export function usePermissions() {
  const { user } = useAuth();
  
  const isSuper = user?.role === 'super_admin' || user?.role === 'owner';
  
  return {
    isAdmin: isSuper || user?.role === 'admin',
    isManager: user?.role === 'manager',
    // Strictly enforcing RBAC on frontend
    canDelete: isSuper || user?.role === 'admin',
    canEdit: isSuper || user?.role === 'admin' || user?.role === 'manager',
  };
}
