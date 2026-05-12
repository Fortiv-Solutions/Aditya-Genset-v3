import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { AuthState, UserProfile } from "@/lib/auth";
import { AuthContext } from "@/components/auth/AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
  });

  const loadProfile = useCallback(async (userId: string) => {
    if (!navigator.onLine) {
      console.log("Offline mode: using cached profile");
      const cached = localStorage.getItem("cached_profile_" + userId);
      return cached ? JSON.parse(cached) : null;
    }

    try {
      const fetchPromise = supabase
        .from("profiles")
        .select("user_id, role, full_name, phone")
        .eq("user_id", userId)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout fetching profile")), 5000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) throw error;
      
      if (data) {
        localStorage.setItem("cached_profile_" + userId, JSON.stringify(data));
      }
      
      return data as UserProfile | null;
    } catch (e) {
      console.warn("Failed to fetch profile:", e);
      const cached = localStorage.getItem("cached_profile_" + userId);
      return cached ? JSON.parse(cached) : null;
    }
  }, []);

  const applySession = useCallback(
    async (session: AuthState["session"]) => {
      if (!session?.user) {
        setState({ session: null, user: null, profile: null, loading: false });
        return;
      }

      const profile = await loadProfile(session.user.id);
      setState({ session, user: session.user, profile, loading: false });
    },
    [loadProfile],
  );

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      applySession(data.session).catch((error) => {
        console.error("Unable to load authenticated profile:", error);
        setState({ session: data.session, user: data.session?.user ?? null, profile: null, loading: false });
      });
    }).catch((error) => {
      console.error("Critical error in getSession:", error);
      if (!active) return;
      setState({ session: null, user: null, profile: null, loading: false });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session).catch((error) => {
        console.error("Unable to refresh authenticated profile:", error);
        setState({ session, user: session?.user ?? null, profile: null, loading: false });
      });
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [applySession]);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return null;
    const profile = await loadProfile(state.user.id);
    setState((current) => ({ ...current, profile }));
    return profile;
  }, [loadProfile, state.user]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    setState({ session: null, user: null, profile: null, loading: false });
  }, []);

  const value = useMemo(
    () => ({ ...state, refreshProfile, signOut }),
    [state, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
