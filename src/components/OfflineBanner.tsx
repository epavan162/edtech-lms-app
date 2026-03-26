import React from 'react';
import { View, Text } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { Colors } from '../theme';
import { useNetwork } from '../hooks/useNetwork';

export function OfflineBanner() {
  const { isOffline } = useNetwork();

  if (!isOffline) return null;

  return (
    <View
      style={{
        backgroundColor: Colors.inverseSurface,
        paddingVertical: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <WifiOff size={16} color={Colors.inverseOnSurface} strokeWidth={1.5} />
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 13,
          color: Colors.inverseOnSurface,
          letterSpacing: 0.1,
        }}
      >
        You're offline. Some features may be unavailable.
      </Text>
    </View>
  );
}
