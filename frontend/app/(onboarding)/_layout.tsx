import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="intro1" />
      <Stack.Screen name="intro2" />
      <Stack.Screen name="intro3" />
    </Stack>
  );
}