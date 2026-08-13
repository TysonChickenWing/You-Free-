import { useLocalSearchParams } from 'expo-router';
import { FlatList, View } from 'react-native';

import { Body, Caption, EmptyState, Heading, Screen, Subheading } from '../../src/components/ui';
import { useGroupMembers } from '../../src/hooks/useGroupMembers';
import { useMyGroups } from '../../src/hooks/useGroups';
import { spacing } from '../../src/theme/colors';

export default function GroupDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupsQuery = useMyGroups();
  const membersQuery = useGroupMembers(id);

  const membership = groupsQuery.data?.find((g) => g.group.id === id);
  const members = membersQuery.data ?? [];

  if (!membership) return null;

  return (
    <Screen style={{ gap: spacing.md }}>
      <View>
        <Heading>{membership.group.name}</Heading>
        <Caption>
          Invite code: {membership.group.invite_code} · {membership.group.type === 'golf_group' ? 'Golf group' : 'Family group'}
        </Caption>
        <Body muted>Share the invite code so others can join.</Body>
      </View>

      <Subheading>Members</Subheading>
      {members.length === 0 ? (
        <EmptyState title="No members yet" body="Share the invite code to get this group started." />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => (
            <View>
              <Body>{item.profile?.full_name || 'Someone'}</Body>
              {item.family ? <Caption>{item.family.name}</Caption> : null}
            </View>
          )}
        />
      )}
    </Screen>
  );
}
