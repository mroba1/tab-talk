import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { TransactionItem } from '@/components/wallet/TransactionItem';
import { getMerchant } from '@/data/merchants';
import { formatMoney, orderTotal } from '@/services/orderService';
import { formatRelative } from '@/services/time';
import { useAppState } from '@/state/AppState';
import { colors, fonts, radii } from '@/theme/theme';

export default function WalletScreen() {
  const { orders, availableBalance, escrowBalance, transactions } = useAppState();
  const pendingOrders = orders.filter((o) => o.escrowStatus === 'held');

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
      </View>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <BalanceCard available={availableBalance} escrow={escrowBalance} pending={0} />

        <Text style={styles.sectionTitle}>Pending payments</Text>
        {pendingOrders.length > 0 ? (
          pendingOrders.map((order) => {
            const merchant = getMerchant(order.merchantId);
            if (!merchant) return null;
            return (
              <Pressable key={order.id} onPress={() => router.push(`/orders/${order.id}`)} style={styles.pendingRow}>
                <Avatar initials={merchant.initials} size={38} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pendingName}>{merchant.name}</Text>
                  <Text style={styles.pendingSub}>Held in escrow</Text>
                </View>
                <Text style={styles.pendingAmount}>{formatMoney(orderTotal(order))}</Text>
              </Pressable>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No pending payments right now.</Text>
        )}

        <Text style={styles.sectionTitle}>Recent transactions</Text>
        <View style={styles.txnList}>
          {orders.map((order, i) => {
            const merchant = getMerchant(order.merchantId);
            if (!merchant) return null;
            const isPending = order.paymentStatus === 'unpaid';
            const total = orderTotal(order);
            const itemName = order.items[0]?.name ?? 'Order';
            const dateLabel = formatRelative(order.securedAt ?? order.createdAt);
            return (
              <TransactionItem
                key={order.id}
                label={isPending ? 'Invoice sent' : merchant.name}
                sub={isPending ? `${itemName} · Today` : `${itemName} · ${dateLabel}`}
                amountLabel={isPending ? 'Pending' : `-${formatMoney(total)}`}
                direction={isPending ? 'pending' : 'debit'}
                bordered={i < orders.length - 1 || transactions.length > 0}
              />
            );
          })}
          {transactions.map((t, i) => (
            <TransactionItem
              key={t.id}
              label={t.label}
              sub={t.sub}
              amountLabel={`${t.direction === 'credit' ? '+' : '-'}${formatMoney(t.amount)}`}
              direction={t.direction}
              bordered={i < transactions.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontFamily: fonts.heading, fontSize: 20, color: colors.ink },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  sectionTitle: { marginTop: 20, fontFamily: fonts.heading, fontSize: 15, color: colors.ink },
  pendingRow: {
    marginTop: 10,
    backgroundColor: colors.surfaceMuted2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxxl,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pendingName: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  pendingSub: { marginTop: 1, fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  pendingAmount: { fontFamily: fonts.heading, fontSize: 14, color: colors.ink },
  emptyText: { marginTop: 10, fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted },
  txnList: { marginTop: 10 },
});
