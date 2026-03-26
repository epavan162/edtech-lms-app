import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Colors } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  containerStyle,
  icon,
  rightIcon,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label && (
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 12,
            letterSpacing: 0.36,
            color: error ? Colors.error : Colors.onSurfaceVariant,
            marginLeft: 4,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isFocused
            ? Colors.surfaceContainerLowest
            : Colors.surfaceContainerHigh,
          borderRadius: 16,
          paddingHorizontal: 16,
          borderWidth: isFocused ? 1.5 : 0,
          borderColor: isFocused
            ? error
              ? Colors.error
              : Colors.primary
            : 'transparent',
          minHeight: 52,
        }}
      >
        {icon && <View style={{ marginRight: 12 }}>{icon}</View>}
        <TextInput
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={Colors.outline}
          style={[
            {
              flex: 1,
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: Colors.onSurface,
              paddingVertical: 14,
            },
            props.style,
          ]}
        />
        {rightIcon && <View style={{ marginLeft: 12 }}>{rightIcon}</View>}
      </View>
      {error && (
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            color: Colors.error,
            marginLeft: 4,
            marginTop: 2,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
