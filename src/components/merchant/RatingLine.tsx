import { Star } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme/theme';

interface RatingLineProps {
  rating: number;
  reviewCount?: number;
  distanceMi: number;
  categoryLabel: string;
}

export function RatingLine({ rating, reviewCount, distanceMi, categoryLabel }: RatingLineProps) {
  const parts = [
    reviewCount != null ? `${rating.toFixed(1)} (${reviewCount})` : rating.toFixed(1),
    `${distanceMi} mi`,
    categoryLabel,
  ];
  return (
    <View style={styles.row}>
      <Star size={11} color={colors.warning} fill={colors.warning} />
      <Text style={styles.text} numberOfLines={1}>
        {' '}
        {parts.join('  ·  ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
});
