import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import { Body, Button, Caption, Heading, Screen, TextField } from '../../src/components/ui';
import { useMyFamilies } from '../../src/hooks/useFamilies';
import { useCreateGroup, useJoinGroup } from '../../src/hooks/useGroups';
import { spacing } from '../../src/theme/colors';
import type { GroupType } from '../../src/types/database';

// A group is a friend circle. Family groups run the free-weekend matching;
// golf groups run tee-time coordination. Family-group actions happen on
// behalf of one of your families, so we ask which one applies here.
export default function CreateOrJoinGroup() {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [type, setType] = useState<GroupType>('family_group');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const familiesQuery = useMyFamilies();
  const families = familiesQuery.data ?? [];
  const [familyId, setFamilyId] = useState<string | undefined>(undefined);
  const selectedFamilyId = familyId ?? families[0]?.family.id;

  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();
  const loading = createGroup.isPending || joinGroup.isPending;

  async function handleCreate() {
    setError(null);
    try {
      await createGroup.mutateAsync({ name: name.trim(), type, familyId: selectedFamilyId });
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }

  async function handleJoin() {
    setError(null);
    try {
      await joinGroup.mutateAsync({ inviteCode: code, familyId: selectedFamilyId });
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md }}>
        <Heading>Join or start a group</Heading>
        <Body muted>
          Family groups match up free weekends. Golf groups coordinate tee times. You can add more
          of either later.
        </Body>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button
            label="Create"
            variant={mode === 'create' ? 'primary' : 'secondary'}
            onPress={() => setMode('create')}
          />
          <Button
            label="Join with code"
            variant={mode === 'join' ? 'primary' : 'secondary'}
            onPress={() => setMode('join')}
          />
        </View>

        {mode === 'create' ? (
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button
              label="Family group"
              variant={type === 'family_group' ? 'primary' : 'secondary'}
              onPress={() => setType('family_group')}
            />
            <Button
              label="Golf group"
              variant={type === 'golf_group' ? 'golf' : 'secondary'}
              onPress={() => setType('golf_group')}
            />
          </View>
        ) : null}

        {families.length > 1 ? (
          <View style={{ gap: spacing.xs }}>
            <Caption>Joining as which family?</Caption>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {families.map(({ family }) => (
                <Button
                  key={family.id}
                  label={family.name}
                  variant={selectedFamilyId === family.id ? 'primary' : 'secondary'}
                  onPress={() => setFamilyId(family.id)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {mode === 'create' ? (
          <>
            <TextField
              label="Group name"
              placeholder={type === 'golf_group' ? 'Saturday Golf Crew' : 'The Neighborhood Crew'}
              value={name}
              onChangeText={setName}
            />
            {error ? <Body>{error}</Body> : null}
            <Button label="Create group" onPress={handleCreate} loading={loading} disabled={!name.trim()} />
          </>
        ) : (
          <>
            <TextField
              label="Invite code"
              placeholder="e.g. 8F3K2LQ9"
              autoCapitalize="characters"
              value={code}
              onChangeText={setCode}
            />
            {error ? <Body>{error}</Body> : null}
            <Button label="Join group" onPress={handleJoin} loading={loading} disabled={!code.trim()} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
