import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '@/theme/theme';

interface AvatarProps {
  initials: string;
  size?: number;
  variant?: 'gradient' | 'light';
}

export function Avatar({ initials, size = 44, variant = 'gradient' }: AvatarProps) {
  const radius = Math.round(size * 0.32);
  const fontSize = Math.round(size * 0.32);

  if (variant === 'light') {
    return (
      <View
        style={[
          styles.base,
          { width: size, height: size, borderRadius: radius, backgroundColor: '#e7e3f2' },
        ]}
      >
        <Text style={[styles.text, { fontSize, color: colors.primary }]}>{initials}</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.base, { width: size, height: size, borderRadius: radius }]}
    >
      <Text style={[styles.text, { fontSize, color: colors.white }]}>{initials}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.headingBold,
  },
});
