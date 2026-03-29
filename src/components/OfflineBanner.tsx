import React from 'react';
import { View, Text, Platform } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { Colors } from '../theme';
import { useNetwork } from '../hooks/useNetwork';

interface OfflineBannerProps {
  position?: 'top' | 'bottom';
  offset?: number;
}

export function OfflineBanner({ position = 'top', offset = 0 }: OfflineBannerProps) {
  const { isOffline } = useNetwork();

  if (!isOffline) return null;

  const isBottom = position === 'bottom';

  return (
    <View
      style={{
        backgroundColor: Colors.inverseSurface,
        paddingVertical: 8,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        zIndex: 1000,
        width: '100%',
        ...(isBottom
          ? {
              position: 'absolute',
              bottom: offset,
            }
          : {}),
      }}
    >
      <WifiOff size={14} color={Colors.inverseOnSurface} strokeWidth={2} />
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          color: Colors.inverseOnSurface,
          letterSpacing: 0.1,
        }}
      >
        You're offline. Some features may be unavailable.
      </Text>
    </View>
  );
}
