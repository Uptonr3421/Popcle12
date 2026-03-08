import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  role: string | null;
  phone: string | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData(session.user.id, session.user.phone);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserData(session.user.id, session.user.phone);
      else {
        setRole(null);
        setPhone(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserData(userId: string, userPhone: string | undefined) {
    const { data } = await supabase
      .from('users')
      .select('user_type, phone')
      .eq('id', userId)
      .single();
    setRole(data?.user_type ?? 'customer');
    setPhone(data?.phone ?? userPhone ?? null);
    setLoading(false);
  }

  return { session, role, phone, loading };
}
