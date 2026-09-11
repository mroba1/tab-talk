'use strict';

const { db } = require('./db');
const { getMerchant } = require('./merchants');
const { formatMoney, orderTotalFromItems, nextId, orderCode } = require('./helpers');

function getMeta(key, fallback) {
  const row = db.prepare('SELECT value FROM meta WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

function setMeta(key, value) {
  db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run(key, String(value));
}

function rowToChat(row) {
  return {
    id: row.id,
    merchantId: row.merchant_id,
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at,
    hasPendingInvoice: !!row.has_pending_invoice,
  };
}

function rowToMessage(row) {
  return {
    id: row.id,
    chatId: row.chat_id,
    sender: row.sender,
    type: row.type,
    text: row.text ?? undefined,
    imageUri: row.image_uri ?? undefined,
    invoiceId: row.invoice_id ?? undefined,
    orderId: row.order_id ?? undefined,
    createdAt: row.created_at,
  };
}

function rowToOrder(row, items) {
  return {
    id: row.id,
    code: row.code,
    merchantId: row.merchant_id,
    chatId: row.chat_id,
    items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    delivery: row.delivery,
    note: row.note ?? undefined,
    paymentStatus: row.payment_status,
    escrowStatus: row.escrow_status,
    status: row.status,
    createdAt: row.created_at,
    securedAt: row.secured_at ?? undefined,
    acceptedAt: row.accepted_at ?? undefined,
    readyAt: row.ready_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
  };
}

function rowToTransaction(row) {
  return {
    id: row.id,
    merchantId: row.merchant_id ?? undefined,
    label: row.label,
    sub: row.sub,
    amount: row.amount,
    direction: row.direction,
    date: row.date,
  };
}

// Assembles the exact PersistedState shape the app expects — the client just
// does setState(response) after every call, same as it used to with AsyncStorage.
function buildStateBlob() {
  const chats = db.prepare('SELECT * FROM chats').all().map(rowToChat);
  const messages = db.prepare('SELECT * FROM messages ORDER BY created_at ASC').all().map(rowToMessage);
  const orderRows = db.prepare('SELECT * FROM orders').all();
  const orders = orderRows.map((row) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(row.id);
    return rowToOrder(row, items);
  });
  const transactions = db.prepare('SELECT * FROM transactions ORDER BY date DESC').all().map(rowToTransaction);
  const savedMerchantIds = db.prepare('SELECT merchant_id FROM saved_merchants').all().map((r) => r.merchant_id);

  return {
    chats,
    messages,
    orders,
    transactions,
    savedMerchantIds,
    availableBalance: Number(getMeta('availableBalance', '0')),
    escrowBalance: Number(getMeta('escrowBalance', '0')),
    onboardingComplete: getMeta('onboardingComplete', 'false') === 'true',
  };
}

function ensureChat(chatId, merchantId) {
  const existing = db.prepare('SELECT id FROM chats WHERE id = ?').get(chatId);
  if (existing) return;
  db.prepare('INSERT INTO chats (id, merchant_id, last_message, last_message_at, has_pending_invoice) VALUES (?, ?, ?, ?, 0)').run(
    chatId,
    merchantId,
    '',
    Date.now()
  );
}

function touchChat(chatId, lastMessage, lastMessageAt, hasPendingInvoice) {
  if (hasPendingInvoice === undefined) {
    db.prepare('UPDATE chats SET last_message = ?, last_message_at = ? WHERE id = ?').run(lastMessage, lastMessageAt, chatId);
  } else {
    db.prepare('UPDATE chats SET last_message = ?, last_message_at = ?, has_pending_invoice = ? WHERE id = ?').run(
      lastMessage,
      lastMessageAt,
      hasPendingInvoice ? 1 : 0,
      chatId
    );
  }
}

function insertMessage({ id, chatId, sender, type, text, imageUri, invoiceId, orderId, createdAt }) {
  db.prepare(
    `INSERT INTO messages (id, chat_id, sender, type, text, image_uri, invoice_id, order_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, chatId, sender, type, text ?? null, imageUri ?? null, invoiceId ?? null, orderId ?? null, createdAt);
}

function getOrder(orderId) {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!row) return undefined;
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
  return rowToOrder(row, items);
}

function orderTotal(order) {
  return orderTotalFromItems(order.items, order.delivery);
}

// ---- Actions — each one mirrors an AppState.tsx callback exactly ----

function completeOnboarding() {
  setMeta('onboardingComplete', 'true');
  return buildStateBlob();
}

function sendTextMessage({ chatId, text, sender = 'user' }) {
  const trimmed = text.trim();
  if (!trimmed) return buildStateBlob();
  ensureChat(chatId, chatId);
  const now = Date.now();
  insertMessage({ id: nextId('m'), chatId, sender, type: 'text', text: trimmed, createdAt: now });
  touchChat(chatId, trimmed, now);
  return buildStateBlob();
}

function sendImageMessage({ chatId, uri, sender = 'user' }) {
  ensureChat(chatId, chatId);
  const now = Date.now();
  insertMessage({ id: nextId('m'), chatId, sender, type: 'image', imageUri: uri, createdAt: now });
  touchChat(chatId, 'Sent a photo', now);
  return buildStateBlob();
}

function confirmPayment({ orderId }) {
  const order = getOrder(orderId);
  if (!order) return buildStateBlob();
  const total = orderTotal(order);
  const now = Date.now();

  db.prepare(
    "UPDATE orders SET payment_status = 'secured', escrow_status = 'held', status = 'payment_secured', secured_at = ? WHERE id = ?"
  ).run(now, orderId);

  insertMessage({
    id: nextId('m'),
    chatId: order.chatId,
    sender: 'merchant',
    type: 'system',
    text: `Payment secured · ${formatMoney(total)} held in escrow`,
    createdAt: now,
  });

  setMeta('availableBalance', (Number(getMeta('availableBalance', '0')) - total).toFixed(2));
  setMeta('escrowBalance', (Number(getMeta('escrowBalance', '0')) + total).toFixed(2));
  touchChat(order.chatId, `Payment secured — ${formatMoney(total)} in escrow`, now, false);

  return buildStateBlob();
}

function advanceOrderStatus(orderId, nextStatus, chatText, extraColumn) {
  const order = getOrder(orderId);
  if (!order) return buildStateBlob();
  const now = Date.now();

  if (extraColumn) {
    db.prepare(`UPDATE orders SET status = ?, ${extraColumn} = ? WHERE id = ?`).run(nextStatus, now, orderId);
  } else {
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(nextStatus, orderId);
  }

  insertMessage({ id: nextId('m'), chatId: order.chatId, sender: 'merchant', type: 'system', text: chatText, createdAt: now });
  touchChat(order.chatId, chatText, now);
  return buildStateBlob();
}

function merchantAcceptOrder({ orderId }) {
  return advanceOrderStatus(orderId, 'order_accepted', 'Order accepted — we’ll get started shortly.', 'accepted_at');
}

function merchantStartPreparing({ orderId }) {
  return advanceOrderStatus(orderId, 'in_progress', 'Your order is now in progress.');
}

function merchantMarkReady({ orderId }) {
  const order = getOrder(orderId);
  if (!order) return buildStateBlob();
  const now = Date.now();

  db.prepare("UPDATE orders SET status = 'ready', ready_at = ? WHERE id = ?").run(now, orderId);
  insertMessage({
    id: nextId('m'),
    chatId: order.chatId,
    sender: 'merchant',
    type: 'order_update',
    text: 'Your order is ready 🎉',
    orderId,
    createdAt: now,
  });
  touchChat(order.chatId, 'Your order is ready 🎉', now);

  return buildStateBlob();
}

function confirmOrderReceived({ orderId }) {
  const order = getOrder(orderId);
  if (!order || order.status !== 'ready') return buildStateBlob();
  const total = orderTotal(order);
  const merchant = getMerchant(order.merchantId);
  const now = Date.now();

  db.prepare(
    "UPDATE orders SET status = 'completed', escrow_status = 'released', payment_status = 'released', completed_at = ? WHERE id = ?"
  ).run(now, orderId);

  insertMessage({ id: nextId('m'), chatId: order.chatId, sender: 'user', type: 'text', text: 'Order received, thank you!', createdAt: now });
  insertMessage({
    id: nextId('m'),
    chatId: order.chatId,
    sender: 'merchant',
    type: 'text',
    text: 'So glad you loved it! See you next time.',
    createdAt: now + 1,
  });
  insertMessage({
    id: nextId('m'),
    chatId: order.chatId,
    sender: 'merchant',
    type: 'system',
    text: `Escrow released to ${merchant ? merchant.name : 'the merchant'}`,
    createdAt: now + 2,
  });

  setMeta('escrowBalance', Math.max(0, Number(getMeta('escrowBalance', '0')) - total).toFixed(2));
  touchChat(order.chatId, 'Escrow released, thanks again!', now);

  return buildStateBlob();
}

function createInvoice({ merchantId, item, delivery, note }) {
  const now = Date.now();
  const orderId = nextId('order');
  ensureChat(merchantId, merchantId);

  db.prepare(
    `INSERT INTO orders (id, code, merchant_id, chat_id, delivery, note, payment_status, escrow_status, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'unpaid', 'none', 'awaiting_payment', ?)`
  ).run(orderId, orderCode(), merchantId, merchantId, delivery, note && note.trim() ? note.trim() : null, now);
  db.prepare('INSERT INTO order_items (order_id, name, qty, price) VALUES (?, ?, ?, ?)').run(orderId, item.name, item.qty, item.price);

  insertMessage({ id: nextId('m'), chatId: merchantId, sender: 'merchant', type: 'invoice', invoiceId: orderId, createdAt: now });

  const total = orderTotalFromItems([item], delivery);
  touchChat(merchantId, `Sent you an invoice — ${formatMoney(total)}`, now, true);

  return buildStateBlob();
}

// The demo "bot": greets, shows a menu, and turns a recognized product into a
// real invoice — same logic that lived in AppState.tsx's simulateMerchantAutoReply.
function simulateMerchantAutoReply({ merchantId, userText }) {
  const merchant = getMerchant(merchantId);
  if (!merchant) return buildStateBlob();

  const chatId = merchantId;
  ensureChat(chatId, merchantId);
  const now = Date.now();
  const lower = userText.toLowerCase();
  const matched = merchant.products.find((p) => lower.includes(p.name.toLowerCase()));

  if (matched) {
    const orderId = nextId('order');
    db.prepare(
      `INSERT INTO orders (id, code, merchant_id, chat_id, delivery, payment_status, escrow_status, status, created_at)
       VALUES (?, ?, ?, ?, 0, 'unpaid', 'none', 'awaiting_payment', ?)`
    ).run(orderId, orderCode(), merchantId, chatId, now);
    db.prepare('INSERT INTO order_items (order_id, name, qty, price) VALUES (?, ?, 1, ?)').run(orderId, matched.name, matched.price);

    const total = orderTotalFromItems([{ name: matched.name, qty: 1, price: matched.price }], 0);
    insertMessage({
      id: nextId('m'),
      chatId,
      sender: 'merchant',
      type: 'text',
      text: `Great choice! A ${matched.name} is ${formatMoney(total)} — sending you an invoice now.`,
      createdAt: now,
    });
    insertMessage({ id: nextId('m'), chatId, sender: 'merchant', type: 'invoice', invoiceId: orderId, createdAt: now + 1 });
    touchChat(chatId, `Sent you an invoice — ${formatMoney(total)}`, now + 1, true);
    return buildStateBlob();
  }

  const hasShownMenu = db.prepare("SELECT 1 FROM messages WHERE chat_id = ? AND type = 'menu' LIMIT 1").get(chatId);
  const ackText = hasShownMenu
    ? "Sure! Here's our menu again — tap what you'd like:"
    : `Hi! Thanks for reaching out to ${merchant.name} 👋 Here's what we offer:`;

  insertMessage({ id: nextId('m'), chatId, sender: 'merchant', type: 'text', text: ackText, createdAt: now });
  insertMessage({ id: nextId('m'), chatId, sender: 'merchant', type: 'menu', createdAt: now + 1 });
  touchChat(chatId, hasShownMenu ? 'Sent the menu again' : 'Sent you the menu', now + 1);

  return buildStateBlob();
}

function toggleSavedMerchant({ merchantId }) {
  const existing = db.prepare('SELECT 1 FROM saved_merchants WHERE merchant_id = ?').get(merchantId);
  if (existing) {
    db.prepare('DELETE FROM saved_merchants WHERE merchant_id = ?').run(merchantId);
  } else {
    db.prepare('INSERT INTO saved_merchants (merchant_id) VALUES (?)').run(merchantId);
  }
  return buildStateBlob();
}

module.exports = {
  buildStateBlob,
  completeOnboarding,
  sendTextMessage,
  sendImageMessage,
  confirmPayment,
  merchantAcceptOrder,
  merchantStartPreparing,
  merchantMarkReady,
  confirmOrderReceived,
  createInvoice,
  simulateMerchantAutoReply,
  toggleSavedMerchant,
};
