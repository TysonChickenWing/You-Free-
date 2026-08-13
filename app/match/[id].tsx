import { format, parseISO } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ChatThread } from '../../src/components/ChatThread';
import { Body, Button, Caption, Heading, Screen, Subheading } from '../../src/components/ui';
import { useActivitySuggestions, useMatch, useRespondToMatch } from '../../src/hooks/useMatches';
import { useActiveGroup } from '../../src/hooks/useActiveGroup';
import { spacing } from '../../src/theme/colors';

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
    <Screen style={{ gap: spacing.md }}>
      <View>
        <Heading>{format(parseISO(match.date), 'EEEE, MMMM d')}</Heading>
        <Caption>With {others.map((p) => p.family?.name).filter(Boolean).join(', ') || 'the group'}</Caption>
      </View>

      {mine ? (
        <View style={{ gap: spacing.sm }}>
          <Subheading>What do you want to do?</Subheading>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            <Button
              label="We'll host"
              variant={mine.response === 'host' ? 'primary' : 'secondary'}
              onPress={() => respond.mutate({ familyId: mine.family_id, response: 'host' })}
            />
            <Button
              label="Suggest an activity"
              variant={mine.response === 'suggest_activity' ? 'primary' : 'secondary'}
              onPress={() => {
                respond.mutate({ familyId: mine.family_id, response: 'suggest_activity' });
                setShowSuggestions(true);
              }}
            />
            <Button
              label="Can't make it"
              variant={mine.response === 'declined' ? 'danger' : 'secondary'}
              onPress={() => respond.mutate({ familyId: mine.family_id, response: 'declined' })}
            />
          </View>
        </View>
      ) : null}

      {showSuggestions ? (
        <View style={{ gap: spacing.xs }}>
          <Subheading>Ideas</Subheading>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {(suggestionsQuery.data ?? []).map((s) => (
              <View key={s.id} style={{ width: 180, padding: spacing.sm, borderRadius: 12, borderWidth: 1, borderColor: '#E4E7EC' }}>
                <Subheading>{s.title}</Subheading>
                <Body muted>{s.description}</Body>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={{ flex: 1 }}>
        <Subheading>Chat</Subheading>
        <ChatThread contextType="match" contextId={match.id} />
      </View>
    </Screen>
  );
}
