import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Colors } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'flat';
}

export function Card({ children, style, variant = 'flat' }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: Colors.surfaceContainerLowest,
          borderRadius: 24,
          overflow: 'hidden',
        },
        variant === 'elevated' && {
          shadowColor: Colors.onSurface,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.06,
          shadowRadius: 32,
          elevation: 4,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
