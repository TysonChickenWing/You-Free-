import { format, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { router } from 'expo-router';

import { Body, Button, Caption, EmptyState, Heading, Screen, Subheading, TextField } from '../../src/components/ui';
import { useActiveGroup } from '../../src/hooks/useActiveGroup';
import { useAddGolfAvailability, useGolfAvailability } from '../../src/hooks/useAvailability';
import { useGolfSessions, type GolfSessionWithParticipants } from '../../src/hooks/useGolfSessions';
import { useAuth } from '../../src/providers/AuthProvider';
import { colors, radius, spacing } from '../../src/theme/colors';
import type { GolfTimeWindow } from '../../src/types/database';

const TIME_WINDOWS: { value: GolfTimeWindow; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'flexible', label: 'Flexible' },
];

const todayIso = new Date().toISOString().slice(0, 10);

export default function GolfScreen() {
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
    const marks: Record<string, { selected: boolean; selectedColor: string }> = {};
    for (const row of myAvailabilityQuery.data ?? []) {
      marks[row.date] = { selected: true, selectedColor: colors.golf };
    }
    if (selectedDate) marks[selectedDate] = { selected: true, selectedColor: colors.golf };
    return marks;
  }, [myAvailabilityQuery.data, selectedDate]);

  if (groupLoading) return null;

  if (!active) {
    return (
      <Screen>
        <EmptyState
          title="No golf group yet"
          body="Create or join a golf group from the Groups tab to start coordinating tee times."
        />
      </Screen>
    );
  }

  function handleDayPress(day: DateData) {
    setSelectedDate(day.dateString);
  }

  async function handlePostAvailability() {
    if (!selectedDate) return;
    await addAvailability.mutateAsync({ date: selectedDate, timeWindow, coursePreference: course.trim() || undefined });
    setSelectedDate(undefined);
    setCourse('');
  }

  const sessions = sessionsQuery.data ?? [];

  return (
    <Screen style={{ gap: spacing.md }}>
      <View>
        <Heading>Golf</Heading>
        <Caption>{active.group.name}</Caption>
      </View>

      <View style={{ borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
        <Calendar
          minDate={todayIso}
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={{
            backgroundColor: colors.surface,
            calendarBackground: colors.surface,
            textSectionTitleColor: colors.textSecondary,
            selectedDayBackgroundColor: colors.golf,
            selectedDayTextColor: colors.onGolf,
            todayTextColor: colors.golf,
            dayTextColor: colors.textPrimary,
            monthTextColor: colors.textPrimary,
            arrowColor: colors.golf,
            textDisabledColor: colors.textMuted,
          }}
        />
      </View>

      {selectedDate ? (
        <View style={{ gap: spacing.sm }}>
          <Subheading>I’m free {format(parseISO(selectedDate), 'EEEE, MMM d')}</Subheading>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            {TIME_WINDOWS.map((tw) => (
              <Button
                key={tw.value}
                label={tw.label}
                variant={timeWindow === tw.value ? 'golf' : 'secondary'}
                onPress={() => setTimeWindow(tw.value)}
              />
            ))}
          </View>
          <TextField
            label="Course (optional)"
            placeholder="Pebble Beach"
            value={course}
            onChangeText={setCourse}
          />
          <Button label="Post availability" variant="golf" onPress={handlePostAvailability} />
        </View>
      ) : (
        <Body muted>Tap a date on the calendar to post when you’re free to golf.</Body>
      )}

      <Subheading>Upcoming tee times</Subheading>
      {sessions.length === 0 ? (
        <EmptyState title="Nothing yet" body="Once two or more of you are free the same day, it'll show up here." />
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => <GolfSessionCard session={item} />}
        />
      )}
    </Screen>
  );
}

function GolfSessionCard({ session }: { session: GolfSessionWithParticipants }) {
  const names = session.golf_session_participants
    .filter((p) => p.status !== 'out')
    .map((p) => p.profile?.full_name)
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={() => router.push(`/golf-session/${session.id}`)}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
          gap: spacing.xs,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Subheading>{format(parseISO(session.date), 'EEEE, MMM d')}</Subheading>
      <Body muted>{names || 'Just you so far'}</Body>
      {session.course ? <Caption>Course idea: {session.course}</Caption> : null}
    </Pressable>
  );
}
