'use client';

import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { use, useState } from 'react';

import { ChatThread } from '../../../components/ChatThread';
import { Body, Button, Caption, Heading, Subheading } from '../../../components/ui';
import { useActiveGroup } from '../../../hooks/useActiveGroup';
import { useActivitySuggestions, useMatch, useRespondToMatch } from '../../../hooks/useMatches';

export default function MatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const matchQuery = useMatch(id);
  const { active } = useActiveGroup('family_group');
  const respond = useRespondToMatch(id);
  const suggestionsQuery = useActivitySuggestions();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const match = matchQuery.data;
  const myFamilyId = active?.familyId ?? undefined;
  const mine = match?.match_participants.find((p) => p.family_id === myFamilyId);
  const others = match?.match_participants.filter((p) => p.family_id !== myFamilyId) ?? [];

  if (!match) return null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-4 px-5 py-6">
      <Link href="/free-days" className="text-sm text-text-secondary">
        ← Back
      </Link>

      <div>
        <Heading>{format(parseISO(match.date), 'EEEE, MMMM d')}</Heading>
        <Caption>With {others.map((p) => p.family?.name).filter(Boolean).join(', ') || 'the group'}</Caption>
      </div>

      {mine ? (
        <div className="flex flex-col gap-2">
          <Subheading>What do you want to do?</Subheading>
          <div className="flex flex-wrap gap-2">
            <Button
              label="We'll host"
              variant={mine.response === 'host' ? 'primary' : 'secondary'}
              onClick={() => respond.mutate({ familyId: mine.family_id, response: 'host' })}
            />
            <Button
              label="Suggest an activity"
              variant={mine.response === 'suggest_activity' ? 'primary' : 'secondary'}
              onClick={() => {
                respond.mutate({ familyId: mine.family_id, response: 'suggest_activity' });
                setShowSuggestions(true);
              }}
            />
            <Button
              label="Can't make it"
              variant={mine.response === 'declined' ? 'danger' : 'secondary'}
              onClick={() => respond.mutate({ familyId: mine.family_id, response: 'declined' })}
            />
          </div>
        </div>
      ) : null}

      {showSuggestions ? (
        <div className="flex flex-col gap-2">
          <Subheading>Ideas</Subheading>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {(suggestionsQuery.data ?? []).map((s) => (
              <div key={s.id} className="w-44 shrink-0 rounded-md border border-border p-3">
                <Subheading>{s.title}</Subheading>
                <Body muted>{s.description}</Body>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col">
        <Subheading>Chat</Subheading>
        <ChatThread contextType="match" contextId={match.id} />
      </div>
    </div>
  );
}
