import { Stack } from 'expo-router';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function RootLayout() {
  useEffect(() => {
    async function guncellemekontrol() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {}
    }
    guncellemekontrol();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="AdminPanel" />
      <Stack.Screen name="detay/[id]" />
    </Stack>
  );
}