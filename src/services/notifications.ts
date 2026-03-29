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

  // Trigger when bookmarks >= 5 (singleton protection)
  sendBookmarkMilestone: async (count: number, userId: string): Promise<void> => {
    if (!isNative || count < 5) return;

    const milestoneKey = `@atelier_u${userId}_milestone_sent`;
    
    try {
      // 1. Persistent Check
      const alreadySent = await AsyncStorage.getItem(milestoneKey);
      if (alreadySent === 'true') return;

      // 2. Local State Check (Prevent race condition within same session)
      if ((global as any)._milestone_firing) return;
      (global as any)._milestone_firing = true;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📚 Curator Achievement!',
          body: `You've bookmarked ${count} courses! You're building an impressive knowledge gallery.`,
          data: { type: 'bookmark_milestone' },
        },
        trigger: null, // Fire immediately
      });

      // 3. Persist Sent Flag
      await AsyncStorage.setItem(milestoneKey, 'true');
    } catch {
      // Fail silently for notifications
    } finally {
      (global as any)._milestone_firing = false;
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
