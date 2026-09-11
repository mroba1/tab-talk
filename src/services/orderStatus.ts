import { colors } from '@/theme/theme';
import { Order } from '@/types';

export function homeStatusPill(order: Order): { label: string; bg: string; color: string } {
  if (order.paymentStatus === 'unpaid') {
    return { label: 'Awaiting payment', bg: colors.warningBg, color: colors.warning };
  }
  if (order.status === 'completed') {
    return { label: 'Completed', bg: colors.surfaceMuted, color: colors.textMuted4 };
  }
  if (order.status === 'ready') {
    return { label: 'Ready', bg: colors.successBg, color: colors.success };
  }
  return { label: 'In progress', bg: colors.successBg, color: colors.success };
}

export function orderStatusPill(order: Order): { label: string; bg: string; color: string } {
  if (order.status === 'completed') {
    return { label: 'Order complete', bg: colors.successBg, color: colors.success };
  }
  if (order.status === 'ready') {
    return { label: 'Ready', bg: colors.successBg, color: colors.success };
  }
  return { label: 'Order in progress', bg: colors.warningBg, color: colors.warning };
}

// Friendly copy for each step of the merchant-driven lifecycle, shown to the
// customer wherever they can't yet take an action themselves. Kept generic on
// purpose — an order can be a physical good (picked up or delivered) or a
// service performed in person, so this shouldn't assume either.
export function customerStatusLine(order: Order, merchantName: string): string {
  switch (order.status) {
    case 'awaiting_payment':
      return 'Waiting for payment.';
    case 'payment_secured':
      return `Waiting for ${merchantName} to accept your order.`;
    case 'order_accepted':
      return `${merchantName} accepted your order.`;
    case 'in_progress':
      return `${merchantName} is working on your order.`;
    case 'ready':
      return "Your order is ready — confirm once it's done.";
    case 'completed':
      return 'Order complete.';
    default:
      return '';
  }
}
