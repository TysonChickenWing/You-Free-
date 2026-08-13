'use client';

import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { use, useState } from 'react';

import { ChatThread } from '../../../components/ChatThread';
import { Button, Caption, Heading, Subheading, TextField } from '../../../components/ui';
import { useGolfSession, useRsvpGolfSession, useUpdateGolfSession } from '../../../hooks/useGolfSessions';
import { useAuth } from '../../../providers/AuthProvider';

export default function GolfSessionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const sessionQuery = useGolfSession(id);
  const rsvp = useRsvpGolfSession(id);
  const updateSession = useUpdateGolfSession(id);
  const { session: authSession } = useAuth();
  const [courseDraft, setCourseDraft] = useState('');

  const golfSession = sessionQuery.data;
  const mine = golfSession?.golf_session_participants.find((p) => p.profile_id === authSession?.user.id);
  const playing = golfSession?.golf_session_participants.filter((p) => p.status !== 'out') ?? [];

  if (!golfSession) return null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-4 px-5 py-6">
      <Link href="/golf" className="text-sm text-text-secondary">
        ← Back
      </Link>

      <div>
        <Heading>{format(parseISO(golfSession.date), 'EEEE, MMMM d')}</Heading>
        <Caption>
          {playing.map((p) => p.profile?.full_name).filter(Boolean).join(', ') || 'Nobody confirmed yet'}
        </Caption>
        {golfSession.course ? <Caption>Course idea: {golfSession.course}</Caption> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Subheading>Are you playing?</Subheading>
        <div className="flex gap-2">
          <Button label="I'm in" variant={mine?.status === 'in' ? 'golf' : 'secondary'} onClick={() => rsvp.mutate('in')} />
          <Button label="Maybe" variant={mine?.status === 'maybe' ? 'primary' : 'secondary'} onClick={() => rsvp.mutate('maybe')} />
          <Button label="Out" variant={mine?.status === 'out' ? 'danger' : 'secondary'} onClick={() => rsvp.mutate('out')} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Subheading>Lock in a course</Subheading>
        <TextField
          placeholder={golfSession.course ?? 'Where are you playing?'}
          value={courseDraft}
          onChange={(e) => setCourseDraft(e.target.value)}
        />
        <Button
          label="Update course"
          variant="secondary"
          disabled={!courseDraft.trim()}
          onClick={() => {
            updateSession.mutate({ course: courseDraft.trim() });
            setCourseDraft('');
          }}
        />
      </div>

      <div className="flex flex-1 flex-col">
        <Subheading>Chat</Subheading>
        <Caption>Hash out the tee time here.</Caption>
        <ChatThread contextType="golf_session" contextId={golfSession.id} />
      </div>
    </div>
  );
}
