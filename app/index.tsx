import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuth } from '../src/providers/AuthProvider';
import { useMyFamilies } from '../src/hooks/useFamilies';
import { useMyGroups } from '../src/hooks/useGroups';
import { colors } from '../src/theme/colors';

// Root gate: decides whether to send the user into auth, onboarding, or the
// main app based on session + family/group membership.
export default function Index() {
  const { session, loading: authLoading } = useAuth();
  const familiesQuery = useMyFamilies();
  const groupsQuery = useMyGroups();

  if (authLoading) return <Loading />;
  if (!session) return <Redirect href="/(auth)/sign-in" />;

  if (familiesQuery.isLoading || groupsQuery.isLoading) return <Loading />;

  const hasFamily = (familiesQuery.data?.length ?? 0) > 0;
  if (!hasFamily) return <Redirect href="/(onboarding)/create-or-join-family" />;

  const hasGroup = (groupsQuery.data?.length ?? 0) > 0;
  if (!hasGroup) return <Redirect href="/(onboarding)/create-or-join-group" />;

  return <Redirect href="/(tabs)" />;
}

function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}
