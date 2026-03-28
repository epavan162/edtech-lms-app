import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Alert } from 'react-native';
import * as Device from 'expo-device';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StoreProvider } from '../src/store/StoreProvider';
import { useAuth } from '../src/store/auth';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { ToastProvider } from '../src/components/ui/Toast';
import { notificationService } from '../src/services/notifications';
import { Colors } from '../src/theme';
import * as Sentry from '@sentry/react-native';
import { initializeSentry } from '../src/services/sentry';
import { analytics } from '../src/services/analytics';

// Initialize Sentry before the app mounts
initializeSentry();
analytics.init();

import '../global.css';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Use setTimeout to ensure router is mounted (web compatibility)
    const timer = setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isInitialized, segments]);

  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.surface,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <Slot />;
}

function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Request notification permissions and schedule inactivity reminder
    notificationService.requestPermissions();
    notificationService.scheduleInactivityReminder();
    notificationService.recordAppOpen();

    // Jailbreak/Root Detection
    const checkSecurity = async () => {
      try {
        const isRooted = await Device.isRootedExperimentalAsync();
        if (isRooted) {
          Alert.alert(
            'Security Warning',
            'This device appears to be rooted or jailbroken. For your security, please be cautious.',
            [{ text: 'I understand' }]
          );
        }
      } catch (error) {
        // Silently ignore if unsupported on platform
      }
    };
    checkSecurity();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StoreProvider>
          <ToastProvider>
            <StatusBar style="dark" />
            <RootLayoutNav />
          </ToastProvider>
        </StoreProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);
