import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { api, ApiError } from '@/services/api';
import { AppSnapshot, ChatMessage, MessageSender, Order, OrderItem } from '@/types';

const EMPTY_SNAPSHOT: AppSnapshot = {
  chats: [],
  messages: [],
  orders: [],
  transactions: [],
  savedMerchantIds: [],
  availableBalance: 0,
  escrowBalance: 0,
  onboardingComplete: false,
};

interface AppStateValue extends AppSnapshot {
  isReady: boolean;
  paymentProcessing: boolean;
  typingMerchantId: string | null;
  completeOnboarding: () => Promise<void>;
  sendTextMessage: (chatId: string, text: string, sender?: MessageSender) => void;
  sendImageMessage: (chatId: string, uri: string, sender?: MessageSender) => void;
  simulateMerchantAutoReply: (merchantId: string, userText: string) => Promise<void>;
  confirmPayment: (orderId: string) => Promise<void>;
  confirmOrderReceived: (orderId: string) => void;
  merchantAcceptOrder: (orderId: string) => void;
  merchantStartPreparing: (orderId: string) => void;
  merchantMarkReady: (orderId: string) => void;
  createInvoice: (merchantId: string, item: OrderItem, delivery: number, note?: string) => void;
  toggleSavedMerchant: (merchantId: string) => void;
  messagesForChat: (chatId: string) => ChatMessage[];
  getOrder: (orderId: string) => Order | undefined;
  getOrderForMerchant: (merchantId: string) => Order | undefined;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function connectionErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Something went wrong talking to the TabTalk backend.';
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [typingMerchantId, setTypingMerchantId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<AppSnapshot>(EMPTY_SNAPSHOT);

  useEffect(() => {
    (async () => {
      try {
        setSnapshot(await api.getState());
      } catch (err) {
        Alert.alert('Backend unavailable', connectionErrorMessage(err));
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  // Every mutation just re-fetches the full snapshot from the server and
  // replaces local state with it — the backend is the single source of truth.
  const runAction = useCallback(async (fn: () => Promise<AppSnapshot>) => {
    try {
      setSnapshot(await fn());
    } catch (err) {
      Alert.alert('Connection issue', connectionErrorMessage(err));
    }
  }, []);

  const completeOnboarding = useCallback(() => runAction(() => api.completeOnboarding()), [runAction]);

  const sendTextMessage = useCallback(
    (chatId: string, text: string, sender: MessageSender = 'user') => {
      if (!text.trim()) return;
      runAction(() => api.sendTextMessage(chatId, text, sender));
    },
    [runAction]
  );

  const sendImageMessage = useCallback(
    (chatId: string, uri: string, sender: MessageSender = 'user') => {
      runAction(() => api.sendImageMessage(chatId, uri, sender));
    },
    [runAction]
  );

  const confirmPayment = useCallback(async (orderId: string) => {
    setPaymentProcessing(true);
    try {
      // Keep the deliberate "processing…" feel from the local version — floor
      // the visible delay even though the real request may resolve faster.
      const [result] = await Promise.all([api.confirmPayment(orderId), delay(1400)]);
      setSnapshot(result);
    } catch (err) {
      Alert.alert('Payment failed', connectionErrorMessage(err));
    } finally {
      setPaymentProcessing(false);
    }
  }, []);

  const merchantAcceptOrder = useCallback((orderId: string) => runAction(() => api.merchantAcceptOrder(orderId)), [runAction]);
  const merchantStartPreparing = useCallback(
    (orderId: string) => runAction(() => api.merchantStartPreparing(orderId)),
    [runAction]
  );
  const merchantMarkReady = useCallback((orderId: string) => runAction(() => api.merchantMarkReady(orderId)), [runAction]);
  const confirmOrderReceived = useCallback(
    (orderId: string) => runAction(() => api.confirmOrderReceived(orderId)),
    [runAction]
  );

  const createInvoice = useCallback(
    (merchantId: string, item: OrderItem, deliveryFee: number, note?: string) =>
      runAction(() => api.createInvoice(merchantId, item, deliveryFee, note)),
    [runAction]
  );

  const simulateMerchantAutoReply = useCallback(async (merchantId: string, userText: string) => {
    setTypingMerchantId(merchantId);
    try {
      const [result] = await Promise.all([api.simulateMerchantAutoReply(merchantId, userText), delay(1100)]);
      setSnapshot(result);
    } catch (err) {
      Alert.alert('Connection issue', connectionErrorMessage(err));
    } finally {
      setTypingMerchantId(null);
    }
  }, []);

  const toggleSavedMerchant = useCallback(
    (merchantId: string) => runAction(() => api.toggleSavedMerchant(merchantId)),
    [runAction]
  );

  const messagesForChat = useCallback(
    (chatId: string) => snapshot.messages.filter((m) => m.chatId === chatId).sort((a, b) => a.createdAt - b.createdAt),
    [snapshot.messages]
  );

  const getOrder = useCallback((orderId: string) => snapshot.orders.find((o) => o.id === orderId), [snapshot.orders]);

  const getOrderForMerchant = useCallback(
    (merchantId: string) => snapshot.orders.find((o) => o.merchantId === merchantId),
    [snapshot.orders]
  );

  const value = useMemo<AppStateValue>(
    () => ({
      ...snapshot,
      isReady,
      paymentProcessing,
      typingMerchantId,
      completeOnboarding,
      sendTextMessage,
      sendImageMessage,
      simulateMerchantAutoReply,
      confirmPayment,
      confirmOrderReceived,
      merchantAcceptOrder,
      merchantStartPreparing,
      merchantMarkReady,
      createInvoice,
      toggleSavedMerchant,
      messagesForChat,
      getOrder,
      getOrderForMerchant,
    }),
    [
      snapshot,
      isReady,
      paymentProcessing,
      typingMerchantId,
      completeOnboarding,
      sendTextMessage,
      sendImageMessage,
      simulateMerchantAutoReply,
      confirmPayment,
      confirmOrderReceived,
      merchantAcceptOrder,
      merchantStartPreparing,
      merchantMarkReady,
      createInvoice,
      toggleSavedMerchant,
      messagesForChat,
      getOrder,
      getOrderForMerchant,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
