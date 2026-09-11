export type Category =
  | 'Food'
  | 'Groceries'
  | 'Fashion'
  | 'Beauty'
  | 'Home'
  | 'Services'
  | 'Repairs'
  | 'Tailors';

export interface Product {
  id: string;
  name: string;
  price: number;
  priceFrom?: boolean;
}

export interface Merchant {
  id: string;
  name: string;
  initials: string;
  category: Category;
  categoryLabel: string;
  rating: number;
  reviewCount: number;
  distanceMi: number;
  isOpen: boolean;
  hoursLabel: string;
  tagline: string;
  about: string;
  products: Product[];
  photoCount: number;
  reviews: { id: string; author: string; initials: string; rating: number; text: string }[];
  location: { latitude: number; longitude: number };
}

export type MessageType = 'text' | 'image' | 'invoice' | 'system' | 'order_update' | 'menu';
export type MessageSender = 'user' | 'merchant';

export interface ChatMessage {
  id: string;
  chatId: string;
  sender: MessageSender;
  type: MessageType;
  text?: string;
  imageUri?: string;
  invoiceId?: string;
  orderId?: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  merchantId: string;
  lastMessage: string;
  lastMessageAt: number;
  hasPendingInvoice: boolean;
}

export type PaymentStatus = 'unpaid' | 'secured' | 'released';
export type EscrowStatus = 'none' | 'held' | 'released';
// Full lifecycle: customer pays -> merchant accepts -> merchant prepares -> merchant
// marks ready -> customer confirms. Each step after payment is a merchant action.
export type OrderStatus =
  | 'awaiting_payment'
  | 'payment_secured'
  | 'order_accepted'
  | 'in_progress'
  | 'ready'
  | 'completed';

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  code: string;
  merchantId: string;
  chatId: string;
  items: OrderItem[];
  delivery: number;
  note?: string;
  paymentStatus: PaymentStatus;
  escrowStatus: EscrowStatus;
  status: OrderStatus;
  createdAt: number;
  securedAt?: number;
  acceptedAt?: number;
  readyAt?: number;
  completedAt?: number;
}

export interface Transaction {
  id: string;
  merchantId?: string;
  label: string;
  sub: string;
  amount: number;
  direction: 'debit' | 'credit' | 'pending';
  date: number;
}

// Shape returned by every backend call — the app just does setState(snapshot)
// after each mutation, same as it did with the local AsyncStorage blob before.
export interface AppSnapshot {
  chats: Chat[];
  messages: ChatMessage[];
  orders: Order[];
  transactions: Transaction[];
  savedMerchantIds: string[];
  availableBalance: number;
  escrowBalance: number;
  onboardingComplete: boolean;
}
