'use client';

import { format, parseISO } from 'date-fns';
import Link from 'next/link';

import { Body, Caption, EmptyState, Heading, Subheading } from '../../../components/ui';
import { useActiveGroup } from '../../../hooks/useActiveGroup';
import { useMatches, type MatchWithParticipants } from '../../../hooks/useMatches';

export default function FreeDaysPage() {
  const { active, isLoading: groupLoading } = useActiveGroup('family_group');
  const matchesQuery = useMatches(active?.group.id);

  if (groupLoading) return null;

  if (!active) {
    return (
      <EmptyState
        title="No family group yet"
        body="Join or create a family group from the Groups tab, then mark your free dates to start matching."
      />
    );
  }

  const matches = matchesQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Heading>You&rsquo;re both free!</Heading>
        <Caption>{active.group.name}</Caption>
      </div>

      {matches.length === 0 ? (
        <EmptyState
          title="No matches yet"
          body="Mark some free dates on the Calendar tab — we'll show you here as soon as another family in the group is free the same day."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} myFamilyId={active.familyId ?? undefined} />
          ))}
        </div>
      )}
    </div>
  );
}

function MatchCard({ match, myFamilyId }: { match: MatchWithParticipants; myFamilyId?: string }) {
  const otherFamilies = match.match_participants.filter((p) => p.family_id !== myFamilyId);
  const mine = match.match_participants.find((p) => p.family_id === myFamilyId);
  const names = otherFamilies
    .map((p) => p.family?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <Link
      href={`/match/${match.id}`}
      className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 transition hover:opacity-90"
    >
      <Subheading>{format(parseISO(match.date), 'EEEE, MMM d')}</Subheading>
      <Body muted>You&rsquo;re both free with {names || 'another family'}</Body>
      {mine ? <Caption>Your status: {responseLabel(mine.response)}</Caption> : null}
    </Link>
  );
}

function responseLabel(response: string) {
  switch (response) {
    case 'host':
      return 'You’re hosting';
    case 'suggest_activity':
      return 'Looking for an activity';
    case 'declined':
      return 'Declined';
    default:
      return 'Waiting on your response';
  }
}
