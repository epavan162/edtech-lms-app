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

function RootLayoutNav({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments[0] === '(auth)';
  
  // Determine if we are on the correct route based on auth state
  const isOnCorrectRoute = isInitialized && (
    (isAuthenticated && !inAuthGroup) || 
    (!isAuthenticated && inAuthGroup)
  );

  const isReady = fontsLoaded && isInitialized && isOnCorrectRoute;

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isInitialized, inAuthGroup]);

  useEffect(() => {
    if (isReady) {
      // Small buffer to ensure the targeted screen is painted
      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
      }, 100); 
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  // If not initialized, return null (Splash screen stays up)
  if (!isInitialized) return null;

  // If we are initialized but NOT on the correct route yet, 
  // we return null (or a splash-colored View) to keep the screen clean while redirecting.
  // This is crucial for Web where SplashScreen.preventAutoHideAsync() might not be as reliable.
  if (!isOnCorrectRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: '#3730A3' }} />
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
            <RootLayoutNav fontsLoaded={fontsLoaded} />
          </ToastProvider>
        </StoreProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);
