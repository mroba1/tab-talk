import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InvoiceLines } from '@/components/chat/InvoiceLines';
import { OrderTimeline } from '@/components/order/OrderTimeline';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { getMerchant } from '@/data/merchants';
import { customerStatusLine, orderStatusPill } from '@/services/orderStatus';
import { useAppState } from '@/state/AppState';
import { colors, fonts, radii } from '@/theme/theme';

export default function OrderDetailsScreen() {
  const { id, as } = useLocalSearchParams<{ id: string; as?: string }>();
  const isMerchantView = as === 'merchant';
  const {
    getOrder,
    confirmOrderReceived,
    merchantAcceptOrder,
    merchantStartPreparing,
    merchantMarkReady,
  } = useAppState();
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
  const isSecured = order.paymentStatus !== 'unpaid';
  const statusPill = orderStatusPill(order);

  const paymentPill = isSecured
    ? { label: 'Payment secured', bg: colors.successBg, color: colors.success }
    : { label: 'Awaiting payment', bg: colors.warningBg, color: colors.warning };
  const escrowPill = isCompleted
    ? { label: 'Escrow released', bg: colors.surfaceMuted, color: colors.textMuted4 }
    : { label: 'Held in escrow', bg: colors.surfaceMuted, color: colors.textMuted4 };

  const confirmColor = isCompleted ? colors.success : colors.warning;

  const renderFooter = () => {
    if (isCompleted) {
      return (
        <View style={styles.completePill}>
          <Text style={styles.completeText}>Order complete</Text>
        </View>
      );
    }

    if (isMerchantView) {
      if (!isSecured) {
        return (
          <View style={styles.waitingPill}>
            <Text style={styles.waitingText}>Waiting for customer payment</Text>
          </View>
        );
      }
      if (order.status === 'payment_secured') {
        return <Button label="Accept Order" onPress={() => merchantAcceptOrder(order.id)} />;
      }
      if (order.status === 'order_accepted') {
        return <Button label="Start Preparing" onPress={() => merchantStartPreparing(order.id)} />;
      }
      if (order.status === 'in_progress') {
        return <Button label="Mark Ready" onPress={() => merchantMarkReady(order.id)} />;
      }
      if (order.status === 'ready') {
        return (
          <View style={styles.waitingPill}>
            <Text style={styles.waitingText}>Waiting for customer to confirm receipt</Text>
          </View>
        );
      }
      return null;
    }

    if (order.status === 'ready') {
      return <Button label="Confirm Order Received" onPress={() => confirmOrderReceived(order.id)} />;
    }
    if (!isSecured) {
      return <Button label="Review Invoice in Chat" onPress={() => router.push(`/chat/${order.merchantId}`)} />;
    }
    return (
      <View style={styles.waitingPill}>
        <Text style={styles.waitingText}>{customerStatusLine(order, merchant?.name ?? 'the merchant')}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton onPress={() => router.push(isMerchantView ? '/biz/orders' : '/home')}>
          <ChevronLeft size={15} color={colors.inkHigh} />
        </IconButton>
        <Text style={styles.title}>Order Details</Text>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {merchant && (
          <View style={styles.merchantRow}>
            <Avatar initials={merchant.initials} />
            <View>
              <Text style={styles.merchantName}>{isMerchantView ? 'Amara Reyes' : merchant.name}</Text>
              <Text style={styles.merchantSub}>
                {isMerchantView ? merchant.name : `Order #${order.code}`}
              </Text>
            </View>
          </View>
        )}

        <InvoiceLines order={order} style={styles.card} />
        {!!order.note && <Text style={styles.note}>Note: {order.note}</Text>}

        <View style={styles.pillRow}>
          <Badge label={paymentPill.label} bg={paymentPill.bg} color={paymentPill.color} />
          <Badge label={statusPill.label} bg={statusPill.bg} color={statusPill.color} />
          <Badge label={escrowPill.label} bg={escrowPill.bg} color={escrowPill.color} />
        </View>

        <Text style={styles.sectionTitle}>Timeline</Text>
        <View style={styles.timelineWrap}>
          <OrderTimeline order={order} merchantName={merchant?.name} />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Customer confirmation</Text>
          <Text style={[styles.infoValue, { color: confirmColor }]}>{isCompleted ? 'Confirmed' : 'Pending'}</Text>
        </View>
        <View style={[styles.infoRow, { marginTop: 8 }]}>
          <Text style={styles.infoLabel}>Merchant payout</Text>
          <Text style={[styles.infoValue, { color: confirmColor }]}>
            {isCompleted ? 'Paid out' : isSecured ? 'Held in escrow' : '—'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>{renderFooter()}</View>
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
  card: {
    marginTop: 16,
    backgroundColor: colors.surfaceMuted2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxxl,
    padding: 16,
  },
  note: { marginTop: 8, fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, fontStyle: 'italic' },
  pillRow: { marginTop: 16, flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  sectionTitle: { marginTop: 18, fontFamily: fonts.heading, fontSize: 14, color: colors.ink },
  timelineWrap: { marginTop: 12 },
  infoRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textMuted3 },
  infoValue: { fontFamily: fonts.bodyBold, fontSize: 12 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: colors.borderLight },
  completePill: { backgroundColor: colors.successBg, borderRadius: radii.pill, paddingVertical: 16, alignItems: 'center' },
  completeText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.success },
  waitingPill: { backgroundColor: colors.surfaceMuted, borderRadius: radii.pill, paddingVertical: 16, alignItems: 'center', paddingHorizontal: 12 },
  waitingText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textMuted3, textAlign: 'center' },
});
