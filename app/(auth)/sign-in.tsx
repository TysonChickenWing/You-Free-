import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Link, router } from 'expo-router';

import { Body, Button, Screen, TextField, Title } from '../../src/components/ui';
import { useAuth } from '../../src/providers/AuthProvider';
import { spacing } from '../../src/theme/colors';

export default function SignIn() {
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    const { error } = await signInWithPassword(email.trim(), password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    router.replace('/');
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: spacing.md }}>
          <Title>You Free</Title>
          <Body muted>Find the days you’re both free.</Body>

          <View style={{ height: spacing.md }} />

          <TextField
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
          />
          <TextField
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
          />

          {error ? <Body>{error}</Body> : null}

          <Button label="Sign In" onPress={handleSubmit} loading={loading} disabled={!email || !password} />

          <Link href="/(auth)/sign-up" style={{ alignSelf: 'center', marginTop: spacing.sm }}>
            <Body>New here? Create an account</Body>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
