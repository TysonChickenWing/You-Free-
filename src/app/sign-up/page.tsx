'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Body, Button, Screen, TextField, Title } from '../../components/ui';
import { useAuth } from '../../providers/AuthProvider';

export default function SignUp() {
  const { signUpWithPassword } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    <Screen className="justify-center">
      <Title>Create your account</Title>
      <Body muted>You&rsquo;ll add your family and friend groups next.</Body>

      <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField label="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jamie Smith" />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />

        {error ? <Body>{error}</Body> : null}

        <Button label="Create Account" type="submit" loading={loading} disabled={!canSubmit} />
      </form>

      <Link href="/sign-in" className="mt-2 self-center text-[15px] text-text-primary underline">
        Already have an account? Sign in
      </Link>
    </Screen>
  );
}
