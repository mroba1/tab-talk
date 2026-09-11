import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/services/orderService';
import { fonts, radii } from '@/theme/theme';

interface BalanceCardProps {
  available: number;
  escrow: number;
  pending: number;
}

export function BalanceCard({ available, escrow, pending }: BalanceCardProps) {
  return (
    <LinearGradient colors={['#241c4a', '#4b3f95', '#7566c7']} style={styles.card}>
      <Text style={styles.label}>Available balance</Text>
      <Text style={styles.amount}>{formatMoney(available)}</Text>
      <View style={styles.divider}>
        <View style={styles.col}>
          <Text style={styles.subLabel}>Escrow balance</Text>
          <Text style={styles.subAmount}>{formatMoney(escrow)}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.subLabel}>Pending</Text>
          <Text style={styles.subAmount}>{formatMoney(pending)}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.huge, padding: 22 },
  label: { fontFamily: fonts.bodySemibold, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  amount: { marginTop: 6, fontFamily: fonts.heading, fontSize: 30, color: '#fff' },
  divider: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: { gap: 3 },
  subLabel: { fontFamily: fonts.body, fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  subAmount: { fontFamily: fonts.bodyBold, fontSize: 15, color: '#fff' },
});
