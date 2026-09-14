'use strict';

const { pool } = require('./db');
const { getMerchant } = require('./merchants');
const { formatMoney, orderTotalFromItems, nextId, orderCode } = require('./helpers');

async function getMeta(key, fallback) {
  const { rows } = await pool.query('SELECT value FROM meta WHERE key = $1', [key]);
  return rows[0] ? rows[0].value : fallback;
}

async function setMeta(key, value) {
  await pool.query('INSERT INTO meta (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [
    key,
    String(value),
  ]);
}

function rowToChat(row) {
  return {
    id: row.id,
    merchantId: row.merchant_id,
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at,
    hasPendingInvoice: row.has_pending_invoice,
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

// Assembles the exact PersistedState/AppSnapshot shape the app expects — the
// client just does setState(response) after every call, same as it used to
// with the local AsyncStorage blob.
async function buildStateBlob() {
  const [chatsRes, messagesRes, orderRes, itemsRes, transactionsRes, savedRes, availableBalance, escrowBalance, onboardingComplete] =
    await Promise.all([
      pool.query('SELECT * FROM chats'),
      pool.query('SELECT * FROM messages ORDER BY created_at ASC'),
      pool.query('SELECT * FROM orders'),
      pool.query('SELECT * FROM order_items'),
      pool.query('SELECT * FROM transactions ORDER BY date DESC'),
      pool.query('SELECT merchant_id FROM saved_merchants'),
      getMeta('availableBalance', '0'),
      getMeta('escrowBalance', '0'),
      getMeta('onboardingComplete', 'false'),
    ]);

  const itemsByOrder = new Map();
  for (const item of itemsRes.rows) {
    if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
    itemsByOrder.get(item.order_id).push(item);
  }

  return {
    chats: chatsRes.rows.map(rowToChat),
    messages: messagesRes.rows.map(rowToMessage),
    orders: orderRes.rows.map((row) => rowToOrder(row, itemsByOrder.get(row.id) || [])),
    transactions: transactionsRes.rows.map(rowToTransaction),
    savedMerchantIds: savedRes.rows.map((r) => r.merchant_id),
    availableBalance: Number(availableBalance),
    escrowBalance: Number(escrowBalance),
    onboardingComplete: onboardingComplete === 'true',
  };
}

async function ensureChat(chatId, merchantId) {
  const { rows } = await pool.query('SELECT id FROM chats WHERE id = $1', [chatId]);
  if (rows.length > 0) return;
  await pool.query(
    'INSERT INTO chats (id, merchant_id, last_message, last_message_at, has_pending_invoice) VALUES ($1, $2, $3, $4, FALSE)',
    [chatId, merchantId, '', Date.now()]
  );
}

async function touchChat(chatId, lastMessage, lastMessageAt, hasPendingInvoice) {
  if (hasPendingInvoice === undefined) {
    await pool.query('UPDATE chats SET last_message = $1, last_message_at = $2 WHERE id = $3', [lastMessage, lastMessageAt, chatId]);
  } else {
    await pool.query('UPDATE chats SET last_message = $1, last_message_at = $2, has_pending_invoice = $3 WHERE id = $4', [
      lastMessage,
      lastMessageAt,
      hasPendingInvoice,
      chatId,
    ]);
  }
}

async function insertMessage({ id, chatId, sender, type, text, imageUri, invoiceId, orderId, createdAt }) {
  await pool.query(
    `INSERT INTO messages (id, chat_id, sender, type, text, image_uri, invoice_id, order_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, chatId, sender, type, text ?? null, imageUri ?? null, invoiceId ?? null, orderId ?? null, createdAt]
  );
}

async function getOrder(orderId) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (!rows[0]) return undefined;
  const items = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
  return rowToOrder(rows[0], items.rows);
}

function orderTotal(order) {
  return orderTotalFromItems(order.items, order.delivery);
}

// ---- Actions — each one mirrors an AppState.tsx callback exactly ----

async function completeOnboarding() {
  await setMeta('onboardingComplete', 'true');
  return buildStateBlob();
}

async function sendTextMessage({ chatId, text, sender = 'user' }) {
  const trimmed = text.trim();
  if (!trimmed) return buildStateBlob();
  await ensureChat(chatId, chatId);
  const now = Date.now();
  await insertMessage({ id: nextId('m'), chatId, sender, type: 'text', text: trimmed, createdAt: now });
  await touchChat(chatId, trimmed, now);
  return buildStateBlob();
}

async function sendImageMessage({ chatId, uri, sender = 'user' }) {
  await ensureChat(chatId, chatId);
  const now = Date.now();
  await insertMessage({ id: nextId('m'), chatId, sender, type: 'image', imageUri: uri, createdAt: now });
  await touchChat(chatId, 'Sent a photo', now);
  return buildStateBlob();
}

async function confirmPayment({ orderId }) {
  const order = await getOrder(orderId);
  if (!order) return buildStateBlob();
  const total = orderTotal(order);
  const now = Date.now();

  await pool.query(
    "UPDATE orders SET payment_status = 'secured', escrow_status = 'held', status = 'payment_secured', secured_at = $1 WHERE id = $2",
    [now, orderId]
  );

  await insertMessage({
    id: nextId('m'),
    chatId: order.chatId,
    sender: 'merchant',
    type: 'system',
    text: `Payment secured · ${formatMoney(total)} held in escrow`,
    createdAt: now,
  });

  const available = Number(await getMeta('availableBalance', '0'));
  const escrow = Number(await getMeta('escrowBalance', '0'));
  await setMeta('availableBalance', (available - total).toFixed(2));
  await setMeta('escrowBalance', (escrow + total).toFixed(2));
  await touchChat(order.chatId, `Payment secured — ${formatMoney(total)} in escrow`, now, false);

  return buildStateBlob();
}

async function advanceOrderStatus(orderId, nextStatus, chatText, extraColumn) {
  const order = await getOrder(orderId);
  if (!order) return buildStateBlob();
  const now = Date.now();

  if (extraColumn) {
    await pool.query(`UPDATE orders SET status = $1, ${extraColumn} = $2 WHERE id = $3`, [nextStatus, now, orderId]);
  } else {
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [nextStatus, orderId]);
  }

  await insertMessage({ id: nextId('m'), chatId: order.chatId, sender: 'merchant', type: 'system', text: chatText, createdAt: now });
  await touchChat(order.chatId, chatText, now);
  return buildStateBlob();
}

async function merchantAcceptOrder({ orderId }) {
  return advanceOrderStatus(orderId, 'order_accepted', 'Order accepted — we’ll get started shortly.', 'accepted_at');
}

async function merchantStartPreparing({ orderId }) {
  return advanceOrderStatus(orderId, 'in_progress', 'Your order is now in progress.');
}

async function merchantMarkReady({ orderId }) {
  const order = await getOrder(orderId);
  if (!order) return buildStateBlob();
  const now = Date.now();

  await pool.query("UPDATE orders SET status = 'ready', ready_at = $1 WHERE id = $2", [now, orderId]);
  await insertMessage({
    id: nextId('m'),
    chatId: order.chatId,
    sender: 'merchant',
    type: 'order_update',
    text: 'Your order is ready 🎉',
    orderId,
    createdAt: now,
  });
  await touchChat(order.chatId, 'Your order is ready 🎉', now);

  return buildStateBlob();
}

async function confirmOrderReceived({ orderId }) {
  const order = await getOrder(orderId);
  if (!order || order.status !== 'ready') return buildStateBlob();
  const total = orderTotal(order);
  const merchant = getMerchant(order.merchantId);
  const now = Date.now();

  await pool.query(
    "UPDATE orders SET status = 'completed', escrow_status = 'released', payment_status = 'released', completed_at = $1 WHERE id = $2",
    [now, orderId]
  );

  await insertMessage({ id: nextId('m'), chatId: order.chatId, sender: 'user', type: 'text', text: 'Order received, thank you!', createdAt: now });
  await insertMessage({
    id: nextId('m'),
    chatId: order.chatId,
    sender: 'merchant',
    type: 'text',
    text: 'So glad you loved it! See you next time.',
    createdAt: now + 1,
  });
  await insertMessage({
    id: nextId('m'),
    chatId: order.chatId,
    sender: 'merchant',
    type: 'system',
    text: `Escrow released to ${merchant ? merchant.name : 'the merchant'}`,
    createdAt: now + 2,
  });

  const escrow = Number(await getMeta('escrowBalance', '0'));
  await setMeta('escrowBalance', Math.max(0, escrow - total).toFixed(2));
  await touchChat(order.chatId, 'Escrow released, thanks again!', now);

  return buildStateBlob();
}

async function createInvoice({ merchantId, item, delivery, note }) {
  const now = Date.now();
  const orderId = nextId('order');
  await ensureChat(merchantId, merchantId);

  await pool.query(
    `INSERT INTO orders (id, code, merchant_id, chat_id, delivery, note, payment_status, escrow_status, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'unpaid', 'none', 'awaiting_payment', $7)`,
    [orderId, orderCode(), merchantId, merchantId, delivery, note && note.trim() ? note.trim() : null, now]
  );
  await pool.query('INSERT INTO order_items (order_id, name, qty, price) VALUES ($1, $2, $3, $4)', [
    orderId,
    item.name,
    item.qty,
    item.price,
  ]);

  await insertMessage({ id: nextId('m'), chatId: merchantId, sender: 'merchant', type: 'invoice', invoiceId: orderId, createdAt: now });

  const total = orderTotalFromItems([item], delivery);
  await touchChat(merchantId, `Sent you an invoice — ${formatMoney(total)}`, now, true);

  return buildStateBlob();
}

// The demo "bot": greets, shows a menu, and turns a recognized product into a
// real invoice — same logic that lived in AppState.tsx's simulateMerchantAutoReply.
async function simulateMerchantAutoReply({ merchantId, userText }) {
  const merchant = getMerchant(merchantId);
  if (!merchant) return buildStateBlob();

  const chatId = merchantId;
  await ensureChat(chatId, merchantId);
  const now = Date.now();
  const lower = userText.toLowerCase();
  const matched = merchant.products.find((p) => lower.includes(p.name.toLowerCase()));

  if (matched) {
    const orderId = nextId('order');
    await pool.query(
      `INSERT INTO orders (id, code, merchant_id, chat_id, delivery, payment_status, escrow_status, status, created_at)
       VALUES ($1, $2, $3, $4, 0, 'unpaid', 'none', 'awaiting_payment', $5)`,
      [orderId, orderCode(), merchantId, chatId, now]
    );
    await pool.query('INSERT INTO order_items (order_id, name, qty, price) VALUES ($1, $2, 1, $3)', [orderId, matched.name, matched.price]);

    const total = orderTotalFromItems([{ name: matched.name, qty: 1, price: matched.price }], 0);
    await insertMessage({
      id: nextId('m'),
      chatId,
      sender: 'merchant',
      type: 'text',
      text: `Great choice! A ${matched.name} is ${formatMoney(total)} — sending you an invoice now.`,
      createdAt: now,
    });
    await insertMessage({ id: nextId('m'), chatId, sender: 'merchant', type: 'invoice', invoiceId: orderId, createdAt: now + 1 });
    await touchChat(chatId, `Sent you an invoice — ${formatMoney(total)}`, now + 1, true);
    return buildStateBlob();
  }

  const hasShownMenu = await pool.query("SELECT 1 FROM messages WHERE chat_id = $1 AND type = 'menu' LIMIT 1", [chatId]);
  const ackText = hasShownMenu.rows.length > 0
    ? "Sure! Here's our menu again — tap what you'd like:"
    : `Hi! Thanks for reaching out to ${merchant.name} 👋 Here's what we offer:`;

  await insertMessage({ id: nextId('m'), chatId, sender: 'merchant', type: 'text', text: ackText, createdAt: now });
  await insertMessage({ id: nextId('m'), chatId, sender: 'merchant', type: 'menu', createdAt: now + 1 });
  await touchChat(chatId, hasShownMenu.rows.length > 0 ? 'Sent the menu again' : 'Sent you the menu', now + 1);

  return buildStateBlob();
}

async function toggleSavedMerchant({ merchantId }) {
  const { rows } = await pool.query('SELECT 1 FROM saved_merchants WHERE merchant_id = $1', [merchantId]);
  if (rows.length > 0) {
    await pool.query('DELETE FROM saved_merchants WHERE merchant_id = $1', [merchantId]);
  } else {
    await pool.query('INSERT INTO saved_merchants (merchant_id) VALUES ($1)', [merchantId]);
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
