import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "donor" | "volunteer" | "ngo" | "admin";

interface Profile {
  full_name: string;
  phone: string;
  city: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: Record<string, string>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateActiveStatus: (isActive: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndRole = useCallback(async (userId: string): Promise<AppRole | null> => {
    try {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).single(),
        supabase.from("user_roles").select("role").eq("user_id", userId).single(),
      ]);

      if (profileRes.data) {
        setProfile({
          full_name: profileRes.data.full_name,
          phone: profileRes.data.phone,
          city: profileRes.data.city,
          is_active: profileRes.data.is_active,
        });
      }

      const fetchedRole = roleRes.data?.role as AppRole | null;
      setRole(fetchedRole);
      return fetchedRole;
    } catch (err) {
      console.error("Failed to fetch profile/role:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Set up auth listener FIRST (per Supabase docs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (!session?.user) {
          setProfile(null);
          setRole(null);
          setLoading(false);
        }
        // Don't await here — fetch profile/role via the useEffect below
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch profile and role whenever user changes
  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      fetchProfileAndRole(user.id).finally(() => setLoading(false));
    }
  }, [user?.id, fetchProfileAndRole]);

  const signUp = async (email: string, password: string, metadata: Record<string, string>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const updateActiveStatus = async (isActive: boolean) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: isActive })
      .eq("user_id", user.id);
    if (error) throw error;
    setProfile((prev) => prev ? { ...prev, is_active: isActive } : null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, role, loading, signUp, signIn, signOut, updateActiveStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
