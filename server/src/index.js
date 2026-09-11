'use strict';

const express = require('express');
const { seedIfEmpty } = require('./seed');
const state = require('./state');

seedIfEmpty();

const app = express();
app.use(express.json());

// Simple request log — helpful while wiring the app up against this for the
// first time, cheap enough to leave on for a prototype backend.
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/state', (req, res) => {
  res.json(state.buildStateBlob());
});

app.post('/api/onboarding/complete', (req, res) => {
  res.json(state.completeOnboarding());
});

app.post('/api/messages/text', (req, res) => {
  const { chatId, text, sender } = req.body || {};
  if (!chatId || !text) return res.status(400).json({ error: 'chatId and text are required' });
  res.json(state.sendTextMessage({ chatId, text, sender }));
});

app.post('/api/messages/image', (req, res) => {
  const { chatId, uri, sender } = req.body || {};
  if (!chatId || !uri) return res.status(400).json({ error: 'chatId and uri are required' });
  res.json(state.sendImageMessage({ chatId, uri, sender }));
});

app.post('/api/payments/:orderId/confirm', (req, res) => {
  res.json(state.confirmPayment({ orderId: req.params.orderId }));
});

app.post('/api/orders/:orderId/accept', (req, res) => {
  res.json(state.merchantAcceptOrder({ orderId: req.params.orderId }));
});

app.post('/api/orders/:orderId/start-preparing', (req, res) => {
  res.json(state.merchantStartPreparing({ orderId: req.params.orderId }));
});

app.post('/api/orders/:orderId/mark-ready', (req, res) => {
  res.json(state.merchantMarkReady({ orderId: req.params.orderId }));
});

app.post('/api/orders/:orderId/confirm-received', (req, res) => {
  res.json(state.confirmOrderReceived({ orderId: req.params.orderId }));
});

app.post('/api/invoices', (req, res) => {
  const { merchantId, item, delivery, note } = req.body || {};
  if (!merchantId || !item || !item.name || typeof item.price !== 'number') {
    return res.status(400).json({ error: 'merchantId and a valid item are required' });
  }
  res.json(state.createInvoice({ merchantId, item, delivery: delivery || 0, note }));
});

app.post('/api/chat/:merchantId/auto-reply', (req, res) => {
  const { userText } = req.body || {};
  if (!userText) return res.status(400).json({ error: 'userText is required' });
  res.json(state.simulateMerchantAutoReply({ merchantId: req.params.merchantId, userText }));
});

app.post('/api/saved-merchants/:merchantId/toggle', (req, res) => {
  res.json(state.toggleSavedMerchant({ merchantId: req.params.merchantId }));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`TabTalk backend listening on http://0.0.0.0:${PORT}`);
});
