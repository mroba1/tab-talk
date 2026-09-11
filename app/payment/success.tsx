import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { getMerchant } from '@/data/merchants';
import { formatMoney, orderTotal } from '@/services/orderService';
import { useAppState } from '@/state/AppState';
import { colors, fonts, radii } from '@/theme/theme';

export default function PaymentSuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { getOrder } = useAppState();
  const order = orderId ? getOrder(orderId) : undefined;
  const merchant = order ? getMerchant(order.merchantId) : undefined;
  const total = order ? orderTotal(order) : 0;
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(withTiming(1.15, { duration: 320 }), withTiming(1, { duration: 160 }));
  }, [scale]);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (!order) {
    return (
      <SafeAreaView style={styles.flex}>
        <View style={styles.body}>
          <Text style={styles.subtitle}>We couldn't find that payment.</Text>
          <Button label="Back to home" variant="secondary" onPress={() => router.replace('/home')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Animated.View style={popStyle}>
          <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.iconCircle}>
            <Check size={32} color="#fff" strokeWidth={2.6} />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.title}>Payment secured</Text>
        <Text style={styles.subtitle}>{formatMoney(total)} is safely held in escrow until your order is complete.</Text>

        {merchant && (
          <View style={styles.card}>
            <Avatar initials={merchant.initials} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={styles.merchantName}>{merchant.name}</Text>
              <Text style={styles.merchantItem}>{order.items[0]?.name}</Text>
            </View>
            <Text style={styles.amount}>{formatMoney(total)}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button label="Track Order" onPress={() => router.replace(`/escrow/${order.id}`)} />
        <Text
          onPress={() => router.replace(`/chat/${order.merchantId}`)}
          style={styles.backToChat}
          suppressHighlighting
        >
          Back to chat
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconCircle: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 22, fontFamily: fonts.heading, fontSize: 22, color: colors.ink },
  subtitle: { marginTop: 8, fontFamily: fonts.body, fontSize: 14, color: colors.textMuted2, textAlign: 'center', lineHeight: 21 },
  card: {
    marginTop: 26,
    width: '100%',
    backgroundColor: colors.surfaceMuted2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxxl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  merchantName: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  merchantItem: { marginTop: 1, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  amount: { fontFamily: fonts.heading, fontSize: 14, color: colors.ink },
  footer: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 14, gap: 10 },
  backToChat: { textAlign: 'center', fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primary, padding: 6 },
});
