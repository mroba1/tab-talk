import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme/theme';

function Dot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 350, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 350, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, [opacity, delay]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, style]} />;
}

export function TypingIndicator() {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.bubble}>
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 4,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textDisabled },
});
