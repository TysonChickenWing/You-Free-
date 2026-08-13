import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { GolfRsvpStatus, GolfSessionStatus } from '../types/database';
import { useAuth } from '../providers/AuthProvider';

export interface GolfSessionParticipantWithProfile {
  session_id: string;
  profile_id: string;
  status: GolfRsvpStatus;
  profile: { id: string; full_name: string };
}

export interface GolfSessionWithParticipants {
  id: string;
  group_id: string;
  date: string;
  time_window: string | null;
  course: string | null;
  status: GolfSessionStatus;
  golf_session_participants: GolfSessionParticipantWithProfile[];
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export function useGolfSessions(groupId?: string) {
  return useQuery({
    queryKey: ['golf-sessions', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_sessions')
        .select(
          'id, group_id, date, time_window, course, status, golf_session_participants(session_id, profile_id, status, profile:profiles(id, full_name))'
        )
        .eq('group_id', groupId!)
        .gte('date', todayIso())
        .order('date', { ascending: true });
      if (error) throw error;
      return data as unknown as GolfSessionWithParticipants[];
    },
  });
}

export function useGolfSession(sessionId?: string) {
  return useQuery({
    queryKey: ['golf-session', sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('golf_sessions')
        .select(
          'id, group_id, date, time_window, course, status, golf_session_participants(session_id, profile_id, status, profile:profiles(id, full_name))'
        )
        .eq('id', sessionId!)
        .single();
      if (error) throw error;
      return data as unknown as GolfSessionWithParticipants;
    },
  });
}

export function useUpdateGolfSession(sessionId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (changes: { course?: string; time_window?: string; status?: GolfSessionStatus }) => {
      if (!sessionId) throw new Error('Missing session');
      const { error } = await supabase.from('golf_sessions').update(changes).eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['golf-session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['golf-sessions'] });
    },
  });
}

export function useRsvpGolfSession(sessionId?: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: GolfRsvpStatus) => {
      if (!sessionId || !session?.user) throw new Error('Missing session context');
      const { error } = await supabase
        .from('golf_session_participants')
        .upsert(
          { session_id: sessionId, profile_id: session.user.id, status },
          { onConflict: 'session_id,profile_id' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['golf-session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['golf-sessions'] });
    },
  });
}
