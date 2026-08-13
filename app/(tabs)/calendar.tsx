import { useMemo } from 'react';
import { View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { Body, Caption, EmptyState, Heading, Screen } from '../../src/components/ui';
import { useActiveGroup } from '../../src/hooks/useActiveGroup';
import { useFamilyAvailability, useToggleFamilyFreeDate } from '../../src/hooks/useAvailability';
import { colors, radius, spacing } from '../../src/theme/colors';

const todayIso = new Date().toISOString().slice(0, 10);

export default function CalendarScreen() {
  const { active, memberships, isLoading: groupsLoading } = useActiveGroup('family_group');
  const groupId = active?.group.id;
  const familyId = active?.familyId ?? undefined;

  const availabilityQuery = useFamilyAvailability(groupId, familyId);
  const toggle = useToggleFamilyFreeDate(groupId, familyId);

  const markedDates = useMemo(() => {
    const marks: Record<string, { selected: boolean; selectedColor: string }> = {};
    for (const row of availabilityQuery.data ?? []) {
      marks[row.date] = { selected: true, selectedColor: colors.primary };
    }
    return marks;
  }, [availabilityQuery.data]);

  if (groupsLoading) return null;

  if (!active) {
    return (
      <Screen>
        <EmptyState
          title="No family group yet"
          body="Join or create a family group from the Groups tab to start marking free dates."
        />
      </Screen>
    );
  }

  function handleDayPress(day: DateData) {
    const isFree = !!markedDates[day.dateString];
    toggle.mutate({ date: day.dateString, isFree: !isFree });
  }

  return (
    <Screen style={{ gap: spacing.md }}>
      <View>
        <Heading>Mark your free dates</Heading>
        <Caption>
          {active.group.name}
          {memberships.length > 1 ? ' · tap Groups to switch' : ''}
        </Caption>
      </View>
      <Body muted>Tap a date to mark your family as free — tap again to remove it.</Body>

      <View style={{ borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
        <Calendar
          minDate={todayIso}
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={{
            backgroundColor: colors.surface,
            calendarBackground: colors.surface,
            textSectionTitleColor: colors.textSecondary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: colors.onPrimary,
            todayTextColor: colors.primary,
            dayTextColor: colors.textPrimary,
            monthTextColor: colors.textPrimary,
            arrowColor: colors.primary,
            textDisabledColor: colors.textMuted,
          }}
        />
      </View>
    </Screen>
  );
}
