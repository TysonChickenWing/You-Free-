import { format, parseISO } from 'date-fns';
import { FlatList, Pressable, View } from 'react-native';
import { router } from 'expo-router';

import { Body, Caption, EmptyState, Heading, Screen, Subheading } from '../../src/components/ui';
import { useActiveGroup } from '../../src/hooks/useActiveGroup';
import { useMatches, type MatchWithParticipants } from '../../src/hooks/useMatches';
import { colors, radius, spacing } from '../../src/theme/colors';

export default function HomeFeed() {
  const { active, isLoading: groupLoading } = useActiveGroup('family_group');
  const matchesQuery = useMatches(active?.group.id);

  if (groupLoading) return null;

  if (!active) {
    return (
      <Screen>
        <EmptyState
          title="No family group yet"
          body="Join or create a family group from the Groups tab, then mark your free dates to start matching."
        />
      </Screen>
    );
  }

  const matches = matchesQuery.data ?? [];

  return (
    <Screen style={{ gap: spacing.md }}>
      <View>
        <Heading>You’re both free!</Heading>
        <Caption>{active.group.name}</Caption>
      </View>

      {matches.length === 0 ? (
        <EmptyState
          title="No matches yet"
          body="Mark some free dates on the Calendar tab — we'll show you here as soon as another family in the group is free the same day."
        />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => <MatchCard match={item} myFamilyId={active.familyId ?? undefined} />}
        />
      )}
    </Screen>
  );
}

function MatchCard({ match, myFamilyId }: { match: MatchWithParticipants; myFamilyId?: string }) {
  const otherFamilies = match.match_participants.filter((p) => p.family_id !== myFamilyId);
  const mine = match.match_participants.find((p) => p.family_id === myFamilyId);
  const names = otherFamilies.map((p) => p.family?.name).filter(Boolean).join(', ');

  return (
    <Pressable
      onPress={() => router.push(`/match/${match.id}`)}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
          gap: spacing.xs,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Subheading>{format(parseISO(match.date), 'EEEE, MMM d')}</Subheading>
      <Body muted>You’re both free with {names || 'another family'}</Body>
      {mine ? <Caption>Your status: {responseLabel(mine.response)}</Caption> : null}
    </Pressable>
  );
}

function responseLabel(response: string) {
  switch (response) {
    case 'host':
      return "You’re hosting";
    case 'suggest_activity':
      return 'Looking for an activity';
    case 'declined':
      return 'Declined';
    default:
      return 'Waiting on your response';
  }
}
