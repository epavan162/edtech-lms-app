import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { Colors } from '../../theme';

interface ChipProps {
  label: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'primary';
}

export function Chip({ label, icon, style, variant = 'default' }: ChipProps) {
  const bg = variant === 'primary' ? Colors.primaryFixed : Colors.secondaryContainer;
  const textColor =
    variant === 'primary' ? Colors.onPrimaryFixedVariant : Colors.onSecondaryContainer;

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: bg,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 9999,
          gap: 6,
        },
        style,
      ]}
    >
      {icon}
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 12,
          letterSpacing: 0.36,
          color: textColor,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
