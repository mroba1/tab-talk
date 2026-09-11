import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Landmark, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InvoiceLines } from '@/components/chat/InvoiceLines';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { getMerchant } from '@/data/merchants';
import { useAppState } from '@/state/AppState';
import { colors, fonts, radii } from '@/theme/theme';

export default function ConfirmPaymentScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { getOrder, confirmPayment, paymentProcessing } = useAppState();
  const order = orderId ? getOrder(orderId) : undefined;
  const merchant = order ? getMerchant(order.merchantId) : undefined;

  if (!order) {
    return (
      <SafeAreaView style={styles.flex}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>We couldn't find that invoice.</Text>
          <Button label="Go back" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleConfirm = async () => {
    await confirmPayment(order.id);
    router.replace(`/payment/success?orderId=${order.id}`);
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton onPress={() => router.back()}>
          <ChevronLeft size={15} color={colors.inkHigh} />
        </IconButton>
        <Text style={styles.title}>Confirm Payment</Text>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {merchant && (
          <View style={styles.merchantRow}>
            <Avatar initials={merchant.initials} />
            <View>
              <Text style={styles.merchantName}>{merchant.name}</Text>
              <Text style={styles.merchantSub}>
                {order.items[0]?.name}
                {order.note ? ` · ${order.note}` : ''}
              </Text>
            </View>
          </View>
        )}

        <InvoiceLines order={order} style={styles.card} />

        <Text style={styles.label}>Payment method</Text>
        <View style={styles.methodRow}>
          <View style={styles.methodIcon}>
            <Landmark size={16} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.methodName}>Chase Checking ····4821</Text>
            <Text style={styles.methodSub}>Bank transfer</Text>
          </View>
          <Text style={styles.changeText}>Change</Text>
        </View>

        <View style={styles.noticeRow}>
          <ShieldCheck size={20} color={colors.inkHigh} style={{ marginTop: 2 }} />
          <Text style={styles.noticeText}>
            Your payment is held securely until you confirm your order or service is complete.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Confirm & Pay" onPress={handleConfirm} loading={paymentProcessing} />
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
  card: {
    marginTop: 18,
    backgroundColor: colors.surfaceMuted2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxxl,
    padding: 16,
  },
  label: { marginTop: 18, fontFamily: fonts.bodyBold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  methodRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceMuted2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.inkHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodName: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  methodSub: { marginTop: 1, fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  changeText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.primary },
  noticeRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.xxxl,
    padding: 16,
  },
  noticeText: { flex: 1, fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted3, lineHeight: 19 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: colors.borderLight },
});
