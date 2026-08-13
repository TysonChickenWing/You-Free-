import { useState } from 'react';
import { View } from 'react-native';

import { Body, Button, Caption, Heading, Screen, TextField } from '../../src/components/ui';
import { useAuth } from '../../src/providers/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import { spacing } from '../../src/theme/colors';

export default function ProfileScreen() {
  const { session, profile, signOut, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!session?.user) return;
    setSaving(true);
    await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', session.user.id);
    await refreshProfile();
    setSaving(false);
  }

  return (
    <Screen style={{ gap: spacing.md }}>
      <Heading>Profile</Heading>
      <Caption>{session?.user.email}</Caption>

      <TextField label="Your name" value={name} onChangeText={setName} placeholder="Your name" />
      <Button label="Save" onPress={handleSave} loading={saving} disabled={!name.trim()} />

      <View style={{ height: spacing.lg }} />

      <Body muted>Signed in as {session?.user.email}</Body>
      <Button label="Sign out" variant="danger" onPress={signOut} />
    </Screen>
  );
}
