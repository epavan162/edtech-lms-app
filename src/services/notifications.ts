import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_OPEN_KEY = '@atelier_last_open';
const isNative = Platform.OS !== 'web';

// Configure notification handler (native only)
if (isNative) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export const notificationService = {
  requestPermissions: async (): Promise<boolean> => {
    if (!isNative) return false;

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    return true;
  },

  // Trigger when bookmarks >= 5
  sendBookmarkMilestone: async (count: number) => {
    if (!isNative) return;
    if (count === 5) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📚 Curator Achievement!',
          body: `You've bookmarked ${count} courses! You're building an impressive knowledge gallery.`,
          data: { type: 'bookmark_milestone' },
        },
        trigger: null, // Fire immediately
      });
    }
  },

  // Schedule 24h inactivity reminder
  scheduleInactivityReminder: async () => {
    if (!isNative) return;

    // Cancel previous
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎓 Your Atelier Awaits',
        body: "It's been a while! Your courses are waiting for you. Continue your learning journey.",
        data: { type: 'inactivity_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 86400, // 24 hours
      },
    });
  },

  // Track app opens for inactivity
  recordAppOpen: async () => {
    await AsyncStorage.setItem(LAST_OPEN_KEY, new Date().toISOString());
  },
};
