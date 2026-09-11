import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { mockPhoto } from '@/services/images';
import { formatMoney } from '@/services/orderService';
import { colors, fonts } from '@/theme/theme';
import { Product } from '@/types';

export function ProductCard({ product, merchantId }: { product: Product; merchantId: string }) {
  return (
    <View style={styles.wrap}>
      <ImagePlaceholder
        uri={mockPhoto(`${merchantId}-${product.id}`, 240, 180)}
        label="Product photo"
        radius={14}
        style={styles.image}
      />
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.price}>
        {product.priceFrom ? 'From ' : ''}
        {formatMoney(product.price)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 120 },
  image: { width: 120, height: 90 },
  name: { marginTop: 6, fontFamily: fonts.bodyBold, fontSize: 12, color: colors.ink },
  price: { marginTop: 1, fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
});
