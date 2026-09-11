import { ArrowDown, ArrowUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme/theme';

interface TransactionItemProps {
  label: string;
  sub: string;
  amountLabel: string;
  direction: 'debit' | 'credit' | 'pending';
  bordered?: boolean;
}

export function TransactionItem({ label, sub, amountLabel, direction, bordered }: TransactionItemProps) {
  const amountColor = direction === 'credit' ? colors.success : direction === 'pending' ? colors.textMuted : colors.danger;
  const Icon = direction === 'credit' ? ArrowDown : ArrowUp;
  const iconColor = direction === 'credit' ? colors.success : colors.danger;

  return (
    <View style={[styles.row, bordered && styles.bordered]}>
      <View style={styles.iconWrap}>
        <Icon size={14} color={direction === 'pending' ? colors.textMuted : iconColor} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {sub}
        </Text>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>{amountLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  bordered: { borderBottomWidth: 1, borderBottomColor: colors.borderLighter },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  sub: { marginTop: 1, fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  amount: { fontFamily: fonts.bodyBold, fontSize: 13 },
});
