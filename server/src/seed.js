'use strict';

const { pool } = require('./db');

function mockPhoto(seed, width, height) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

// Ported from src/data/seed.ts — same conversations, same starting order
// state, so the demo behaves identically to the original local-only version.
// Runs once: if the chats table already has rows, seeding is skipped.
async function seedIfEmpty() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM chats');
  if (rows[0].count > 0) return;

  const now = Date.now();
  const minutesAgo = (m) => now - m * 60 * 1000;
  const hoursAgo = (h) => now - h * 60 * 60 * 1000;
  const daysAgo = (d) => now - d * 24 * 60 * 60 * 1000;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertOrder = (id, code, merchantId, chatId, delivery, note, paymentStatus, escrowStatus, status, createdAt, securedAt, acceptedAt, readyAt, completedAt) =>
      client.query(
        `INSERT INTO orders (id, code, merchant_id, chat_id, delivery, note, payment_status, escrow_status, status, created_at, secured_at, accepted_at, ready_at, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [id, code, merchantId, chatId, delivery, note, paymentStatus, escrowStatus, status, createdAt, securedAt, acceptedAt, readyAt, completedAt]
      );
    const insertOrderItem = (orderId, name, qty, price) =>
      client.query('INSERT INTO order_items (order_id, name, qty, price) VALUES ($1, $2, $3, $4)', [orderId, name, qty, price]);
    const insertChat = (id, merchantId, lastMessage, lastMessageAt, hasPendingInvoice) =>
      client.query(
        'INSERT INTO chats (id, merchant_id, last_message, last_message_at, has_pending_invoice) VALUES ($1, $2, $3, $4, $5)',
        [id, merchantId, lastMessage, lastMessageAt, hasPendingInvoice]
      );
    const insertMessage = (id, chatId, sender, type, text, imageUri, invoiceId, orderId, createdAt) =>
      client.query(
        `INSERT INTO messages (id, chat_id, sender, type, text, image_uri, invoice_id, order_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, chatId, sender, type, text, imageUri, invoiceId, orderId, createdAt]
      );
    const insertTransaction = (id, merchantId, label, sub, amount, direction, date) =>
      client.query(
        'INSERT INTO transactions (id, merchant_id, label, sub, amount, direction, date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, merchantId, label, sub, amount, direction, date]
      );
    const setMeta = (key, value) =>
      client.query('INSERT INTO meta (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [key, value]);

    // Order 1 — Sweet Crumb Bakery, the live interactive demo (still unpaid).
    await insertOrder('order-1', 'TT-10482', 'sweet-crumb', 'sweet-crumb', 0, null, 'unpaid', 'none', 'awaiting_payment', minutesAgo(30), null, null, null, null);
    await insertOrderItem('order-1', 'Custom Cake', 1, 40);

    // Order 2 — Fix-It Repairs, pre-completed end to end for a no-interaction demo.
    await insertOrder('order-2', 'TT-10399', 'fix-it', 'fix-it', 0, null, 'released', 'released', 'completed', daysAgo(1), hoursAgo(19), null, null, hoursAgo(3));
    await insertOrderItem('order-2', 'Leak Repair', 1, 65);

    await insertChat('sweet-crumb', 'sweet-crumb', 'Sent you an invoice — $40.00', minutesAgo(2), true);
    await insertChat('fix-it', 'fix-it', 'Escrow released, thanks again!', hoursAgo(3), false);
    await insertChat('luz-tailoring', 'luz-tailoring', 'Thank you, see you Thursday!', daysAgo(2), false);

    const messages = [
      ['m1', 'sweet-crumb', 'user', 'text', 'Hi! Can you make this cake for Friday?', null, null, null, minutesAgo(12)],
      ['m2', 'sweet-crumb', 'user', 'image', null, mockPhoto('cake-reference-photo', 400, 300), null, null, minutesAgo(11)],
      ['m3', 'sweet-crumb', 'merchant', 'text', 'Absolutely — we can make this for $40. Ready by Friday afternoon.', null, null, null, minutesAgo(6)],
      ['m4', 'sweet-crumb', 'merchant', 'invoice', null, null, 'order-1', null, minutesAgo(2)],

      ['m5', 'fix-it', 'user', 'text', 'Hi, my kitchen sink is leaking under the cabinet, could someone take a look this week?', null, null, null, daysAgo(1) - 2 * 60 * 60 * 1000],
      ['m6', 'fix-it', 'merchant', 'text', "Sure thing! We can swing by Thursday morning. It's usually a quick fix.", null, null, null, daysAgo(1) - 1.5 * 60 * 60 * 1000],
      ['m7', 'fix-it', 'merchant', 'text', 'Your quote is ready — $65 for the leak repair, parts included.', null, null, null, daysAgo(1)],
      ['m7b', 'fix-it', 'merchant', 'invoice', null, null, 'order-2', null, daysAgo(1) + 5 * 60 * 1000],
      ['m7c', 'fix-it', 'user', 'text', 'Sounds good, paying now.', null, null, null, hoursAgo(19.2)],
      ['m7d', 'fix-it', 'merchant', 'system', 'Payment secured — $65.00 held in escrow', null, null, null, hoursAgo(19)],
      ['m7e', 'fix-it', 'merchant', 'text', 'All fixed! Let us know if you notice anything else.', null, null, null, hoursAgo(4)],
      ['m7f', 'fix-it', 'user', 'text', 'Works perfectly, thank you so much!', null, null, null, hoursAgo(3.2)],
      ['m7g', 'fix-it', 'merchant', 'text', 'Glad we could help — thanks for choosing Fix-It Repairs!', null, null, null, hoursAgo(3.1)],
      ['m7h', 'fix-it', 'merchant', 'system', 'Escrow released to Fix-It Repairs', null, null, null, hoursAgo(3)],

      ['m8', 'luz-tailoring', 'user', 'text', 'Hi, do you have time to hem a pair of trousers this week?', null, null, null, daysAgo(3)],
      ['m9', 'luz-tailoring', 'merchant', 'text', 'Yes! Bring them by anytime before Thursday and I can have them ready same day.', null, null, null, daysAgo(2.5)],
      ['m10', 'luz-tailoring', 'merchant', 'text', 'Thank you, see you Thursday!', null, null, null, daysAgo(2)],
    ];
    for (const m of messages) await insertMessage(...m);

    await insertTransaction('t1', 'fix-it', 'Fix-It Repairs', 'Quote deposit · Aug 12', 20, 'debit', daysAgo(5));
    await insertTransaction('t2', 'luz-tailoring', 'Refund · Luz Tailoring', 'Aug 9', 12, 'credit', daysAgo(8));

    await setMeta('onboardingComplete', 'false');
    await setMeta('availableBalance', '128.4');
    await setMeta('escrowBalance', '0');

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { seedIfEmpty, mockPhoto };
