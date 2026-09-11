import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { OrderTimeline } from '@/components/order/OrderTimeline';
import { getMerchant } from '@/data/merchants';
import { formatMoney, orderTotal } from '@/services/orderService';
import { customerStatusLine } from '@/services/orderStatus';
import { useAppState } from '@/state/AppState';
import { colors, fonts, radii } from '@/theme/theme';

export default function EscrowTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getOrder, confirmOrderReceived } = useAppState();
  const order = id ? getOrder(id) : undefined;

  if (!order) {
    return (
      <SafeAreaView style={styles.flex}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>We couldn't find that order.</Text>
          <Button label="Go back" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const merchant = getMerchant(order.merchantId);
  const isCompleted = order.status === 'completed';
  const canConfirm = order.status === 'ready';
  const isUnpaid = order.paymentStatus === 'unpaid';

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton onPress={() => router.push(`/chat/${order.merchantId}`)}>
          <ChevronLeft size={15} color={colors.inkHigh} />
        </IconButton>
        <Text style={styles.title}>Escrow Tracking</Text>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {merchant && (
          <View style={styles.merchantRow}>
            <Avatar initials={merchant.initials} />
            <View>
              <Text style={styles.merchantName}>{merchant.name}</Text>
              <Text style={styles.merchantSub}>
                {order.items[0]?.name} · {formatMoney(orderTotal(order))}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.timelineWrap}>
          <OrderTimeline order={order} merchantName={merchant?.name} />
        </View>

        {!isCompleted && !canConfirm && !isUnpaid && (
          <Text style={styles.statusNote}>{customerStatusLine(order, merchant?.name ?? 'the merchant')}</Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {isCompleted ? (
          <View style={styles.releasedPill}>
            <Text style={styles.releasedText}>Escrow released ✓</Text>
          </View>
        ) : canConfirm ? (
          <Button label="Confirm Order Received" onPress={() => confirmOrderReceived(order.id)} />
        ) : isUnpaid ? (
          <Button label="Review Invoice in Chat" onPress={() => router.push(`/chat/${order.merchantId}`)} />
        ) : (
          <View style={styles.waitingPill}>
            <Text style={styles.waitingText}>{customerStatusLine(order, merchant?.name ?? 'the merchant')}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  notFoundText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontFamily: fonts.heading, fontSize: 17, color: colors.ink },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  merchantRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  merchantName: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  merchantSub: { marginTop: 1, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  timelineWrap: { marginTop: 24 },
  statusNote: { marginTop: 4, fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, textAlign: 'center' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: colors.borderLight },
  releasedPill: { backgroundColor: colors.successBg, borderRadius: radii.pill, paddingVertical: 16, alignItems: 'center' },
  releasedText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.success },
  waitingPill: { backgroundColor: colors.surfaceMuted, borderRadius: radii.pill, paddingVertical: 16, alignItems: 'center', paddingHorizontal: 12 },
  waitingText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textMuted3, textAlign: 'center' },
});
