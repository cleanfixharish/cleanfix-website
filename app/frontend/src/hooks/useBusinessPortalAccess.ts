import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/auth';

export function useBusinessPortalAccess() {
  const { user, loading } = useAuth();
  const [business, setBusiness] = useState<boolean | null>(null);
  useEffect(() => {
    if (loading) return;
    if (!user) { setBusiness(false); return; }
    let active = true;
    setBusiness(null);
    authApi.getProfile().then((profile) => { if (active) setBusiness(profile?.account_type === 'business'); }).catch(() => { if (active) setBusiness(false); });
    return () => { active = false; };
  }, [loading, user]);
  return { user, checking: loading || (!!user && business === null), business: business === true };
}
