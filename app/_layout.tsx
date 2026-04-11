import { Stack } from 'expo-router';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    async function guncellemekontrol() {
      try {
        if (!Updates.isEmbeddedLaunch) {
          const update = await Updates.checkForUpdateAsync();
          console.log('Güncelleme kontrol edildi:', update.isAvailable);
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        }
      } catch (e) {
        console.log('Güncelleme hatası:', e);
      }
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