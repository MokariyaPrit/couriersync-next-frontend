'use client';

import { Role } from '@/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { api, unwrap } from './api';

/** Lean profile / letterhead from GET /auth/me */
export interface UserInfoProfile {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  companyName: string | null;
  /** Resolved CDN URL for company logo */
  logoUrl?: string | null;
  gstin: string | null;
  panNumber: string | null;
  bankName: string | null;
  bankAccountNo: string | null;
  bankIfsc: string | null;
  upiId: string | null;
  notes: string | null;
  isActive: boolean;
  /** Last day account may log in; view-only for branch managers */
  expiredOn?: string | null;
}

/** Preferences / integrations from GET /auth/config */
export interface UserConfigProfile {
  id: string;
  userId: string;
  sgstPercent: string | number | null;
  cgstPercent: string | number | null;
  igstPercent: string | number | null;
  bookingTabConfig?: {
    account: string[];
    cash: string[];
    cargoAccount?: string[];
    cargoCash?: string[];
  } | null;
  termsAndConditions?: string[] | null;
  insurancePercent?: string | number | null;
  paymentDays?: number | null;
  volumetricDivisor?: number | null;
  ewayBillThreshold?: string | number | null;
  cargoPrintTemplate?: string | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpSecure?: boolean;
  smtpUser?: string | null;
  smtpFromEmail?: string | null;
  smtpConfigured?: boolean;
}

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  userInfo?: UserInfoProfile | null;
}

export const USER_CONFIG_QUERY_KEY = ['user-config'] as const;

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  const refreshMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(unwrap<SessionUser>(data));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(unwrap<SessionUser>(data));
    await qc.invalidateQueries({ queryKey: USER_CONFIG_QUERY_KEY });
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    qc.removeQueries({ queryKey: USER_CONFIG_QUERY_KEY });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

/** Prefs / SMTP / print template — load when booking or settings need them */
export function useUserConfig(options?: { enabled?: boolean }) {
  const { user } = useAuth();
  const enabled = (options?.enabled ?? true) && Boolean(user?.id);

  return useQuery({
    queryKey: USER_CONFIG_QUERY_KEY,
    enabled,
    queryFn: async () => {
      const { data } = await api.get('/auth/config');
      return unwrap<UserConfigProfile>(data);
    },
    staleTime: 60_000,
  });
}
