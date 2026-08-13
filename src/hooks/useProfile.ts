import { useQuery } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

export function useProfile(profileId?: string) {
  return useQuery({
    queryKey: ['profile', profileId],
    enabled: !!profileId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId!).single();
      if (error) throw error;
      return data as Profile;
    },
  });
}
