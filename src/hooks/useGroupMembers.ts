import { useQuery } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';

export interface GroupMemberWithDetails {
  id: string;
  profile_id: string;
  family_id: string | null;
  profile: { id: string; full_name: string };
  family: { id: string; name: string } | null;
}

export function useGroupMembers(groupId?: string) {
  return useQuery({
    queryKey: ['group-members', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('id, profile_id, family_id, profile:profiles(id, full_name), family:families(id, name)')
        .eq('group_id', groupId!);
      if (error) throw error;
      return data as unknown as GroupMemberWithDetails[];
    },
  });
}
