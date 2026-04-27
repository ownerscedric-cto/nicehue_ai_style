"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, UserProfile } from "./types";

const USER_KEY = "styleai_user";
const PROFILE_KEY = "styleai_profile";
const ADMIN_EMAIL = "admin@demo.com";

const EMPTY_PROFILE: UserProfile = { preferredStyles: [] };

interface SessionContextValue {
  user: User | null;
  profile: UserProfile;
  isAdmin: boolean;
  hydrated: boolean;
  login: (email: string) => void;
  logout: () => void;
  saveProfile: (profile: UserProfile) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem(USER_KEY);
      if (rawUser) setUser(JSON.parse(rawUser) as User);

      const rawProfile = localStorage.getItem(PROFILE_KEY);
      if (rawProfile) setProfile(JSON.parse(rawProfile) as UserProfile);
    } catch {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(PROFILE_KEY);
    }
    setHydrated(true);
  }, []);

  const login = useCallback((email: string) => {
    const next: User = {
      email,
      isAdmin: email === ADMIN_EMAIL,
    };
    setUser(next);
    localStorage.setItem(USER_KEY, JSON.stringify(next));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  const saveProfile = useCallback((next: UserProfile) => {
    setProfile(next);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  }, []);

  return (
    <SessionContext.Provider
      value={{
        user,
        profile,
        isAdmin: user?.isAdmin ?? false,
        hydrated,
        login,
        logout,
        saveProfile,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
