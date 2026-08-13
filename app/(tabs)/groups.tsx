import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import { Body, Button, Caption, Heading, Screen, Subheading } from '../../src/components/ui';
import { useMyFamilies } from '../../src/hooks/useFamilies';
import { useMyGroups } from '../../src/hooks/useGroups';
import { colors, radius, spacing } from '../../src/theme/colors';

export default function GroupsScreen() {
  const familiesQuery = useMyFamilies();
  const groupsQuery = useMyGroups();

  const families = familiesQuery.data ?? [];
  const groups = groupsQuery.data ?? [];
  const familyGroups = groups.filter((g) => g.group.type === 'family_group');
  const golfGroups = groups.filter((g) => g.group.type === 'golf_group');

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.lg }}>
        <Heading>Your groups</Heading>

        <Section title="Family groups">
          {familyGroups.length === 0 ? (
            <Body muted>You haven’t joined a family group yet.</Body>
          ) : (
            familyGroups.map(({ group }) => <GroupRow key={group.id} name={group.name} code={group.invite_code} onPress={() => router.push(`/group/${group.id}`)} />)
          )}
        </Section>

        <Section title="Golf groups">
          {golfGroups.length === 0 ? (
            <Body muted>You haven’t joined a golf group yet.</Body>
          ) : (
            golfGroups.map(({ group }) => <GroupRow key={group.id} name={group.name} code={group.invite_code} onPress={() => router.push(`/group/${group.id}`)} />)
          )}
        </Section>

        <Button label="Create or join a group" onPress={() => router.push('/(onboarding)/create-or-join-group')} />

        <Section title="Your families">
          {families.length === 0 ? (
            <Body muted>No families yet.</Body>
          ) : (
            families.map(({ family, role }) => (
              <View
                key={family.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing.md,
                  gap: 2,
                }}
              >
                <Subheading>{family.name}</Subheading>
                <Caption>
                  Invite code: {family.invite_code} · {role}
                </Caption>
              </View>
            ))
          )}
        </Section>

        <Button label="Create or join a family" variant="secondary" onPress={() => router.push('/(onboarding)/create-or-join-family')} />
      </ScrollView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Subheading>{title}</Subheading>
      {children}
    </View>
  );
}

function GroupRow({ name, code, onPress }: { name: string; code: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View>
        <Subheading>{name}</Subheading>
        <Caption>Invite code: {code}</Caption>
      </View>
    </Pressable>
  );
}
