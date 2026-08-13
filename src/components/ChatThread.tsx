'use client';

import { useEffect, useRef, useState } from 'react';

import { useChatId, useChatMessages, useSendChatMessage } from '../hooks/useChat';
import { useAuth } from '../providers/AuthProvider';
import { useProfile } from '../hooks/useProfile';
import type { ChatContextType, ChatMessage } from '../types/database';
import { Caption, TextField } from './ui';

export function ChatThread({ contextType, contextId }: { contextType: ChatContextType; contextId?: string }) {
  const chatIdQuery = useChatId(contextType, contextId);
  const chatId = chatIdQuery.data;
  const messagesQuery = useChatMessages(chatId);
  const sendMessage = useSendChatMessage(chatId);
  const { session } = useAuth();
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = messagesQuery.data ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend() {
    if (!draft.trim()) return;
    const text = draft;
    setDraft('');
    await sendMessage.mutateAsync(text);
  }

  if (!contextId) return null;

  return (
    <div className="flex min-h-[320px] flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto py-2">
        {messages.length === 0 ? <Caption>No messages yet — say hi and start planning.</Caption> : null}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} isMine={message.sender_id === session?.user.id} />
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        className="flex items-center gap-2 pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <div className="flex-1">
          <TextField
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message the group..."
          />
        </div>
        <button
          type="submit"
          disabled={!draft.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary disabled:bg-border disabled:text-text-muted"
          aria-label="Send"
        >
          ➤
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ message, isMine }: { message: ChatMessage; isMine: boolean }) {
  const senderQuery = useProfile(message.sender_id ?? undefined);
  const senderName = senderQuery.data?.full_name || 'Someone';

  return (
    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
      {!isMine ? <Caption>{senderName}</Caption> : null}
      <div
        className={`mt-0.5 max-w-[80%] rounded-md px-4 py-2 text-[15px] ${
          isMine ? 'bg-primary text-on-primary' : 'border border-border bg-surface text-text-primary'
        }`}
      >
        {message.body}
      </div>
    </div>
  );
}
