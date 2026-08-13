'use client';

import { useMemo } from 'react';

import { Body, Caption, EmptyState, Heading } from '../../../components/ui';
import { MonthCalendar } from '../../../components/MonthCalendar';
import { useActiveGroup } from '../../../hooks/useActiveGroup';
import { useFamilyAvailability, useToggleFamilyFreeDate } from '../../../hooks/useAvailability';

export default function CalendarPage() {
  const { active, memberships, isLoading: groupsLoading } = useActiveGroup('family_group');
  const groupId = active?.group.id;
  const familyId = active?.familyId ?? undefined;

  const availabilityQuery = useFamilyAvailability(groupId, familyId);
  const toggle = useToggleFamilyFreeDate(groupId, familyId);

  const selectedDates = useMemo(
    () => new Set((availabilityQuery.data ?? []).map((row) => row.date)),
    [availabilityQuery.data]
  );

  if (groupsLoading) return null;

  if (!active) {
    return (
      <EmptyState
        title="No family group yet"
        body="Join or create a family group from the Groups tab to start marking free dates."
      />
    );
  }

  function handleSelectDate(date: string) {
    const isFree = selectedDates.has(date);
    toggle.mutate({ date, isFree: !isFree });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Heading>Mark your free dates</Heading>
        <Caption>
          {active.group.name}
          {memberships.length > 1 ? ' · switch groups from the Groups tab' : ''}
        </Caption>
      </div>
      <Body muted>Tap a date to mark your family as free — tap again to remove it.</Body>

      <MonthCalendar selectedDates={selectedDates} onSelectDate={handleSelectDate} accent="primary" />
    </div>
  );
}
