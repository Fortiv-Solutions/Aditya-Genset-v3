import { createContext, useContext } from "react";
import type { AuthState, UserProfile } from "@/lib/auth";

export interface AuthContextValue extends AuthState {
  refreshProfile: () => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
