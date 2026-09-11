import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantListItem } from '@/components/merchant/MerchantCard';
import { IconButton } from '@/components/ui/IconButton';
import { MERCHANTS } from '@/data/merchants';
import { useAppState } from '@/state/AppState';
import { colors, fonts } from '@/theme/theme';

export default function SavedBusinessesScreen() {
  const { savedMerchantIds } = useAppState();
  const saved = MERCHANTS.filter((m) => savedMerchantIds.includes(m.id));

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton onPress={() => router.back()}>
          <ChevronLeft size={15} color={colors.inkHigh} />
        </IconButton>
        <Text style={styles.title}>Saved Businesses</Text>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {saved.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Tap the heart on a business profile to save it here for quick access later.
            </Text>
          </View>
        ) : (
          saved.map((m) => <MerchantListItem key={m.id} merchant={m} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontFamily: fonts.heading, fontSize: 17, color: colors.ink },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  empty: { paddingVertical: 60, alignItems: 'center', paddingHorizontal: 24 },
  emptyText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
