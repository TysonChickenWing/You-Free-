'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Body, Button, Screen, TextField, Title } from '../../components/ui';
import { useAuth } from '../../providers/AuthProvider';

export default function SignIn() {
  const { signInWithPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    <Screen className="justify-center">
      <Title>You Free</Title>
      <Body muted>Find the days you’re both free.</Body>

      <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {error ? <Body>{error}</Body> : null}

        <Button label="Sign In" type="submit" loading={loading} disabled={!email || !password} />
      </form>

      <Link href="/sign-up" className="mt-2 self-center text-[15px] text-text-primary underline">
        New here? Create an account
      </Link>
    </Screen>
  );
}
