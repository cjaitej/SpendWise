import { Stack } from "expo-router";

export default function OnBoardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="page2" />
      <Stack.Screen name="page3" />
      <Stack.Screen name="page4" />
    </Stack>
  );
}
