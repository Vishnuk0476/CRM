import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  designation: string;
  company: string;
  account_tier: 'free' | 'premium';
}

interface CustomerAuthContextType {
  customer: Customer | null;
  token: string | null;
  login: (token: string, customerData: Customer) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load from localStorage on mount
    const storedCustomer = localStorage.getItem('customer_data');
    if (storedCustomer) {
      setToken('cookie_managed'); // Placeholder to keep isAuthenticated true
      try {
        setCustomer(JSON.parse(storedCustomer));
      } catch (e) {
        // Parse error, clear auth
        localStorage.removeItem('customer_data');
      }
    }
  }, []);

  const login = (newToken: string, customerData: Customer) => {
    setToken('cookie_managed');
    setCustomer(customerData);
    localStorage.setItem('customer_data', JSON.stringify(customerData));
    navigate('/portal/dashboard');
  };

  const logout = () => {
    setToken(null);
    setCustomer(null);
    localStorage.removeItem('customer_data');
    navigate('/portal/login');
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
