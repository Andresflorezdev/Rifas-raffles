import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

interface AuthState {
  session: Session | null;
  demoAuthenticated: boolean;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setDemoAuthenticated: (authenticated: boolean) => void;
  initialize: () => () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  demoAuthenticated: false,
  loading: true,
  setSession: (session) => set({ session, loading: false }),
  setDemoAuthenticated: (demoAuthenticated) =>
    set({ demoAuthenticated, loading: false }),
  initialize: () => {
    if (!isSupabaseConfigured) {
      set({ loading: false });
      return () => undefined;
    }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) set({ session: data.session, loading: false });
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) set({ session, loading: false });
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  },
  signOut: async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    sessionStorage.removeItem('raffles-email');
    sessionStorage.removeItem('raffles-name');
    set({ session: null, demoAuthenticated: false });
  },
}));
