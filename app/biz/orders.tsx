import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrderCard } from '@/components/order/OrderCard';
import { IconButton } from '@/components/ui/IconButton';
import { getMerchant } from '@/data/merchants';
import { useAppState } from '@/state/AppState';
import { colors, fonts, radii } from '@/theme/theme';

type Filter = 'active' | 'completed';

export default function MerchantOrdersScreen() {
  const { orders } = useAppState();
  const [filter, setFilter] = useState<Filter>('active');

  const filtered = orders
    .filter((o) => (filter === 'active' ? o.status !== 'completed' : o.status === 'completed'))
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton onPress={() => router.push('/biz/dashboard')}>
          <ChevronLeft size={15} color={colors.inkHigh} />
        </IconButton>
        <Text style={styles.title}>Orders</Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable onPress={() => setFilter('active')} style={[styles.tab, filter === 'active' && styles.tabActive]}>
          <Text style={[styles.tabText, filter === 'active' && styles.tabTextActive]}>Active</Text>
        </Pressable>
        <Pressable onPress={() => setFilter('completed')} style={[styles.tab, filter === 'completed' && styles.tabActive]}>
          <Text style={[styles.tabText, filter === 'completed' && styles.tabTextActive]}>Completed</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No {filter} orders.</Text>
        ) : (
          filtered.map((order) => {
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontFamily: fonts.heading, fontSize: 17, color: colors.ink },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radii.pill, backgroundColor: colors.chipInactiveBg },
  tabActive: { backgroundColor: colors.inkHigh },
  tabText: { fontFamily: fonts.bodySemibold, fontSize: 12.5, color: colors.chipInactiveText },
  tabTextActive: { color: '#fff' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  emptyText: { marginTop: 20, fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
