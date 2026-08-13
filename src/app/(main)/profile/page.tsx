'use client';

import { useState } from 'react';

import { Body, Button, Caption, Heading, TextField } from '../../../components/ui';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../providers/AuthProvider';

export default function ProfilePage() {
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
    <div className="flex flex-col gap-4">
      <Heading>Profile</Heading>
      <Caption>{session?.user.email}</Caption>

      <TextField label="Your name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      <Button label="Save" onClick={handleSave} loading={saving} disabled={!name.trim()} />

      <div className="h-4" />

      <Body muted>Signed in as {session?.user.email}</Body>
      <Button label="Sign out" variant="danger" onClick={() => signOut()} />
    </div>
  );
}
