import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { InvoiceLines } from '@/components/chat/InvoiceLines';
import { colors, fonts, radii } from '@/theme/theme';
import { Order } from '@/types';

interface InvoiceCardProps {
  order: Order;
  onPay: () => void;
  onTrack: () => void;
  viewerRole?: 'customer' | 'merchant';
}

export function InvoiceCard({ order, onPay, onTrack, viewerRole = 'customer' }: InvoiceCardProps) {
  const isPending = order.paymentStatus === 'unpaid';
  const isCompleted = order.status === 'completed';
  const isMerchant = viewerRole === 'merchant';

  return (
    <Animated.View entering={FadeInDown.duration(380)} style={styles.card}>
      <Text style={styles.title}>INVOICE</Text>
      <InvoiceLines order={order} style={styles.lines} />

      <View style={styles.ctaWrap}>
        {isMerchant ? (
          <Pressable onPress={onTrack} style={isPending ? styles.pendingBtn : styles.securedBtn}>
            <Text style={isPending ? styles.pendingBtnText : styles.securedBtnText}>
              {isPending ? 'Awaiting payment · View order' : isCompleted ? 'Order complete · View order' : 'View order status'}
            </Text>
          </Pressable>
        ) : (
          <>
            {isPending && (
              <Pressable onPress={onPay}>
                {({ pressed }) => (
                  <LinearGradient
                    colors={[colors.primaryDark, colors.primary]}
                    style={[styles.payBtn, pressed && styles.pressed]}
                  >
                    <Text style={styles.payBtnText}>Pay via Bank</Text>
                  </LinearGradient>
                )}
              </Pressable>
            )}
            {!isPending && !isCompleted && (
              <Pressable onPress={onTrack} style={styles.securedBtn}>
                <Text style={styles.securedBtnText}>Payment secured · Track order</Text>
              </Pressable>
            )}
            {isCompleted && (
              <Pressable onPress={onTrack} style={styles.securedBtn}>
                <Text style={styles.securedBtnText}>Order complete · View receipt</Text>
              </Pressable>
            )}
          </>
        )}
        <View style={styles.protectedRow}>
          <ShieldCheck size={12} color={colors.textDisabled} />
          <Text style={styles.protectedText}>Protected by TabTalk Escrow</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'flex-start',
    width: 270,
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
    paddingBottom: 10,
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.ink,
    letterSpacing: 0.3,
  },
  lines: { paddingHorizontal: 16 },
  ctaWrap: { padding: 16, paddingTop: 8 },
  payBtn: {
    borderRadius: radii.pill,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pressed: { transform: [{ scale: 0.96 }] },
  payBtnText: { fontFamily: fonts.bodyBold, fontSize: 13, color: '#fff' },
  securedBtn: { backgroundColor: colors.successBg, borderRadius: radii.pill, paddingVertical: 12, alignItems: 'center' },
  securedBtnText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.success },
  pendingBtn: { backgroundColor: colors.warningBg, borderRadius: radii.pill, paddingVertical: 12, alignItems: 'center' },
  pendingBtnText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.warning },
  protectedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 10 },
  protectedText: { fontFamily: fonts.bodySemibold, fontSize: 10.5, color: colors.textDisabled },
});
