import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useChatId, useChatMessages, useSendChatMessage } from '../hooks/useChat';
import { useAuth } from '../providers/AuthProvider';
import { useProfile } from '../hooks/useProfile';
import type { ChatContextType, ChatMessage } from '../types/database';
import { colors, radius, spacing } from '../theme/colors';
import { Caption, TextField } from './ui';

export function ChatThread({ contextType, contextId }: { contextType: ChatContextType; contextId?: string }) {
  const chatIdQuery = useChatId(contextType, contextId);
  const chatId = chatIdQuery.data;
  const messagesQuery = useChatMessages(chatId);
  const sendMessage = useSendChatMessage(chatId);
  const { session } = useAuth();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const messages = messagesQuery.data ?? [];

  async function handleSend() {
    if (!draft.trim()) return;
    const text = draft;
    setDraft('');
    await sendMessage.mutateAsync(text);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }

  if (!contextId) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.sm }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <MessageBubble message={item} isMine={item.sender_id === session?.user.id} />
        )}
        ListEmptyComponent={
          <Caption>No messages yet — say hi and start planning.</Caption>
        }
      />
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center', paddingTop: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <TextField
            value={draft}
            onChangeText={setDraft}
            placeholder="Message the group..."
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
        </View>
        <Pressable
          onPress={handleSend}
          disabled={!draft.trim()}
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.pill,
            backgroundColor: draft.trim() ? colors.primary : colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="send" size={18} color={colors.onPrimary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message, isMine }: { message: ChatMessage; isMine: boolean }) {
  const senderQuery = useProfile(message.sender_id ?? undefined);
  const senderName = senderQuery.data?.full_name || 'Someone';

  return (
    <View style={{ alignItems: isMine ? 'flex-end' : 'flex-start' }}>
      {!isMine ? <Caption>{senderName}</Caption> : null}
      <View
        style={{
          maxWidth: '80%',
          backgroundColor: isMine ? colors.primary : colors.surface,
          borderWidth: isMine ? 0 : 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          marginTop: 2,
        }}
      >
        <Text style={{ fontSize: 15, color: isMine ? colors.onPrimary : colors.textPrimary }}>
          {message.body}
        </Text>
      </View>
    </View>
  );
}
