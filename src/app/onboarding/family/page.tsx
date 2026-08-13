'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Body, Button, Heading, Screen, TextField } from '../../../components/ui';
import { useCreateFamily, useJoinFamily } from '../../../hooks/useFamilies';

// A "family" is your own household unit — you'll invite the rest of it in
// later. Every friend group you join happens on behalf of one of your
// families.
export default function CreateOrJoinFamily() {
  const router = useRouter();
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
      router.replace('/onboarding/group');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }

  async function handleJoin() {
    setError(null);
    try {
      await joinFamily.mutateAsync(code);
      router.replace('/onboarding/group');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }

  return (
    <Screen>
      <Heading>Set up your family</Heading>
      <Body muted>Create a new family, or join one someone already started with their invite code.</Body>

      <div className="flex gap-2">
        <Button label="Create" variant={mode === 'create' ? 'primary' : 'secondary'} onClick={() => setMode('create')} />
        <Button label="Join with code" variant={mode === 'join' ? 'primary' : 'secondary'} onClick={() => setMode('join')} />
      </div>

      {mode === 'create' ? (
        <div className="flex flex-col gap-3">
          <TextField label="Family name" placeholder="The Smiths" value={name} onChange={(e) => setName(e.target.value)} />
          {error ? <Body>{error}</Body> : null}
          <Button label="Create family" onClick={handleCreate} loading={loading} disabled={!name.trim()} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <TextField
            label="Invite code"
            placeholder="e.g. 8F3K2LQ9"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          {error ? <Body>{error}</Body> : null}
          <Button label="Join family" onClick={handleJoin} loading={loading} disabled={!code.trim()} />
        </div>
      )}
    </Screen>
  );
}
