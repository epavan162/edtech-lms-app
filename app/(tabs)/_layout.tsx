import React from 'react';
import { Tabs } from 'expo-router';
import { Home, BookOpen, User } from 'lucide-react-native';
import { Platform, View } from 'react-native';
import { Colors } from '../../src/theme';
import { OfflineBanner } from '../../src/components/OfflineBanner';

export default function TabsLayout() {
  const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 72;

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.surfaceContainerLowest,
            borderTopWidth: 0,
            height: TAB_BAR_HEIGHT,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            elevation: 0,
            shadowColor: Colors.onSurface,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.04,
            shadowRadius: 16,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.onSurfaceVariant,
          tabBarLabelStyle: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 11,
            letterSpacing: 0.5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="courses"
          options={{
            title: 'My Courses',
            tabBarIcon: ({ color, size }) => (
              <BookOpen size={size} color={color} strokeWidth={1.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <User size={size} color={color} strokeWidth={1.5} />
            ),
          }}
        />
      </Tabs>
      <OfflineBanner position="bottom" offset={TAB_BAR_HEIGHT} />
    </>
  );
}
