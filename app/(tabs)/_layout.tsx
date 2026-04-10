import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        // İŞTE YENİ TASARIM AYARLARI
        tabBarStyle: { 
          backgroundColor: '#212529', // Üst başlıkla aynı antrasit renk
          borderTopWidth: 0,          // Menünün üstündeki ince çizgiyi siler (daha şık durur)
        },
        tabBarActiveTintColor: '#ffffff',   // Seçiliyken yazının rengi (Parlak Beyaz)
        tabBarInactiveTintColor: '#6c757d'  // Seçili değilken yazının rengi (Koyu Gri)
      }}
    >
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Şantiyeler',
          tabBarIcon: ({ color }) => <Text style={{color, fontSize: 20}}>🚧</Text>,
        }}
      />
      
      <Tabs.Screen name="ustalar" options={{ href: null }} />
      <Tabs.Screen name="finans" options={{ href: null }} />
    </Tabs>
  );
}