'use strict';

const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

// On Railway (or any host with a persistent volume), set DB_PATH to a file
// inside that volume's mount — e.g. /data/data.sqlite — so the database
// survives redeploys. Defaults to a local file for plain `npm start` dev.
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data.sqlite');
const db = new DatabaseSync(DB_PATH);
console.log(`TabTalk backend using database at ${DB_PATH}`);

db.exec(`
  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    last_message TEXT NOT NULL DEFAULT '',
    last_message_at INTEGER NOT NULL,
    has_pending_invoice INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    type TEXT NOT NULL,
    text TEXT,
    image_uri TEXT,
    invoice_id TEXT,
    order_id TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    merchant_id TEXT NOT NULL,
    chat_id TEXT NOT NULL,
    delivery REAL NOT NULL DEFAULT 0,
    note TEXT,
    payment_status TEXT NOT NULL,
    escrow_status TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    secured_at INTEGER,
    accepted_at INTEGER,
    ready_at INTEGER,
    completed_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    name TEXT NOT NULL,
    qty INTEGER NOT NULL,
    price REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    merchant_id TEXT,
    label TEXT NOT NULL,
    sub TEXT NOT NULL,
    amount REAL NOT NULL,
    direction TEXT NOT NULL,
    date INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS saved_merchants (
    merchant_id TEXT PRIMARY KEY
  );

  CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
`);

module.exports = { db };
