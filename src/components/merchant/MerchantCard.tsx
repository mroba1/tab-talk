import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RatingLine } from '@/components/merchant/RatingLine';
import { Badge } from '@/components/ui/Badge';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { mockPhoto } from '@/services/images';
import { merchantStatusPill } from '@/services/merchantStatus';
import { colors, fonts, radii, shadow } from '@/theme/theme';
import { Merchant } from '@/types';

interface NearbyCardProps {
  merchant: Merchant;
}

// Horizontal-scroll "Nearby you" card used on Home.
export function NearbyMerchantCard({ merchant }: NearbyCardProps) {
  const status = merchantStatusPill(merchant);
  return (
    <Pressable onPress={() => router.push(`/merchant/${merchant.id}`)} style={styles.nearbyWrap}>
      {({ pressed }) => (
        <View style={[pressed && styles.pressedLift]}>
          <View style={styles.nearbyImageWrap}>
            <ImagePlaceholder
              uri={mockPhoto(`${merchant.id}-hero`, 360, 220)}
              label="Storefront photo"
              radius={18}
              style={styles.nearbyImage}
            />
            <View style={styles.nearbyBadge}>
              <Badge label={status.label} bg={status.bg} color={status.color} small />
            </View>
          </View>
          <Text style={styles.nearbyName} numberOfLines={1}>
            {merchant.name}
          </Text>
          <View style={{ marginTop: 2 }}>
            <RatingLine rating={merchant.rating} distanceMi={merchant.distanceMi} categoryLabel={merchant.category} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

// Full-width row card used on Discover.
export function MerchantListItem({ merchant }: NearbyCardProps) {
  const status = merchantStatusPill(merchant);
  return (
    <Pressable onPress={() => router.push(`/merchant/${merchant.id}`)} style={styles.listCard}>
      <ImagePlaceholder
        uri={mockPhoto(`${merchant.id}-hero`, 200, 200)}
        label="Storefront photo"
        radius={14}
        style={styles.listThumb}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.listName} numberOfLines={1}>
          {merchant.name}
        </Text>
        <View style={{ marginTop: 3 }}>
          <RatingLine
            rating={merchant.rating}
            reviewCount={merchant.reviewCount}
            distanceMi={merchant.distanceMi}
            categoryLabel={merchant.category}
          />
        </View>
        <View style={{ marginTop: 6 }}>
          <Badge label={status.label} bg={status.bg} color={status.color} small />
        </View>
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          router.push(`/chat/${merchant.id}`);
        }}
        style={styles.chatBtn}
        hitSlop={4}
      >
        <Text style={styles.chatBtnText}>Chat</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nearbyWrap: { width: 180 },
  pressedLift: { opacity: 0.85 },
  nearbyImageWrap: { width: 180, height: 110, borderRadius: 18 },
  nearbyImage: { width: '100%', height: '100%' },
  nearbyBadge: { position: 'absolute', top: 8, left: 8 },
  nearbyName: { marginTop: 8, fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },

  listCard: {
    marginTop: 12,
    backgroundColor: colors.surfaceMuted2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxxl,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    ...shadow.soft,
  },
  listThumb: { width: 64, height: 64, flexShrink: 0 },
  listName: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  chatBtn: {
    alignSelf: 'center',
    backgroundColor: colors.inkHigh,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
  },
  chatBtnText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.white },
});
