import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, radii } from '@/theme/theme';

interface BadgeProps {
  label: string;
  bg: string;
  color: string;
  small?: boolean;
}

export function Badge({ label, bg, color, small }: BadgeProps) {
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bg },
        small && { paddingVertical: 3, paddingHorizontal: 8 },
      ]}
    >
      <Text style={[styles.text, { color }, small && { fontSize: 10 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  text: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
});
