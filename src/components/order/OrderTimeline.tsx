import { Check } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme/theme';
import { Order, OrderStatus } from '@/types';

interface StepConfig {
  title: string;
  subtitle: string;
  done: boolean;
}

function timeLabel(ts?: number) {
  if (!ts) return '';
  return `Today, ${new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

const RANK: Record<OrderStatus, number> = {
  awaiting_payment: 0,
  payment_secured: 1,
  order_accepted: 2,
  in_progress: 3,
  ready: 4,
  completed: 5,
};

export function OrderTimeline({ order, merchantName = 'the merchant' }: { order: Order; merchantName?: string }) {
  const rank = RANK[order.status];

  const steps: StepConfig[] = [
    { title: 'Payment initiated', subtitle: timeLabel(order.createdAt), done: rank >= 0 && order.paymentStatus !== 'unpaid' },
    { title: 'Payment secured', subtitle: timeLabel(order.securedAt), done: rank >= 1 },
    { title: 'Order accepted', subtitle: `${merchantName} accepted your order`, done: rank >= 2 },
    { title: 'Preparing', subtitle: `${merchantName} is working on your order`, done: rank >= 3 },
    { title: 'Ready', subtitle: timeLabel(order.readyAt) || 'Ready to confirm', done: rank >= 4 },
    { title: 'Completed', subtitle: 'Funds released to the merchant', done: rank >= 5 },
  ];

  return (
    <View>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const nextDone = steps[i + 1]?.done;
        return (
          <View key={step.title} style={styles.row}>
            <View style={styles.railCol}>
              <View style={[styles.dot, { backgroundColor: step.done ? colors.inkHigh : '#e5e1f0' }]}>
                {step.done && <Check size={12} color="#fff" strokeWidth={3} />}
              </View>
              {!isLast && (
                <View style={[styles.line, { backgroundColor: nextDone || step.done ? colors.inkHigh : '#e5e1f0' }]} />
              )}
            </View>
            <View style={[styles.textCol, isLast && { paddingBottom: 0 }]}>
              <Text style={styles.title}>{step.title}</Text>
              {!!step.subtitle && <Text style={styles.subtitle}>{step.subtitle}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14 },
  railCol: { alignItems: 'center' },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, flex: 1, marginVertical: 2, minHeight: 22 },
  textCol: { paddingBottom: 22, flex: 1 },
  title: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.ink },
  subtitle: { marginTop: 2, fontFamily: fonts.body, fontSize: 11.5, color: colors.textMuted },
});
