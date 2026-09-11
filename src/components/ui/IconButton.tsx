import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radii } from '@/theme/theme';

interface IconButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  size?: number;
  bg?: string;
  style?: ViewStyle;
}

export function IconButton({ children, onPress, size = 38, bg = colors.surfaceMuted, style }: IconButtonProps) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      {({ pressed }) => (
        <View
          style={[
            styles.base,
            { width: size, height: size, backgroundColor: bg },
            pressed && styles.pressed,
            style,
          ]}
        >
          {children}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
