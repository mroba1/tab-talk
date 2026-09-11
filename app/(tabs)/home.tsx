import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Bell, MessageSquare, Search } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatListItem } from '@/components/chat/ChatListItem';
import { NearbyMerchantCard } from '@/components/merchant/MerchantCard';
import { OrderCard } from '@/components/order/OrderCard';
import { PulseDot } from '@/components/ui/PulseDot';
import { getMerchant, MERCHANTS } from '@/data/merchants';
import { useAppState } from '@/state/AppState';
import { colors, fonts, radii } from '@/theme/theme';

const CATEGORY_CHIPS = ['Food', 'Groceries', 'Fashion', 'Beauty', 'Repairs', 'Tailors'];

export default function HomeScreen() {
  const { orders, chats } = useAppState();
  const activeOrder = orders.find((o) => o.status !== 'completed');
  const activeOrderMerchant = activeOrder ? getMerchant(activeOrder.merchantId) : undefined;
  const nearby = MERCHANTS.slice(0, 4);
  const recentChats = chats.slice(0, 2);

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good afternoon</Text>
            <Text style={styles.location}>Downtown, Austin</Text>
          </View>
          <View style={styles.bellBtn}>
            <Bell size={18} color={colors.inkHigh} />
          </View>
        </View>
        <Pressable onPress={() => router.push('/discover')} style={styles.searchBar}>
          <Search size={16} color={colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Search businesses, food, services</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={require('../../assets/images/splash-hero.jpeg')} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(20,15,45,0.32)', 'rgba(35,26,80,0.4)', 'rgba(24,18,54,0.6)', 'rgba(10,8,26,0.8)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroTopRow}>
            <View style={styles.heroBrand}>
              <View style={styles.heroBrandIcon}>
                <MessageSquare size={12} color="#fff" fill="#fff" />
              </View>
              <Text style={styles.heroBrandText}>TabTalk</Text>
            </View>
            <View style={styles.livePill}>
              <PulseDot color="#7fe0b0" size={6} />
              <Text style={styles.livePillText}>128 nearby</Text>
            </View>
          </View>
          <View style={styles.heroBottom}>
            <Text style={styles.heroHeadline}>One chat from hello to paid.</Text>
            <Text style={styles.heroSub}>
              Discover local businesses, get quotes in chat, and pay safely — your money held in escrow until
              you're happy.
            </Text>
            <View style={styles.heroChips}>
              {['Chat directly', 'Invoice in chat', 'Escrow protected'].map((c) => (
                <View key={c} style={styles.heroChip}>
                  <Text style={styles.heroChipText}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {CATEGORY_CHIPS.map((c, i) => (
            <View key={c} style={[styles.chip, i === 0 && styles.chipActive]}>
              <Text style={[styles.chipText, i === 0 && styles.chipTextActive]}>{c}</Text>
            </View>
          ))}
        </ScrollView>

        {activeOrder && activeOrderMerchant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active order</Text>
            <OrderCard order={activeOrder} merchant={activeOrderMerchant} />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Nearby you</Text>
            <Text onPress={() => router.push('/discover')} style={styles.seeAll} suppressHighlighting>
              See all
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {nearby.map((m) => (
                <NearbyMerchantCard key={m.id} merchant={m} />
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={[styles.section, { paddingBottom: 8 }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent chats</Text>
            <Text onPress={() => router.push('/chats')} style={styles.seeAll} suppressHighlighting>
              See all
            </Text>
          </View>
          <View style={{ marginTop: 6 }}>
            {recentChats.map((c) => {
              const m = getMerchant(c.merchantId);
              if (!m) return null;
              return <ChatListItem key={c.id} chat={c} merchant={m} primary={m.id === 'sweet-crumb'} />;
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted },
  location: { marginTop: 2, fontFamily: fonts.heading, fontSize: 19, color: colors.ink },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    marginTop: 16,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchPlaceholder: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },

  hero: {
    height: 220,
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroBrand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  heroBrandIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBrandText: { fontFamily: fonts.heading, fontSize: 15, color: '#fff' },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
  },
  livePillText: { fontFamily: fonts.bodyBold, fontSize: 10, color: '#fff' },
  heroBottom: { gap: 6 },
  heroHeadline: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: '#fff',
    lineHeight: 25,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  heroSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  heroChips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  heroChip: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
  },
  heroChipText: { fontFamily: fonts.bodySemibold, fontSize: 10.5, color: '#fff' },

  chipsRow: { marginTop: 18 },
  chip: {
    backgroundColor: colors.chipInactiveBg,
    borderRadius: radii.pill,
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  chipActive: { backgroundColor: colors.inkHigh },
  chipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.chipInactiveText },
  chipTextActive: { color: '#fff' },

  section: { marginTop: 22 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 16, color: colors.ink },
  seeAll: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.primary },
});
