import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { formatMoney } from '@/services/orderService';
import { colors, fonts } from '@/theme/theme';
import { Order } from '@/types';

type InvoicePreviewOrder = Pick<Order, 'items' | 'delivery'>;

export function InvoiceLines({ order, style }: { order: InvoicePreviewOrder; style?: ViewStyle }) {
  const total = order.items.reduce((sum, i) => sum + i.price * i.qty, 0) + order.delivery;

  return (
    <View style={style}>
      {order.items.map((item, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.label}>
            {item.qty} × {item.name}
          </Text>
          <Text style={styles.value}>{formatMoney(item.price * item.qty)}</Text>
        </View>
      ))}
      <View style={styles.row}>
        <Text style={styles.labelMuted}>Delivery</Text>
        <Text style={styles.valueMuted}>{formatMoney(order.delivery)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatMoney(total)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  label: { fontFamily: fonts.body, fontSize: 13, color: colors.ink },
  value: { fontFamily: fonts.body, fontSize: 13, color: colors.ink },
  labelMuted: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  valueMuted: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: 6,
    paddingTop: 8,
  },
  totalLabel: { fontFamily: fonts.heading, fontSize: 15, color: colors.ink },
  totalValue: { fontFamily: fonts.heading, fontSize: 15, color: colors.ink },
});
