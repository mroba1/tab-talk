import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fonts, radii, shadow } from '@/theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'ghost';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading, style }: ButtonProps) {
  const content = (
    <View style={styles.contentRow}>
      {loading && <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primaryDark} style={{ marginRight: 8 }} />}
      <Text
        style={[
          styles.label,
          variant === 'primary' && { color: colors.white },
          variant === 'secondary' && { color: colors.ink },
          variant === 'success' && { color: colors.success },
          variant === 'ghost' && { color: colors.primary },
        ]}
      >
        {loading ? 'Processing…' : label}
      </Text>
    </View>
  );

  if (variant === 'primary') {
    return (
      <Pressable onPress={onPress} disabled={disabled || loading} style={style}>
        {({ pressed }) => (
          <LinearGradient
            colors={[colors.primaryDark, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.base,
              shadow.button,
              pressed && styles.pressed,
              disabled && styles.disabled,
            ]}
          >
            {content}
          </LinearGradient>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={style}>
      {({ pressed }) => (
        <View
          style={[
            styles.base,
            variant === 'secondary' && { backgroundColor: colors.surfaceMuted },
            variant === 'success' && { backgroundColor: colors.successBg },
            variant === 'ghost' && { backgroundColor: 'transparent' },
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          {content}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
