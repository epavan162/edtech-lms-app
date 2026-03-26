import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { Colors } from '../../theme';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({ title, subtitle, icon, action, style }: EmptyStateProps) {
  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 48,
          paddingVertical: 64,
          gap: 16,
        },
        style,
      ]}
    >
      {icon && (
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: Colors.primaryFixed,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          {icon}
        </View>
      )}
      <Text
        style={{
          fontFamily: 'Manrope_600SemiBold',
          fontSize: 24,
          lineHeight: 32,
          color: Colors.onSurface,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            lineHeight: 20,
            color: Colors.onSurfaceVariant,
            textAlign: 'center',
          }}
        >
          {subtitle}
        </Text>
      )}
      {action && <View style={{ marginTop: 8 }}>{action}</View>}
    </View>
  );
}
