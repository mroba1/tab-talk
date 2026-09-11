import { router } from 'expo-router';
import { MessageCircle, Store } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrderCard } from '@/components/order/OrderCard';
import { getMerchant } from '@/data/merchants';
import { formatMoney, orderTotal } from '@/services/orderService';
import { useAppState } from '@/state/AppState';
import { colors, fonts, radii } from '@/theme/theme';

// Baseline flavor numbers layered under the real, dynamic order data so the
// dashboard feels like an established business from the very first launch —
// chosen so today's sales/pending/completed match the Phase 2 spec's example
// values exactly before any live demo action happens.
const SALES_BASELINE = 119.5;
const PENDING_BASELINE = 3;
const COMPLETED_BASELINE = 11;

export default function MerchantDashboardScreen() {
  const { orders, chats } = useAppState();

  const paidOrders = orders.filter((o) => o.paymentStatus !== 'unpaid');
  const todaysSales = SALES_BASELINE + paidOrders.reduce((sum, o) => sum + orderTotal(o), 0);
  const pendingCount = PENDING_BASELINE + orders.filter((o) => o.status !== 'completed').length;
  const completedCount = COMPLETED_BASELINE + orders.filter((o) => o.status === 'completed').length;
  const activeChats = chats.length;

  const recentOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Store size={14} color="#fff" />
            </View>
            <Text style={styles.brandText}>Merchant Mode</Text>
          </View>
          <Pressable onPress={() => router.replace('/home')}>
            <Text style={styles.exitLink}>Customer Mode</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today's Sales</Text>
            <Text style={styles.statValue}>{formatMoney(todaysSales)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending Orders</Text>
            <Text style={styles.statValue}>{pendingCount}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Chats</Text>
            <Text style={styles.statValue}>{activeChats}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Completed Orders</Text>
            <Text style={styles.statValue}>{completedCount}</Text>
          </View>
        </View>

        <View style={styles.quickRow}>
          <Pressable onPress={() => router.push('/biz/orders')} style={styles.quickBtn}>
            <Store size={15} color={colors.inkHigh} />
            <Text style={styles.quickBtnText}>Orders</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/biz/chats')} style={styles.quickBtn}>
            <MessageCircle size={15} color={colors.inkHigh} />
            <Text style={styles.quickBtnText}>Chats</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {recentOrders.length === 0 ? (
          <Text style={styles.emptyText}>No orders yet.</Text>
        ) : (
          recentOrders.map((order) => {
            const merchant = getMerchant(order.merchantId);
            if (!merchant) return null;
            return <OrderCard key={order.id} order={order} merchant={merchant} viewerRole="merchant" />;
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: colors.inkHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { fontFamily: fonts.bodyBold, fontSize: 11.5, color: colors.textMuted3, textTransform: 'uppercase', letterSpacing: 0.4 },
  exitLink: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.primary },
  title: { marginTop: 6, fontFamily: fonts.heading, fontSize: 22, color: colors.ink },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surfaceMuted2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxxl,
    padding: 16,
  },
  statLabel: { fontFamily: fonts.bodySemibold, fontSize: 11.5, color: colors.textMuted },
  statValue: { marginTop: 6, fontFamily: fonts.heading, fontSize: 22, color: colors.ink },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.xl,
    paddingVertical: 13,
  },
  quickBtnText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  sectionTitle: { marginTop: 26, fontFamily: fonts.heading, fontSize: 16, color: colors.ink },
  emptyText: { marginTop: 10, fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted },
});
