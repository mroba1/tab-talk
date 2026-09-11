import { router, useLocalSearchParams } from 'expo-router';
import { BadgeCheck, ChevronLeft, Heart, Star } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RatingLine } from '@/components/merchant/RatingLine';
import { ProductCard } from '@/components/merchant/ProductCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { getMerchant } from '@/data/merchants';
import { mockPhoto } from '@/services/images';
import { merchantStatusPill } from '@/services/merchantStatus';
import { useAppState } from '@/state/AppState';
import { colors, fonts } from '@/theme/theme';

export default function MerchantProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const merchant = getMerchant(id);
  const { savedMerchantIds, toggleSavedMerchant } = useAppState();

  if (!merchant) {
    return (
      <SafeAreaView style={styles.flex}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>We couldn't find that business.</Text>
          <Button label="Go back" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const status = merchantStatusPill(merchant);
  const isSaved = savedMerchantIds.includes(merchant.id);

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <ImagePlaceholder
            uri={mockPhoto(`${merchant.id}-hero`, 800, 600)}
            label="Business photo"
            radius={0}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.backBtnWrap}>
            <IconButton onPress={() => router.back()} bg="rgba(255,255,255,0.85)">
              <ChevronLeft size={18} color={colors.inkHigh} />
            </IconButton>
          </View>
          <View style={styles.saveBtnWrap}>
            <IconButton onPress={() => toggleSavedMerchant(merchant.id)} bg="rgba(255,255,255,0.85)">
              <Heart size={18} color={colors.danger} fill={isSaved ? colors.danger : 'none'} />
            </IconButton>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{merchant.name}</Text>
            <BadgeCheck size={16} color={colors.primary} fill={colors.primary} />
          </View>
          <Text style={styles.metaLine}>
            ★ {merchant.rating.toFixed(1)} ({merchant.reviewCount} reviews) · {merchant.distanceMi} mi ·{' '}
            {merchant.categoryLabel}
          </Text>
          <View style={{ marginTop: 10 }}>
            <Badge label={merchant.hoursLabel} bg={status.bg} color={status.color} />
          </View>

          <Text style={styles.sectionTitle}>Products &amp; services</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hRow}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {merchant.products.map((p) => (
                <ProductCard key={p.id} product={p} merchantId={merchant.id} />
              ))}
            </View>
          </ScrollView>

          <Text style={styles.sectionTitle}>Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hRow}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {Array.from({ length: merchant.photoCount }).map((_, i) => (
                <ImagePlaceholder
                  key={i}
                  uri={mockPhoto(`${merchant.id}-photo-${i}`, 220, 220)}
                  label="Photo"
                  radius={14}
                  style={styles.photo}
                />
              ))}
            </View>
          </ScrollView>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.about}>{merchant.about}</Text>

          <Text style={styles.sectionTitle}>Reviews</Text>
          {merchant.reviews.map((r) => (
            <View key={r.id} style={styles.reviewRow}>
              <Avatar initials={r.initials} size={36} variant="light" />
              <View style={{ flex: 1 }}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{r.author}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={11} color={colors.warning} fill={colors.warning} />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewText}>{r.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Start Chat" onPress={() => router.push(`/chat/${merchant.id}`)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  notFoundText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
  hero: { width: '100%', height: 210, position: 'relative' },
  backBtnWrap: { position: 'absolute', top: 20, left: 20 },
  saveBtnWrap: { position: 'absolute', top: 20, right: 20 },
  body: { padding: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: fonts.heading, fontSize: 19, color: colors.ink },
  metaLine: { marginTop: 6, fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  sectionTitle: { marginTop: 20, fontFamily: fonts.heading, fontSize: 15, color: colors.ink },
  hRow: { marginTop: 10 },
  photo: { width: 88, height: 88 },
  about: { marginTop: 8, fontFamily: fonts.body, fontSize: 13, color: colors.textMuted2, lineHeight: 21 },
  reviewRow: { marginTop: 10, flexDirection: 'row', gap: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reviewAuthor: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  reviewText: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted2, lineHeight: 18 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: colors.borderLight },
});
