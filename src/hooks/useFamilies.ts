import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { Family, FamilyRole } from '../types/database';
import { useAuth } from '../providers/AuthProvider';

interface FamilyMembershipRow {
  role: FamilyRole;
  family: Family;
}

export function useMyFamilies() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['my-families', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_members')
        .select('role, family:families(*)')
        .eq('profile_id', userId!);
      if (error) throw error;
      return (data ?? []) as unknown as FamilyMembershipRow[];
    },
  });
}

export function useCreateFamily() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!session?.user) throw new Error('Not signed in');
      const { data, error } = await supabase
        .from('families')
        .insert({ name, created_by: session.user.id })
        .select('*')
        .single();
      if (error) throw error;
      return data as Family;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-families'] });
    },
  });
}

export function useJoinFamily() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!session?.user) throw new Error('Not signed in');
      const code = inviteCode.trim().toUpperCase();
      const { data: family, error: findError } = await supabase
        .from('families')
        .select('*')
        .eq('invite_code', code)
        .maybeSingle();
      if (findError) throw findError;
      if (!family) throw new Error("Couldn't find a family with that invite code.");

      const { error: joinError } = await supabase
        .from('family_members')
        .insert({ family_id: family.id, profile_id: session.user.id, role: 'member' });
      if (joinError && joinError.code !== '23505') throw joinError; // ignore "already a member"

      return family as Family;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-families'] });
    },
  });
}
