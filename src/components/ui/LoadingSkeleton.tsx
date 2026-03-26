import React, { useEffect, useRef } from 'react';
import { View, Animated, type ViewStyle } from 'react-native';
import { Colors } from '../../theme';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function LoadingSkeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: LoadingSkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: Colors.surfaceContainerHigh,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function CourseCardSkeleton() {
  return (
    <View
      style={{
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: 24,
        overflow: 'hidden',
      }}
    >
      <LoadingSkeleton width="100%" height={180} borderRadius={0} />
      <View style={{ padding: 16, gap: 10 }}>
        <LoadingSkeleton width="30%" height={14} />
        <LoadingSkeleton width="80%" height={18} />
        <LoadingSkeleton width="60%" height={14} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <LoadingSkeleton width={60} height={24} borderRadius={12} />
          <LoadingSkeleton width={24} height={24} borderRadius={12} />
        </View>
      </View>
    </View>
  );
}
