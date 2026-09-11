import { AppSnapshot, MessageSender, OrderItem } from '@/types';

// EXPO_PUBLIC_* env vars are inlined at build time — set this in a .env file
// (local dev) or in eas.json's build profiles (real builds, e.g. the deployed
// Railway URL). Falls back to this machine's LAN IP so local Expo Go dev
// keeps working with zero setup, same as before the backend existed.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.0.200:4000/api';

class ApiError extends Error {}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (err) {
    throw new ApiError(`Could not reach the TabTalk backend at ${API_BASE_URL}. Is the server running?`);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.error || `Request to ${path} failed with ${response.status}`);
  }
  return response.json();
}

const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });

export const api = {
  getState: () => request<AppSnapshot>('/state'),
  completeOnboarding: () => post<AppSnapshot>('/onboarding/complete'),
  sendTextMessage: (chatId: string, text: string, sender?: MessageSender) =>
    post<AppSnapshot>('/messages/text', { chatId, text, sender }),
  sendImageMessage: (chatId: string, uri: string, sender?: MessageSender) =>
    post<AppSnapshot>('/messages/image', { chatId, uri, sender }),
  confirmPayment: (orderId: string) => post<AppSnapshot>(`/payments/${orderId}/confirm`),
  merchantAcceptOrder: (orderId: string) => post<AppSnapshot>(`/orders/${orderId}/accept`),
  merchantStartPreparing: (orderId: string) => post<AppSnapshot>(`/orders/${orderId}/start-preparing`),
  merchantMarkReady: (orderId: string) => post<AppSnapshot>(`/orders/${orderId}/mark-ready`),
  confirmOrderReceived: (orderId: string) => post<AppSnapshot>(`/orders/${orderId}/confirm-received`),
  createInvoice: (merchantId: string, item: OrderItem, delivery: number, note?: string) =>
    post<AppSnapshot>('/invoices', { merchantId, item, delivery, note }),
  simulateMerchantAutoReply: (merchantId: string, userText: string) =>
    post<AppSnapshot>(`/chat/${merchantId}/auto-reply`, { userText }),
  toggleSavedMerchant: (merchantId: string) => post<AppSnapshot>(`/saved-merchants/${merchantId}/toggle`),
};

export { ApiError };
