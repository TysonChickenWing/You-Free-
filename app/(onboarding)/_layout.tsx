import { Stack } from 'expo-router';

import { colors } from '../../src/theme/colors';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="create-or-join-family" options={{ title: 'Your Family' }} />
      <Stack.Screen name="create-or-join-group" options={{ title: 'Your Group' }} />
    </Stack>
  );
}
