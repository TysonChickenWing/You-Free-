import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Link, router } from 'expo-router';

import { Body, Button, Screen, TextField, Title } from '../../src/components/ui';
import { useAuth } from '../../src/providers/AuthProvider';
import { spacing } from '../../src/theme/colors';

export default function SignUp() {
  const { signUpWithPassword } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    const { error } = await signUpWithPassword(email.trim(), password, fullName.trim());
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    router.replace('/');
  }

  const canSubmit = fullName.trim().length > 0 && email.length > 0 && password.length >= 6;

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: spacing.md }}>
          <Title>Create your account</Title>
          <Body muted>You’ll add your family and friend groups next.</Body>

          <View style={{ height: spacing.md }} />

          <TextField label="Your name" value={fullName} onChangeText={setFullName} placeholder="Jamie Smith" />
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
            placeholder="At least 6 characters"
          />

          {error ? <Body>{error}</Body> : null}

          <Button label="Create Account" onPress={handleSubmit} loading={loading} disabled={!canSubmit} />

          <Link href="/(auth)/sign-in" style={{ alignSelf: 'center', marginTop: spacing.sm }}>
            <Body>Already have an account? Sign in</Body>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
