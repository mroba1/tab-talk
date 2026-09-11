import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, fonts, radii } from '@/theme/theme';

interface OrderUpdateCardProps {
  text: string;
  onView: () => void;
}

export function OrderUpdateCard({ text, onView }: OrderUpdateCardProps) {
  return (
    <Animated.View entering={FadeInDown.duration(360)} style={styles.card}>
      <Text style={styles.text}>{text}</Text>
      <Pressable onPress={onView} style={styles.btn}>
        <Text style={styles.btnText}>View Order</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'flex-start',
    maxWidth: 260,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxxl,
    padding: 16,
    gap: 12,
    shadowColor: '#141028',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 3,
  },
  text: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  btn: { backgroundColor: colors.successBg, borderRadius: radii.pill, paddingVertical: 12, alignItems: 'center' },
  btnText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.success },
});
