import { createContext, useContext, ReactNode } from "react";
import { SupabaseAuthProvider } from "@/hooks/useAuth";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
};

export const useAuth = () => {
  const context = useContext(AuthProvider as any);
  return context;
};
