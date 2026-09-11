import { Order } from '@/types';

export function orderSubtotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function orderTotal(order: Order): number {
  return orderSubtotal(order) + order.delivery;
}

export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
