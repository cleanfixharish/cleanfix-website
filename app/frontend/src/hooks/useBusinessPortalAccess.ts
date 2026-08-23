import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/auth';

type PortalKind = 'provider' | 'partner';
type RelationshipStatus = 'missing' | 'pending' | 'active' | 'paused' | 'rejected' | 'revoked' | 'unavailable';

export function useBusinessPortalAccess(kind: PortalKind) {
  const { user, loading } = useAuth();
  const [business, setBusiness] = useState<boolean | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus>('missing');
  const [accessChecking, setAccessChecking] = useState(false);
  useEffect(() => {
    if (loading) return;
    if (!user) { setBusiness(false); setAuthorized(false); setRelationshipStatus('missing'); setAccessChecking(false); return; }
    let active = true;
    setBusiness(null);
    setAuthorized(false);
    setRelationshipStatus('missing');
    setAccessChecking(true);
    const load = async () => {
      try {
        const profile = await authApi.getProfile();
        if (!active) return;
        const isBusiness = profile?.account_type === 'business';
        setBusiness(isBusiness);
        if (!isBusiness) return;

        const access = await authApi.getBusinessAccess();
        if (!active) return;
        const expectedType = kind === 'provider' ? 'managed_provider' : 'referral_partner';
        const relationship = access.relationships.find((item) => item.relationship_type === expectedType);
        if (!relationship || relationship.status !== 'active') {
          setRelationshipStatus(relationship?.status || 'missing');
          return;
        }

        const context = await authApi.getBusinessPortalContext(kind);
        if (!active) return;
        if (context.status === 'active' && context.relationship_type === expectedType) {
          setAuthorized(true);
          setRelationshipStatus('active');
        } else {
          setRelationshipStatus('unavailable');
        }
      } catch {
        if (!active) return;
        setAuthorized(false);
        setRelationshipStatus('unavailable');
        setBusiness((value) => value ?? false);
      } finally {
        if (active) setAccessChecking(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [kind, loading, user]);
  return { user, checking: loading || accessChecking || (!!user && business === null), business: business === true, authorized, relationshipStatus };
}
