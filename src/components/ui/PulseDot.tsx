import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

interface PulseDotProps {
  color: string;
  size?: number;
}

export function PulseDot({ color, size = 6 }: PulseDotProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    scale.value = withRepeat(withTiming(2.4, { duration: 1400, easing: Easing.out(Easing.ease) }), -1, false);
    opacity.value = withRepeat(withTiming(0, { duration: 1400, easing: Easing.out(Easing.ease) }), -1, false);
  }, [scale, opacity]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={[styles.ring, ringStyle, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}
      />
      <Animated.View style={[styles.core, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute' },
  core: {},
});
