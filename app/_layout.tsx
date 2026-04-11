import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [hazir, setHazir] = useState(false);

  useEffect(() => {
    async function guncellemekontrol() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
          return;
        }
      } catch (e) {
        console.log('Güncelleme hatası:', e);
      } finally {
        setHazir(true);
        await SplashScreen.hideAsync();
      }
    }
    guncellemekontrol();
  }, []);

  if (!hazir) {
    return (
      <View style={{ flex: 1, backgroundColor: '#212529', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0d6efd" />
      </View>
    );
  }

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