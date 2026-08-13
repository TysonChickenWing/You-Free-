import { format, parseISO } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ChatThread } from '../../src/components/ChatThread';
import { Button, Caption, Heading, Screen, Subheading, TextField } from '../../src/components/ui';
import { useGolfSession, useRsvpGolfSession, useUpdateGolfSession } from '../../src/hooks/useGolfSessions';
import { useAuth } from '../../src/providers/AuthProvider';
import { spacing } from '../../src/theme/colors';

export default function GolfSessionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
    <Screen style={{ gap: spacing.md }}>
      <View>
        <Heading>{format(parseISO(golfSession.date), 'EEEE, MMMM d')}</Heading>
        <Caption>
          {playing.map((p) => p.profile?.full_name).filter(Boolean).join(', ') || 'Nobody confirmed yet'}
        </Caption>
        {golfSession.course ? <Caption>Course idea: {golfSession.course}</Caption> : null}
      </View>

      <View style={{ gap: spacing.sm }}>
        <Subheading>Are you playing?</Subheading>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button label="I'm in" variant={mine?.status === 'in' ? 'golf' : 'secondary'} onPress={() => rsvp.mutate('in')} />
          <Button label="Maybe" variant={mine?.status === 'maybe' ? 'primary' : 'secondary'} onPress={() => rsvp.mutate('maybe')} />
          <Button label="Out" variant={mine?.status === 'out' ? 'danger' : 'secondary'} onPress={() => rsvp.mutate('out')} />
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Subheading>Lock in a course</Subheading>
        <TextField
          placeholder={golfSession.course ?? 'Where are you playing?'}
          value={courseDraft}
          onChangeText={setCourseDraft}
        />
        <Button
          label="Update course"
          variant="secondary"
          disabled={!courseDraft.trim()}
          onPress={() => {
            updateSession.mutate({ course: courseDraft.trim() });
            setCourseDraft('');
          }}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Subheading>Chat</Subheading>
        <Caption>Hash out the tee time here.</Caption>
        <ChatThread contextType="golf_session" contextId={golfSession.id} />
      </View>
    </Screen>
  );
}
