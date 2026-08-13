import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { ChatContextType, ChatMessage } from '../types/database';
import { useAuth } from '../providers/AuthProvider';

// Chats are created automatically by DB triggers when a match or golf
// session forms, so we just need to look one up by its context.
export function useChatId(contextType: ChatContextType, contextId?: string) {
  return useQuery({
    queryKey: ['chat-id', contextType, contextId],
    enabled: !!contextId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('id')
        .eq('context_type', contextType)
        .eq('context_id', contextId!)
        .maybeSingle();
      if (error) throw error;
      return data?.id as string | undefined;
    },
  });
}

export function useChatMessages(chatId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['chat-messages', chatId],
    enabled: !!chatId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as ChatMessage[];
    },
  });

  useEffect(() => {
    if (!chatId) return;
    const channel = supabase
      .channel(`chat_messages:${chatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          queryClient.setQueryData<ChatMessage[]>(['chat-messages', chatId], (prev) => {
            const next = payload.new as ChatMessage;
            if (prev?.some((m) => m.id === next.id)) return prev;
            return [...(prev ?? []), next];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient]);

  return query;
}

export function useSendChatMessage(chatId?: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      if (!chatId || !session?.user) throw new Error('Chat not ready yet');
      const trimmed = body.trim();
      if (!trimmed) return;
      const { error } = await supabase
        .from('chat_messages')
        .insert({ chat_id: chatId, sender_id: session.user.id, body: trimmed });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
    },
  });
}
