'use strict';

const express = require('express');
const { initSchema } = require('./db');
const { seedIfEmpty } = require('./seed');
const state = require('./state');

const app = express();
app.use(express.json());

// Simple request log — helpful while wiring the app up against this for the
// first time, cheap enough to leave on for a prototype backend.
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Every handler is async (real DB calls now, not synchronous local state) —
// this wrapper forwards rejections to Express's error handler instead of
// crashing the process or hanging the request.
const handle = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/state', handle(async (req, res) => {
  res.json(await state.buildStateBlob());
}));

app.post('/api/onboarding/complete', handle(async (req, res) => {
  res.json(await state.completeOnboarding());
}));

app.post('/api/messages/text', handle(async (req, res) => {
  const { chatId, text, sender } = req.body || {};
  if (!chatId || !text) return res.status(400).json({ error: 'chatId and text are required' });
  res.json(await state.sendTextMessage({ chatId, text, sender }));
}));

app.post('/api/messages/image', handle(async (req, res) => {
  const { chatId, uri, sender } = req.body || {};
  if (!chatId || !uri) return res.status(400).json({ error: 'chatId and uri are required' });
  res.json(await state.sendImageMessage({ chatId, uri, sender }));
}));

app.post('/api/payments/:orderId/confirm', handle(async (req, res) => {
  res.json(await state.confirmPayment({ orderId: req.params.orderId }));
}));

app.post('/api/orders/:orderId/accept', handle(async (req, res) => {
  res.json(await state.merchantAcceptOrder({ orderId: req.params.orderId }));
}));

app.post('/api/orders/:orderId/start-preparing', handle(async (req, res) => {
  res.json(await state.merchantStartPreparing({ orderId: req.params.orderId }));
}));

app.post('/api/orders/:orderId/mark-ready', handle(async (req, res) => {
  res.json(await state.merchantMarkReady({ orderId: req.params.orderId }));
}));

app.post('/api/orders/:orderId/confirm-received', handle(async (req, res) => {
  res.json(await state.confirmOrderReceived({ orderId: req.params.orderId }));
}));

app.post('/api/invoices', handle(async (req, res) => {
  const { merchantId, item, delivery, note } = req.body || {};
  if (!merchantId || !item || !item.name || typeof item.price !== 'number') {
    return res.status(400).json({ error: 'merchantId and a valid item are required' });
  }
  res.json(await state.createInvoice({ merchantId, item, delivery: delivery || 0, note }));
}));

app.post('/api/chat/:merchantId/auto-reply', handle(async (req, res) => {
  const { userText } = req.body || {};
  if (!userText) return res.status(400).json({ error: 'userText is required' });
  res.json(await state.simulateMerchantAutoReply({ merchantId: req.params.merchantId, userText }));
}));

app.post('/api/saved-merchants/:merchantId/toggle', handle(async (req, res) => {
  res.json(await state.toggleSavedMerchant({ merchantId: req.params.merchantId }));
}));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

(async () => {
  await initSchema();
  await seedIfEmpty();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TabTalk backend listening on http://0.0.0.0:${PORT}`);
  });
})().catch((err) => {
  console.error('Failed to start TabTalk backend:', err);
  process.exit(1);
});
