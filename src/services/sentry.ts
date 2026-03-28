import * as Sentry from '@sentry/react-native';

/**
 * Initializes Sentry for error tracking.
 * Securely gracefully falls back if DSN is not provided in env.
 */
export const initializeSentry = () => {
  // We use a dummy DSN for the assignment so it doesn't crash if secrets aren't set.
  // In production, this would be process.env.EXPO_PUBLIC_SENTRY_DSN
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || (__DEV__ ? '' : 'https://dummy@o0.ingest.sentry.io/0'),
    debug: __DEV__,
    tracesSampleRate: 1.0,
  });
};

/**
 * Convenience wrapper to log expected errors manually
 */
export const logError = (error: Error | string, context?: Record<string, any>) => {
  if (typeof error === 'string') {
    Sentry.captureMessage(error, { extra: context });
  } else {
    Sentry.captureException(error, { extra: context });
  }
};
