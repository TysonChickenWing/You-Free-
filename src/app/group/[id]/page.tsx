'use client';

import Link from 'next/link';
import { use } from 'react';

import { Body, Caption, EmptyState, Heading, Subheading } from '../../../components/ui';
import { useGroupMembers } from '../../../hooks/useGroupMembers';
import { useMyGroups } from '../../../hooks/useGroups';

export default function GroupDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const groupsQuery = useMyGroups();
  const membersQuery = useGroupMembers(id);

  const membership = groupsQuery.data?.find((g) => g.group.id === id);
  const members = membersQuery.data ?? [];

  if (!membership) return null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-4 px-5 py-6">
      <Link href="/groups" className="text-sm text-text-secondary">
        ← Back
      </Link>

      <div>
        <Heading>{membership.group.name}</Heading>
        <Caption>
          Invite code: {membership.group.invite_code} ·{' '}
          {membership.group.type === 'golf_group' ? 'Golf group' : 'Family group'}
        </Caption>
        <Body muted>Share the invite code so others can join.</Body>
      </div>

      <Subheading>Members</Subheading>
      {members.length === 0 ? (
        <EmptyState title="No members yet" body="Share the invite code to get this group started." />
      ) : (
        <div className="flex flex-col gap-3">
          {members.map((member) => (
            <div key={member.id}>
              <Body>{member.profile?.full_name || 'Someone'}</Body>
              {member.family ? <Caption>{member.family.name}</Caption> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
