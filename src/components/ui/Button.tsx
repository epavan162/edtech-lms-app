import React, { useCallback, useRef } from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  Animated,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 8,
      tension: 300,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 300,
    }).start();
  }, [scale]);

  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <Animated.View
        style={[
          { transform: [{ scale }] },
          fullWidth && { width: '100%' },
          { opacity: isDisabled ? 0.6 : 1 },
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              {
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 9999,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              },
              style,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimary} size="small" />
            ) : (
              <>
                {icon}
                <Text
                  style={[
                    {
                      color: Colors.onPrimary,
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 14,
                      letterSpacing: 0.1,
                    },
                    textStyle,
                  ]}
                >
                  {title}
                </Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  const variantStyles: Record<string, { bg: string; text: string; border?: string }> = {
    secondary: { bg: Colors.surfaceContainerHighest, text: Colors.onSurface },
    outline: { bg: 'transparent', text: Colors.primary, border: Colors.outlineVariant },
    ghost: { bg: 'transparent', text: Colors.primary },
  };

  const vs = variantStyles[variant] ?? variantStyles.secondary;

  return (
    <Animated.View
      style={[
        { transform: [{ scale }] },
        fullWidth && { width: '100%' },
        { opacity: isDisabled ? 0.6 : 1 },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          {
            backgroundColor: vs.bg,
            paddingVertical: 14,
            paddingHorizontal: 24,
            borderRadius: 9999,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderWidth: vs.border ? 1 : 0,
            borderColor: vs.border ?? 'transparent',
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={vs.text} size="small" />
        ) : (
          <>
            {icon}
            <Text
              style={[
                {
                  color: vs.text,
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  letterSpacing: 0.1,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
