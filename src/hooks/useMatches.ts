import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { ActivitySuggestion, MatchResponse } from '../types/database';

export interface MatchParticipantWithFamily {
  match_id: string;
  family_id: string;
  response: MatchResponse;
  responded_at: string | null;
  family: { id: string; name: string };
}

export interface MatchWithParticipants {
  id: string;
  group_id: string;
  date: string;
  status: string;
  match_participants: MatchParticipantWithFamily[];
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export function useMatches(groupId?: string) {
  return useQuery({
    queryKey: ['matches', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(
          'id, group_id, date, status, match_participants(match_id, family_id, response, responded_at, family:families(id, name))'
        )
        .eq('group_id', groupId!)
        .gte('date', todayIso())
        .order('date', { ascending: true });
      if (error) throw error;
      return data as unknown as MatchWithParticipants[];
    },
  });
}

export function useMatch(matchId?: string) {
  return useQuery({
    queryKey: ['match', matchId],
    enabled: !!matchId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(
          'id, group_id, date, status, match_participants(match_id, family_id, response, responded_at, family:families(id, name))'
        )
        .eq('id', matchId!)
        .single();
      if (error) throw error;
      return data as unknown as MatchWithParticipants;
    },
  });
}

export function useRespondToMatch(matchId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ familyId, response }: { familyId: string; response: MatchResponse }) => {
      if (!matchId) throw new Error('Missing match');
      const { error } = await supabase
        .from('match_participants')
        .update({ response, responded_at: new Date().toISOString() })
        .eq('match_id', matchId)
        .eq('family_id', familyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useActivitySuggestions() {
  return useQuery({
    queryKey: ['activity-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('activity_suggestions').select('*').order('title');
      if (error) throw error;
      return data as ActivitySuggestion[];
    },
    staleTime: Infinity,
  });
}
