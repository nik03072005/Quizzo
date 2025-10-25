import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide the default tab bar completely
        tabBarButton: () => null, // Remove tab bar buttons
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          href: '/',
        }}
      />
    </Tabs>
  );
}
