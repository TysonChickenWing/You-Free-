'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { Body, Caption, Heading, Subheading } from '../../../components/ui';
import { useMyFamilies } from '../../../hooks/useFamilies';
import { useMyGroups } from '../../../hooks/useGroups';

export default function GroupsPage() {
  const familiesQuery = useMyFamilies();
  const groupsQuery = useMyGroups();

  const families = familiesQuery.data ?? [];
  const groups = groupsQuery.data ?? [];
  const familyGroups = groups.filter((g) => g.group.type === 'family_group');
  const golfGroups = groups.filter((g) => g.group.type === 'golf_group');

  return (
    <div className="flex flex-col gap-6">
      <Heading>Your groups</Heading>

      <Section title="Family groups">
        {familyGroups.length === 0 ? (
          <Body muted>You haven&rsquo;t joined a family group yet.</Body>
        ) : (
          familyGroups.map(({ group }) => <GroupRow key={group.id} name={group.name} code={group.invite_code} id={group.id} />)
        )}
      </Section>

      <Section title="Golf groups">
        {golfGroups.length === 0 ? (
          <Body muted>You haven&rsquo;t joined a golf group yet.</Body>
        ) : (
          golfGroups.map(({ group }) => <GroupRow key={group.id} name={group.name} code={group.invite_code} id={group.id} />)
        )}
      </Section>

      <Link
        href="/onboarding/group"
        className="rounded-md bg-primary px-4 py-3 text-center text-[15px] font-semibold text-on-primary hover:opacity-90"
      >
        Create or join a group
      </Link>

      <Section title="Your families">
        {families.length === 0 ? (
          <Body muted>No families yet.</Body>
        ) : (
          families.map(({ family, role }) => (
            <div key={family.id} className="rounded-lg border border-border bg-surface p-4">
              <Subheading>{family.name}</Subheading>
              <Caption>
                Invite code: {family.invite_code} · {role}
              </Caption>
            </div>
          ))
        )}
      </Section>

      <Link
        href="/onboarding/family"
        className="rounded-md border border-border bg-surface px-4 py-3 text-center text-[15px] font-semibold text-text-primary hover:bg-background"
      >
        Create or join a family
      </Link>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Subheading>{title}</Subheading>
      {children}
    </div>
  );
}

function GroupRow({ name, code, id }: { name: string; code: string; id: string }) {
  return (
    <Link
      href={`/group/${id}`}
      className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 transition hover:opacity-90"
    >
      <div>
        <Subheading>{name}</Subheading>
        <Caption>Invite code: {code}</Caption>
      </div>
    </Link>
  );
}
