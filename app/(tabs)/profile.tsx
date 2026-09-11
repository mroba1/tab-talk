import { router } from 'expo-router';
import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Receipt,
  Settings as SettingsIcon,
  ShieldCheck,
  Star,
  Store,
} from 'lucide-react-native';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { colors, fonts, radii } from '@/theme/theme';

const MENU: { icon: typeof Star; label: string; action: 'wallet' | 'saved' | 'placeholder' }[] = [
  { icon: Star, label: 'Saved businesses', action: 'saved' },
  { icon: CreditCard, label: 'Payment methods', action: 'placeholder' },
  { icon: Receipt, label: 'Transaction history', action: 'wallet' },
  { icon: ShieldCheck, label: 'Security', action: 'placeholder' },
  { icon: Bell, label: 'Notifications', action: 'placeholder' },
  { icon: HelpCircle, label: 'Help', action: 'placeholder' },
  { icon: SettingsIcon, label: 'Settings', action: 'placeholder' },
];

export default function ProfileScreen() {
  const handlePress = (item: (typeof MENU)[number]) => {
    if (item.action === 'wallet') {
      router.push('/wallet');
      return;
    }
    if (item.action === 'saved') {
      router.push('/saved');
      return;
    }
    Alert.alert(item.label, "This is a prototype — there's nothing to configure here yet.");
  };

  const handleLogout = () => {
    Alert.alert('Log out?', 'You can always come back and sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => router.replace('/') },
    ]);
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.header}>
        <Avatar initials="AR" size={56} />
        <View>
          <Text style={styles.name}>Amara Reyes</Text>
          <Text style={styles.email}>amara@example.com</Text>
        </View>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.push('/biz/dashboard')} style={styles.merchantCard}>
          <View style={styles.merchantIconWrap}>
            <Store size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.merchantCardTitle}>Switch to Merchant Mode</Text>
            <Text style={styles.merchantCardSub}>Manage orders, chats, and invoices as a business</Text>
          </View>
          <ChevronRight size={16} color={colors.primary} />
        </Pressable>

        {MENU.map((item, i) => (
          <Pressable
            key={item.label}
            onPress={() => handlePress(item)}
            style={[styles.row, i < MENU.length - 1 && styles.bordered]}
          >
            <View style={styles.iconWrap}>
              <item.icon size={15} color={colors.primary} strokeWidth={1.8} />
            </View>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <ChevronRight size={16} color={colors.textPlaceholder} />
          </Pressable>
        ))}

        <Text onPress={handleLogout} style={styles.logout} suppressHighlighting>
          Log out
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  name: { fontFamily: fonts.heading, fontSize: 17, color: colors.ink },
  email: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  merchantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceMuted2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxxl,
    padding: 14,
    marginBottom: 16,
  },
  merchantIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.inkHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchantCardTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  merchantCardSub: { marginTop: 2, fontFamily: fonts.body, fontSize: 11.5, color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  bordered: { borderBottomWidth: 1, borderBottomColor: colors.borderLighter },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.ink },
  logout: {
    marginTop: 18,
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.danger,
    paddingVertical: 8,
  },
});
