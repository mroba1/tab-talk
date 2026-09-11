import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { formatMoney } from '@/services/orderService';
import { colors, fonts, radii } from '@/theme/theme';
import { Product } from '@/types';

interface MenuCardProps {
  products: Product[];
  onSelect: (product: Product) => void;
  disabled?: boolean;
}

export function MenuCard({ products, onSelect, disabled }: MenuCardProps) {
  return (
    <Animated.View entering={FadeInDown.duration(360)} style={styles.card}>
      <Text style={styles.title}>MENU</Text>
      <View style={styles.list}>
        {products.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => !disabled && onSelect(p)}
            style={({ pressed }) => [styles.row, pressed && !disabled && styles.rowPressed]}
          >
            <Text style={styles.rowLabel} numberOfLines={1}>
              {p.name}
            </Text>
            <Text style={styles.rowPrice}>
              {p.priceFrom ? 'From ' : ''}
              {formatMoney(p.price)}
            </Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'flex-start',
    width: 250,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxxl,
    overflow: 'hidden',
    shadowColor: '#141028',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 3,
  },
  title: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.ink,
    letterSpacing: 0.3,
  },
  list: { paddingHorizontal: 8, paddingBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: radii.lg,
    paddingVertical: 11,
    paddingHorizontal: 8,
  },
  rowPressed: { backgroundColor: colors.surfaceMuted },
  rowLabel: { flex: 1, fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.ink, marginRight: 8 },
  rowPrice: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primary },
});
