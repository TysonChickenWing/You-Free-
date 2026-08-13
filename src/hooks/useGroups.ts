import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { Group, GroupType } from '../types/database';
import { useAuth } from '../providers/AuthProvider';

export interface MyGroupMembership {
  group: Group;
  familyId: string | null;
}

interface GroupMembershipRow {
  family_id: string | null;
  group: Group;
}

export function useMyGroups(type?: GroupType) {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['my-groups', userId, type ?? 'all'],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('family_id, group:groups(*)')
        .eq('profile_id', userId!);
      if (error) throw error;
      const rows = ((data ?? []) as unknown as GroupMembershipRow[]).map((row) => ({
        group: row.group,
        familyId: row.family_id,
      }));
      return type ? rows.filter((row) => row.group.type === type) : rows;
    },
  });
}

export function useCreateGroup() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      type,
      familyId,
    }: {
      name: string;
      type: GroupType;
      familyId?: string;
    }) => {
      if (!session?.user) throw new Error('Not signed in');
      const { data: group, error } = await supabase
        .from('groups')
        .insert({ name, type, created_by: session.user.id })
        .select('*')
        .single();
      if (error) throw error;

      const { error: memberError } = await supabase.from('group_members').insert({
        group_id: group.id,
        profile_id: session.user.id,
        family_id: type === 'family_group' ? familyId ?? null : null,
      });
      if (memberError) throw memberError;

      return group as Group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
    },
  });
}

export function useJoinGroup() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inviteCode, familyId }: { inviteCode: string; familyId?: string }) => {
      if (!session?.user) throw new Error('Not signed in');
      const code = inviteCode.trim().toUpperCase();
      const { data: group, error: findError } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', code)
        .maybeSingle();
      if (findError) throw findError;
      if (!group) throw new Error("Couldn't find a group with that invite code.");

      if (group.type === 'family_group' && !familyId) {
        throw new Error('Pick which family you’re joining as first.');
      }

      const { error: joinError } = await supabase.from('group_members').insert({
        group_id: group.id,
        profile_id: session.user.id,
        family_id: group.type === 'family_group' ? familyId ?? null : null,
      });
      if (joinError && joinError.code !== '23505') throw joinError;

      return group as Group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
    },
  });
}
