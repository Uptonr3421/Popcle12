'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import { signOut as supabaseSignOut, to10Digit } from '@/lib/auth';
import type { Session } from '@supabase/supabase-js';

export interface LoyaltyUser {
  phone: string;
  name?: string;
  stamps?: number;
  mode?: 'customer' | 'employee';
}

/**
 * Auth hook that uses Supabase Phone Auth when available,
 * with localStorage fallback if Supabase auth is not configured.
 */
export function useAuth() {
  const [user, setUser] = useState<LoyaltyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Fetch user profile from DB by 10-digit phone
  const fetchUserProfile = useCallback(async (phone10: string): Promise<LoyaltyUser | null> => {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .select('phone, name, user_type, stamp_count')
        .eq('phone', phone10)
        .single();

      if (error || !data) return null;

      return {
        phone: data.phone,
        name: data.name || undefined,
        stamps: data.stamp_count ?? 0,
        mode: (data.user_type as 'customer' | 'employee') || 'customer',
      };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Try Supabase auth first
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabaseClient.auth.getSession();

        if (currentSession?.user?.phone && mounted) {
          setSession(currentSession);
          const phone10 = to10Digit(currentSession.user.phone);
          const profile = await fetchUserProfile(phone10);

          if (profile && mounted) {
            setUser(profile);
            // Sync to localStorage for backward compat
            localStorage.setItem('userPhone', profile.phone);
            if (profile.name) localStorage.setItem('userName', profile.name);
            localStorage.setItem('userMode', profile.mode || 'customer');
          } else if (mounted) {
            // Supabase session exists but no DB profile yet (new user mid-registration)
            setUser({ phone: phone10, mode: 'customer' });
          }
          if (mounted) setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase auth check failed, falling back to localStorage:', err);
      }

      // Fallback: localStorage-based auth
      if (mounted) {
        const userPhone = localStorage.getItem('userPhone');
        const userName = localStorage.getItem('userName');
        const userMode = localStorage.getItem('userMode') as 'customer' | 'employee' | null;

        if (userPhone) {
          setUser({
            phone: userPhone,
            name: userName || undefined,
            mode: userMode || 'customer',
          });
        }
        setLoading(false);
      }
    };

    initAuth();

    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);

        if (event === 'SIGNED_IN' && newSession?.user?.phone) {
          const phone10 = to10Digit(newSession.user.phone);
          const profile = await fetchUserProfile(phone10);

          if (profile) {
            setUser(profile);
            localStorage.setItem('userPhone', profile.phone);
            if (profile.name) localStorage.setItem('userName', profile.name);
            localStorage.setItem('userMode', profile.mode || 'customer');
          } else {
            setUser({ phone: phone10, mode: 'customer' });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('userPhone');
          localStorage.removeItem('userName');
          localStorage.removeItem('userMode');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const logout = useCallback(async () => {
    try {
      await supabaseSignOut();
    } catch (err) {
      console.warn('Supabase sign out failed:', err);
    }
    // Always clear localStorage
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userName');
    localStorage.removeItem('userMode');
    setUser(null);
    setSession(null);
  }, []);

  return { user, loading, logout, session };
}
