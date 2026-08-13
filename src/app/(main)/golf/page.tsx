'use client';

import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Body, Button, Caption, EmptyState, Heading, Subheading, TextField } from '../../../components/ui';
import { MonthCalendar } from '../../../components/MonthCalendar';
import { useActiveGroup } from '../../../hooks/useActiveGroup';
import { useAddGolfAvailability, useGolfAvailability } from '../../../hooks/useAvailability';
import { useGolfSessions, type GolfSessionWithParticipants } from '../../../hooks/useGolfSessions';
import { useAuth } from '../../../providers/AuthProvider';
import type { GolfTimeWindow } from '../../../types/database';

const TIME_WINDOWS: { value: GolfTimeWindow; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'flexible', label: 'Flexible' },
];

export default function GolfPage() {
  const { active, isLoading: groupLoading } = useActiveGroup('golf_group');
  const { session } = useAuth();
  const groupId = active?.group.id;

  const myAvailabilityQuery = useGolfAvailability(groupId, session?.user.id);
  const addAvailability = useAddGolfAvailability(groupId);
  const sessionsQuery = useGolfSessions(groupId);

  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [timeWindow, setTimeWindow] = useState<GolfTimeWindow>('flexible');
  const [course, setCourse] = useState('');

  const markedDates = useMemo(() => {
    const marks = new Set((myAvailabilityQuery.data ?? []).map((row) => row.date));
    if (selectedDate) marks.add(selectedDate);
    return marks;
  }, [myAvailabilityQuery.data, selectedDate]);

  if (groupLoading) return null;

  if (!active) {
    return (
      <EmptyState
        title="No golf group yet"
        body="Create or join a golf group from the Groups tab to start coordinating tee times."
      />
    );
  }

  async function handlePostAvailability() {
    if (!selectedDate) return;
    await addAvailability.mutateAsync({ date: selectedDate, timeWindow, coursePreference: course.trim() || undefined });
    setSelectedDate(undefined);
    setCourse('');
  }

  const sessions = sessionsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Heading>Golf</Heading>
        <Caption>{active.group.name}</Caption>
      </div>

      <MonthCalendar
        selectedDates={markedDates}
        onSelectDate={(date) => setSelectedDate(date)}
        accent="golf"
      />

      {selectedDate ? (
        <div className="flex flex-col gap-3">
          <Subheading>I&rsquo;m free {format(parseISO(selectedDate), 'EEEE, MMM d')}</Subheading>
          <div className="flex flex-wrap gap-2">
            {TIME_WINDOWS.map((tw) => (
              <Button
                key={tw.value}
                label={tw.label}
                variant={timeWindow === tw.value ? 'golf' : 'secondary'}
                onClick={() => setTimeWindow(tw.value)}
              />
            ))}
          </div>
          <TextField label="Course (optional)" placeholder="Pebble Beach" value={course} onChange={(e) => setCourse(e.target.value)} />
          <Button label="Post availability" variant="golf" onClick={handlePostAvailability} />
        </div>
      ) : (
        <Body muted>Tap a date on the calendar to post when you&rsquo;re free to golf.</Body>
      )}

      <Subheading>Upcoming tee times</Subheading>
      {sessions.length === 0 ? (
        <EmptyState title="Nothing yet" body="Once two or more of you are free the same day, it'll show up here." />
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((s) => (
            <GolfSessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function GolfSessionCard({ session }: { session: GolfSessionWithParticipants }) {
  const names = session.golf_session_participants
    .filter((p) => p.status !== 'out')
    .map((p) => p.profile?.full_name)
    .filter(Boolean)
    .join(', ');

  return (
    <Link
      href={`/golf-session/${session.id}`}
      className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 transition hover:opacity-90"
    >
      <Subheading>{format(parseISO(session.date), 'EEEE, MMM d')}</Subheading>
      <Body muted>{names || 'Just you so far'}</Body>
      {session.course ? <Caption>Course idea: {session.course}</Caption> : null}
    </Link>
  );
}
