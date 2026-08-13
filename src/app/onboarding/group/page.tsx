'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Body, Button, Caption, Heading, Screen, TextField } from '../../../components/ui';
import { useMyFamilies } from '../../../hooks/useFamilies';
import { useCreateGroup, useJoinGroup } from '../../../hooks/useGroups';
import type { GroupType } from '../../../types/database';

// A group is a friend circle. Family groups run the free-weekend matching;
// golf groups run tee-time coordination. Family-group actions happen on
// behalf of one of your families, so we ask which one applies here.
export default function CreateOrJoinGroup() {
  const router = useRouter();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [type, setType] = useState<GroupType>('family_group');
  const [name, setName] = useState('');
  const [customCode, setCustomCode] = useState('');
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
      await createGroup.mutateAsync({
        name: name.trim(),
        type,
        familyId: selectedFamilyId,
        inviteCode: customCode.trim() || undefined,
      });
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
      <Heading>Join or start a group</Heading>
      <Body muted>
        Family groups match up free weekends. Golf groups coordinate tee times. You can add more of
        either later.
      </Body>

      <div className="flex gap-2">
        <Button label="Create" variant={mode === 'create' ? 'primary' : 'secondary'} onClick={() => setMode('create')} />
        <Button label="Join with code" variant={mode === 'join' ? 'primary' : 'secondary'} onClick={() => setMode('join')} />
      </div>

      {mode === 'create' ? (
        <div className="flex gap-2">
          <Button
            label="Family group"
            variant={type === 'family_group' ? 'primary' : 'secondary'}
            onClick={() => setType('family_group')}
          />
          <Button
            label="Golf group"
            variant={type === 'golf_group' ? 'golf' : 'secondary'}
            onClick={() => setType('golf_group')}
          />
        </div>
      ) : null}

      {families.length > 1 ? (
        <div className="flex flex-col gap-2">
          <Caption>Joining as which family?</Caption>
          <div className="flex flex-wrap gap-2">
            {families.map(({ family }) => (
              <Button
                key={family.id}
                label={family.name}
                variant={selectedFamilyId === family.id ? 'primary' : 'secondary'}
                onClick={() => setFamilyId(family.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {mode === 'create' ? (
        <div className="flex flex-col gap-3">
          <TextField
            label="Group name"
            placeholder={type === 'golf_group' ? 'Saturday Golf Crew' : 'The Neighborhood Crew'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Invite code (optional)"
            placeholder="Leave blank to get a random one"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
            maxLength={20}
          />
          {error ? <Body>{error}</Body> : null}
          <Button label="Create group" onClick={handleCreate} loading={loading} disabled={!name.trim()} />
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
          <Button label="Join group" onClick={handleJoin} loading={loading} disabled={!code.trim()} />
        </div>
      )}
    </Screen>
  );
}
