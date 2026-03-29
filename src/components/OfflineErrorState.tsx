import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff, RefreshCcw } from 'lucide-react-native';
import { Button } from './ui/Button';
import { Colors } from '../theme';

interface OfflineErrorStateProps {
  onRetry: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
}

/**
 * A professional, branded offline error state for screen-level failures.
 * Following the "Digital Curator" design language: spacious, editorial, and minimalist.
 */
export function OfflineErrorState({
  onRetry,
  title = "You're Offline",
  message = "Please check your internet connection and try again to view this course.",
  loading = false,
}: OfflineErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <WifiOff size={48} color={Colors.primary} strokeWidth={1.2} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <Text style={styles.message}>
        {message}
      </Text>
      
      <View style={styles.actionContainer}>
        <Button
          title="Try Again"
          onPress={onRetry}
          loading={loading}
          icon={<RefreshCcw size={16} color={Colors.onPrimary} strokeWidth={2} />}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: Colors.surface,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 24,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 200,
  },
  button: {
    borderRadius: 16,
  },
});
