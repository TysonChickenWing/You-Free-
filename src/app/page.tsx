'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useMyFamilies } from '../hooks/useFamilies';
import { useMyGroups } from '../hooks/useGroups';
import { useAuth } from '../providers/AuthProvider';

// Root gate: decides whether to send the user into auth, onboarding, or the
// main app based on session + family/group membership.
export default function Home() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const familiesQuery = useMyFamilies();
  const groupsQuery = useMyGroups();

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.replace('/sign-in');
      return;
    }
    if (familiesQuery.isLoading || groupsQuery.isLoading) return;

    const hasFamily = (familiesQuery.data?.length ?? 0) > 0;
    if (!hasFamily) {
      router.replace('/onboarding/family');
      return;
    }

    const hasGroup = (groupsQuery.data?.length ?? 0) > 0;
    if (!hasGroup) {
      router.replace('/onboarding/group');
      return;
    }

    router.replace('/free-days');
  }, [authLoading, session, familiesQuery.isLoading, familiesQuery.data, groupsQuery.isLoading, groupsQuery.data, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
