import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import { Body, Button, Heading, Screen, TextField } from '../../src/components/ui';
import { useCreateFamily, useJoinFamily } from '../../src/hooks/useFamilies';
import { spacing } from '../../src/theme/colors';

// A "family" is your own household unit — you'll invite the rest of it in
// later. Every friend group you join happens on behalf of one of your
// families.
export default function CreateOrJoinFamily() {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createFamily = useCreateFamily();
  const joinFamily = useJoinFamily();
  const loading = createFamily.isPending || joinFamily.isPending;

  async function handleCreate() {
    setError(null);
    try {
      await createFamily.mutateAsync(name.trim());
      router.replace('/(onboarding)/create-or-join-group');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }

  async function handleJoin() {
    setError(null);
    try {
      await joinFamily.mutateAsync(code);
      router.replace('/(onboarding)/create-or-join-group');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md }}>
        <Heading>Set up your family</Heading>
        <Body muted>
          Create a new family, or join one someone already started with their invite code.
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
          <>
            <TextField
              label="Family name"
              placeholder="The Smiths"
              value={name}
              onChangeText={setName}
            />
            {error ? <Body>{error}</Body> : null}
            <Button label="Create family" onPress={handleCreate} loading={loading} disabled={!name.trim()} />
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
            <Button label="Join family" onPress={handleJoin} loading={loading} disabled={!code.trim()} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
