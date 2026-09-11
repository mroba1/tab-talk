import { router } from 'expo-router';
import { MessageCircleQuestionMark, Search, SlidersHorizontal } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MerchantListItem } from '@/components/merchant/MerchantCard';
import { Avatar } from '@/components/ui/Avatar';
import { CATEGORY_FILTERS, MERCHANTS } from '@/data/merchants';
import { merchantStatusPill } from '@/services/merchantStatus';
import { colors, fonts, radii } from '@/theme/theme';

const AUSTIN_REGION = {
  latitude: 30.2672,
  longitude: -97.7431,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

type SortOption = 'nearby' | 'rated' | 'open';
const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'nearby', label: 'Nearby' },
  { key: 'rated', label: 'Highest rated' },
  { key: 'open', label: 'Open now' },
];

export default function DiscoverScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortOption>('nearby');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const results = MERCHANTS.filter((m) => {
      const matchesCategory = category === 'All' || m.category === category;
      const matchesQuery =
        q.length === 0 ||
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.categoryLabel.toLowerCase().includes(q) ||
        m.about.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });

    const sorted = [...results];
    if (sort === 'nearby') sorted.sort((a, b) => a.distanceMi - b.distanceMi);
    else if (sort === 'rated') sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === 'open') sorted.sort((a, b) => Number(b.isOpen) - Number(a.isOpen));
    return sorted;
  }, [query, category, sort]);

  const selected = MERCHANTS.find((m) => m.id === selectedId);

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={16} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search nearby"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>
          <Pressable style={styles.filterBtn} onPress={() => router.push('/request')}>
            <MessageCircleQuestionMark size={16} color="#fff" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <View style={styles.mapWrap}>
          <MapView
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
            initialRegion={AUSTIN_REGION}
          >
            {MERCHANTS.map((m) => (
              <Marker
                key={m.id}
                coordinate={m.location}
                title={m.name}
                pinColor={m.id === selectedId ? colors.primary : colors.inkHigh}
                onPress={() => setSelectedId(m.id)}
              />
            ))}
          </MapView>

          {selected && (
            <Pressable style={styles.mapPreview} onPress={() => router.push(`/merchant/${selected.id}`)}>
              <Avatar initials={selected.initials} size={36} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.mapPreviewName} numberOfLines={1}>
                  {selected.name}
                </Text>
                <Text style={styles.mapPreviewMeta} numberOfLines={1}>
                  {merchantStatusPill(selected).label} · {selected.distanceMi} mi
                </Text>
              </View>
              <Text style={styles.mapPreviewCta}>View</Text>
            </Pressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {CATEGORY_FILTERS.map((c) => (
            <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipActive]}>
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => setSort(opt.key)}
              style={[styles.sortChip, sort === opt.key && styles.sortChipActive]}
            >
              <SlidersHorizontal size={11} color={sort === opt.key ? colors.primary : colors.textMuted} />
              <Text style={[styles.sortChipText, sort === opt.key && styles.sortChipTextActive]}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No businesses match your search yet.</Text>
          </View>
        ) : (
          filtered.map((m) => <MerchantListItem key={m.id} merchant={m} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontFamily: fonts.heading, fontSize: 20, color: colors.ink },
  searchRow: { marginTop: 14, flexDirection: 'row', gap: 8 },
  searchBar: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.ink, paddingVertical: 13 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.inkHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },

  mapWrap: { marginTop: 4, height: 180, borderRadius: 20, overflow: 'hidden' },
  map: { flex: 1 },
  mapPreview: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#241c4a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  mapPreviewName: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  mapPreviewMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 1 },
  mapPreviewCta: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.primary },

  chipsRow: { marginTop: 14 },
  chip: {
    backgroundColor: colors.chipInactiveBg,
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.inkHigh },
  chipText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.chipInactiveText },
  chipTextActive: { color: '#fff' },

  sortRow: { marginTop: 10, flexDirection: 'row', gap: 8 },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: { backgroundColor: colors.surfaceMuted2, borderColor: colors.primary },
  sortChipText: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.textMuted },
  sortChipTextActive: { color: colors.primary },

  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
});
