'use strict';

const { db } = require('./db');

function mockPhoto(seed, width, height) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

// Ported from src/data/seed.ts — same conversations, same starting order
// state, so the demo behaves identically to the local-only version. Runs
// once: if the chats table already has rows, seeding is skipped entirely.
function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM chats').get();
  if (count > 0) return;

  const now = Date.now();
  const minutesAgo = (m) => now - m * 60 * 1000;
  const hoursAgo = (h) => now - h * 60 * 60 * 1000;
  const daysAgo = (d) => now - d * 24 * 60 * 60 * 1000;

  const insertChat = db.prepare(
    'INSERT INTO chats (id, merchant_id, last_message, last_message_at, has_pending_invoice) VALUES (?, ?, ?, ?, ?)'
  );
  const insertMessage = db.prepare(
    `INSERT INTO messages (id, chat_id, sender, type, text, image_uri, invoice_id, order_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertOrder = db.prepare(
    `INSERT INTO orders (id, code, merchant_id, chat_id, delivery, note, payment_status, escrow_status, status, created_at, secured_at, accepted_at, ready_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, name, qty, price) VALUES (?, ?, ?, ?)');
  const insertTransaction = db.prepare(
    'INSERT INTO transactions (id, merchant_id, label, sub, amount, direction, date) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const setMeta = db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)');

  const tx = db.exec.bind(db);
  tx('BEGIN');
  try {
    // Order 1 — Sweet Crumb Bakery, the live interactive demo (still unpaid).
    insertOrder.run('order-1', 'TT-10482', 'sweet-crumb', 'sweet-crumb', 0, null, 'unpaid', 'none', 'awaiting_payment', minutesAgo(30), null, null, null, null);
    insertOrderItem.run('order-1', 'Custom Cake', 1, 40);

    // Order 2 — Fix-It Repairs, pre-completed end to end for a no-interaction demo.
    insertOrder.run('order-2', 'TT-10399', 'fix-it', 'fix-it', 0, null, 'released', 'released', 'completed', daysAgo(1), hoursAgo(19), null, null, hoursAgo(3));
    insertOrderItem.run('order-2', 'Leak Repair', 1, 65);

    insertChat.run('sweet-crumb', 'sweet-crumb', 'Sent you an invoice — $40.00', minutesAgo(2), 1);
    insertChat.run('fix-it', 'fix-it', 'Escrow released, thanks again!', hoursAgo(3), 0);
    insertChat.run('luz-tailoring', 'luz-tailoring', 'Thank you, see you Thursday!', daysAgo(2), 0);

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
    for (const m of messages) insertMessage.run(...m);

    insertTransaction.run('t1', 'fix-it', 'Fix-It Repairs', 'Quote deposit · Aug 12', 20, 'debit', daysAgo(5));
    insertTransaction.run('t2', 'luz-tailoring', 'Refund · Luz Tailoring', 'Aug 9', 12, 'credit', daysAgo(8));

    setMeta.run('onboardingComplete', 'false');
    setMeta.run('availableBalance', '128.4');
    setMeta.run('escrowBalance', '0');

    tx('COMMIT');
  } catch (err) {
    tx('ROLLBACK');
    throw err;
  }
}

module.exports = { seedIfEmpty, mockPhoto };
