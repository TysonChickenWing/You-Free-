import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { FamilyAvailability, GolfAvailability, GolfTimeWindow } from '../types/database';
import { useAuth } from '../providers/AuthProvider';

// -- Family (free weekend) availability --------------------------------

export function useFamilyAvailability(groupId?: string, familyId?: string) {
  return useQuery({
    queryKey: ['family-availability', groupId, familyId],
    enabled: !!groupId && !!familyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_availability')
        .select('*')
        .eq('group_id', groupId!)
        .eq('family_id', familyId!)
        .order('date', { ascending: true });
      if (error) throw error;
      return data as FamilyAvailability[];
    },
  });
}

export function useToggleFamilyFreeDate(groupId?: string, familyId?: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, isFree }: { date: string; isFree: boolean }) => {
      if (!groupId || !familyId || !session?.user) throw new Error('Missing group or family context');

      if (isFree) {
        const { error } = await supabase.from('family_availability').insert({
          group_id: groupId,
          family_id: familyId,
          date,
          created_by: session.user.id,
        });
        if (error && error.code !== '23505') throw error;
      } else {
        const { error } = await supabase
          .from('family_availability')
          .delete()
          .eq('group_id', groupId)
          .eq('family_id', familyId)
          .eq('date', date);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-availability', groupId, familyId] });
      queryClient.invalidateQueries({ queryKey: ['matches', groupId] });
    },
  });
}

// -- Golf availability ----------------------------------------------------

export function useGolfAvailability(groupId?: string, profileId?: string) {
  return useQuery({
    queryKey: ['golf-availability', groupId, profileId],
    enabled: !!groupId && !!profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_availability')
        .select('*')
        .eq('group_id', groupId!)
        .eq('profile_id', profileId!)
        .order('date', { ascending: true });
      if (error) throw error;
      return data as GolfAvailability[];
    },
  });
}

export function useAddGolfAvailability(groupId?: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      timeWindow,
      coursePreference,
    }: {
      date: string;
      timeWindow: GolfTimeWindow;
      coursePreference?: string;
    }) => {
      if (!groupId || !session?.user) throw new Error('Missing group context');
      const { error } = await supabase.from('golf_availability').upsert(
        {
          group_id: groupId,
          profile_id: session.user.id,
          date,
          time_window: timeWindow,
          course_preference: coursePreference ?? null,
        },
        { onConflict: 'group_id,profile_id,date' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['golf-availability', groupId] });
      queryClient.invalidateQueries({ queryKey: ['golf-sessions', groupId] });
    },
  });
}

export function useRemoveGolfAvailability(groupId?: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (date: string) => {
      if (!groupId || !session?.user) throw new Error('Missing group context');
      const { error } = await supabase
        .from('golf_availability')
        .delete()
        .eq('group_id', groupId)
        .eq('profile_id', session.user.id)
        .eq('date', date);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['golf-availability', groupId] });
      queryClient.invalidateQueries({ queryKey: ['golf-sessions', groupId] });
    },
  });
}
