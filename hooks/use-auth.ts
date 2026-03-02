'use client';

import { useEffect, useState } from 'react';

export interface LoyaltyUser {
  phone: string;
  name?: string;
  stamps?: number;
  mode?: 'customer' | 'employee';
}

export function useAuth() {
  const [user, setUser] = useState<LoyaltyUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const logout = () => {
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userName');
    localStorage.removeItem('userMode');
    setUser(null);
  };

  return { user, loading, logout };
}
