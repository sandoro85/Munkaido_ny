import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function OrganizationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        animation: Platform.OS === 'ios' ? 'slide_from_bottom' : 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
    </Stack>
  );
}