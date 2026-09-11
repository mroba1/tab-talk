import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InvoiceLines } from '@/components/chat/InvoiceLines';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { getMerchant } from '@/data/merchants';
import { useAppState } from '@/state/AppState';
import { colors, fonts, radii } from '@/theme/theme';

export default function CreateInvoiceScreen() {
  const { merchantId } = useLocalSearchParams<{ merchantId: string }>();
  const merchant = getMerchant(merchantId);
  const { createInvoice } = useAppState();

  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState('');
  const [delivery, setDelivery] = useState('0');
  const [note, setNote] = useState('');

  const qtyNum = Math.max(1, parseInt(qty, 10) || 1);
  const priceNum = Math.max(0, parseFloat(price) || 0);
  const deliveryNum = Math.max(0, parseFloat(delivery) || 0);
  const canSend = itemName.trim().length > 0 && priceNum > 0;

  const previewOrder = {
    items: [{ name: itemName.trim() || 'Item', qty: qtyNum, price: priceNum }],
    delivery: deliveryNum,
  };

  const handleSend = () => {
    if (!canSend || !merchantId) return;
    createInvoice(merchantId, { name: itemName.trim(), qty: qtyNum, price: priceNum }, deliveryNum, note);
    router.back();
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <Pressable style={styles.header} onPress={Keyboard.dismiss}>
        <IconButton onPress={() => router.back()}>
          <ChevronLeft size={15} color={colors.inkHigh} />
        </IconButton>
        <Text style={styles.title}>Create Invoice</Text>
      </Pressable>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={Keyboard.dismiss}
        >
          {merchant && <Text style={styles.subtitle}>Sending as {merchant.name}</Text>}

          <Text style={styles.label}>Item name</Text>
          <TextInput
            value={itemName}
            onChangeText={setItemName}
            placeholder={merchant?.products[0]?.name ?? 'Item name'}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              value={qty}
              onChangeText={setQty}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="40"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>
        </View>

        <Text style={styles.label}>Delivery fee</Text>
        <TextInput
          value={delivery}
          onChangeText={setDelivery}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Any details for the customer"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.noteInput]}
          multiline
        />

        <Text style={styles.previewTitle}>Preview</Text>
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>INVOICE</Text>
          <InvoiceLines order={previewOrder} style={{ marginTop: 6 }} />
          {!!note.trim() && <Text style={styles.previewNote}>Note: {note.trim()}</Text>}
        </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Send Invoice" onPress={handleSend} disabled={!canSend} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontFamily: fonts.heading, fontSize: 17, color: colors.ink },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  subtitle: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, marginBottom: 8 },
  label: { marginTop: 14, fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 },
  input: {
    marginTop: 6,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  noteInput: { minHeight: 60, textAlignVertical: 'top' },
  row2: { flexDirection: 'row', gap: 12 },
  previewTitle: { marginTop: 24, fontFamily: fonts.heading, fontSize: 14, color: colors.ink },
  previewCard: {
    marginTop: 10,
    backgroundColor: colors.surfaceMuted2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxxl,
    padding: 16,
  },
  previewLabel: { fontFamily: fonts.heading, fontSize: 12, color: colors.ink, letterSpacing: 0.3 },
  previewNote: { marginTop: 8, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: colors.borderLight },
});
