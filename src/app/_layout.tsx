import { AuthProvider, useAuth } from "@/context/AuthContext";
import { TransactionProvider } from "@/context/FinanceContext";
import { Redirect, Stack, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import "../global.css";

function RouteGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const inAuthGroup = segments[0] === "(auth)";
  const inOnboardingGroup = segments[0] === "(onboarding)";

  // Redirect instantly during render if conditions aren't met
  if (!user && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user && !user.onboardingCompleted && !inOnboardingGroup) {
    return <Redirect href="/(onboarding)/onboarding" />;
  }

  if (user && user.onboardingCompleted && (inAuthGroup || inOnboardingGroup)) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(onboarding)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <RouteGuard />
      </TransactionProvider>
    </AuthProvider>
  );
}
