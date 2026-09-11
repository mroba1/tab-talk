import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { orderTotal, formatMoney } from '@/services/orderService';
import { homeStatusPill } from '@/services/orderStatus';
import { colors, fonts, radii, shadow } from '@/theme/theme';
import { Merchant, Order } from '@/types';

interface OrderCardProps {
  order: Order;
  merchant: Merchant;
  viewerRole?: 'customer' | 'merchant';
}

export function OrderCard({ order, merchant, viewerRole = 'customer' }: OrderCardProps) {
  const status = homeStatusPill(order);
  const primaryItem = order.items[0];
  const href = viewerRole === 'merchant' ? `/orders/${order.id}?as=merchant` : `/orders/${order.id}`;

  return (
    <Pressable onPress={() => router.push(href)} style={styles.card}>
      <Avatar initials={merchant.initials} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.name} numberOfLines={1}>
          {merchant.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {primaryItem?.name} · {formatMoney(orderTotal(order))}
        </Text>
      </View>
      <Badge label={status.label} bg={status.bg} color={status.color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    backgroundColor: colors.surfaceMuted2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxxl,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...shadow.soft,
  },
  name: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  sub: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
});
