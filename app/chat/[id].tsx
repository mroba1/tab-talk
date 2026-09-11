import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Receipt } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { InvoiceCard } from '@/components/chat/InvoiceCard';
import { MenuCard } from '@/components/chat/MenuCard';
import { OrderUpdateCard } from '@/components/chat/OrderUpdateCard';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { PulseDot } from '@/components/ui/PulseDot';
import { getMerchant } from '@/data/merchants';
import { colors, fonts } from '@/theme/theme';
import { useAppState } from '@/state/AppState';
import { Product } from '@/types';

export default function ChatScreen() {
  const { id, as } = useLocalSearchParams<{ id: string; as?: string }>();
  const isMerchantView = as === 'merchant';
  const merchant = getMerchant(id);
  const {
    messagesForChat,
    sendTextMessage,
    sendImageMessage,
    simulateMerchantAutoReply,
    typingMerchantId,
    getOrder,
    getOrderForMerchant,
  } = useAppState();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const merchantId = id ?? '';
  const messages = messagesForChat(merchantId);
  const latestOrderMessage = [...messages].reverse().find((m) => m.invoiceId || m.orderId);
  const latestOrderId = latestOrderMessage?.invoiceId ?? latestOrderMessage?.orderId;
  const orderStatusKey = latestOrderId ? getOrder(latestOrderId)?.status : null;
  const isTyping = typingMerchantId === merchantId;

  useEffect(() => {
    const timeout = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timeout);
  }, [messages.length, orderStatusKey, isTyping]);

  if (!merchant) {
    return (
      <SafeAreaView style={styles.flex}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>This conversation isn't available.</Text>
          <Button label="Go back" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  // Customer messages trigger the demo "auto-reply" bot, but only while this
  // merchant has no real order yet — the hand-scripted seed conversations
  // (Sweet Crumb, Fix-It) already have one and shouldn't be interrupted by it.
  const maybeAutoReply = (text: string) => {
    if (isMerchantView) return;
    if (getOrderForMerchant(merchantId)) return;
    simulateMerchantAutoReply(merchantId, text);
  };

  const handleSend = () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    sendTextMessage(merchantId, text, isMerchantView ? 'merchant' : 'user');
    setDraft('');
    maybeAutoReply(text);
  };

  const handleMenuSelect = (product: Product) => {
    sendTextMessage(merchantId, product.name, 'user');
    maybeAutoReply(product.name);
  };

  const handleAttach = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photo access needed', 'Allow photo access to share a reference image.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      if (result.canceled || !result.assets?.length) return;
      sendImageMessage(merchantId, result.assets[0].uri, isMerchantView ? 'merchant' : 'user');
    } catch (err) {
      Alert.alert('Something went wrong', 'Could not open your photo library.');
    }
  };

  const orderDetailsPath = (orderId: string) => (isMerchantView ? `/orders/${orderId}?as=merchant` : `/escrow/${orderId}`);

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <Pressable style={styles.header} onPress={Keyboard.dismiss}>
        <IconButton onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={15} color={colors.inkHigh} />
        </IconButton>
        {isMerchantView ? (
          <Avatar initials="AR" size={38} variant="light" />
        ) : (
          <Avatar initials={merchant.initials} size={38} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.merchantName}>{isMerchantView ? 'Amara Reyes' : merchant.name}</Text>
          {isMerchantView ? (
            <Text style={styles.customerSub}>{merchant.name}</Text>
          ) : (
            <View style={styles.activeRow}>
              <PulseDot color={colors.success} size={6} />
              <Text style={styles.activeText}>Active now</Text>
            </View>
          )}
        </View>
        {isMerchantView && (
          <IconButton onPress={() => router.push(`/biz/invoice?merchantId=${merchantId}`)}>
            <Receipt size={16} color={colors.inkHigh} />
          </IconButton>
        )}
      </Pressable>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={Keyboard.dismiss}
        >
          {messages.map((m) => {
            if (m.type === 'invoice') {
              const invoiceOrderData = m.invoiceId ? getOrder(m.invoiceId) : undefined;
              if (!invoiceOrderData) return <ChatBubble key={m.id} message={m} viewerIsMerchant={isMerchantView} />;
              return (
                <InvoiceCard
                  key={m.id}
                  order={invoiceOrderData}
                  viewerRole={isMerchantView ? 'merchant' : 'customer'}
                  onPay={() => router.push(`/payment/confirm?orderId=${invoiceOrderData.id}`)}
                  onTrack={() => router.push(orderDetailsPath(invoiceOrderData.id))}
                />
              );
            }
            if (m.type === 'order_update') {
              const updateOrder = m.orderId ? getOrder(m.orderId) : undefined;
              return (
                <OrderUpdateCard
                  key={m.id}
                  text={m.text ?? 'Order updated'}
                  onView={() => updateOrder && router.push(orderDetailsPath(updateOrder.id))}
                />
              );
            }
            if (m.type === 'menu') {
              return <MenuCard key={m.id} products={merchant.products} onSelect={handleMenuSelect} />;
            }
            return <ChatBubble key={m.id} message={m} viewerIsMerchant={isMerchantView} />;
          })}
          {isTyping && !isMerchantView && <TypingIndicator />}
        </ScrollView>

        <ChatInput
          value={draft}
          onChangeText={setDraft}
          onSend={handleSend}
          onAttach={handleAttach}
          placeholder={isMerchantView ? 'Reply to customer…' : `Message ${merchant.name}…`}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surfaceMuted3 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  notFoundText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  backBtn: { flexShrink: 0 },
  merchantName: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  customerSub: { marginTop: 2, fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  activeText: { fontFamily: fonts.body, fontSize: 11, color: colors.success },
  messages: { padding: 16, gap: 12 },
});
