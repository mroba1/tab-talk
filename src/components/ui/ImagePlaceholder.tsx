import { Image as ImageIcon } from 'lucide-react-native';
import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fonts } from '@/theme/theme';

interface ImagePlaceholderProps {
  label?: string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  uri?: string;
  iconSize?: number;
}

// Mirrors the <image-slot> placeholder pattern from the source design: a soft
// dashed-feel tile with an icon + label, standing in for real product photography.
export function ImagePlaceholder({ label = 'Photo', radius = 16, style, uri, iconSize = 20 }: ImagePlaceholderProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.base, { borderRadius: radius }, style] as StyleProp<ImageStyle>}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[styles.base, styles.placeholder, { borderRadius: radius }, style]}>
      <ImageIcon size={iconSize} color={colors.textDisabled} strokeWidth={1.6} />
      {!!label && (
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  placeholder: {
    backgroundColor: '#ece8f7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textDisabled,
    textAlign: 'center',
  },
});
