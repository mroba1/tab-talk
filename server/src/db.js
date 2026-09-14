'use strict';

const { Pool, types } = require('pg');

// BIGINT columns (our millisecond timestamps) come back as strings by
// default, to avoid precision loss on huge values. Ours are well within
// Number.MAX_SAFE_INTEGER, so parse them straight back to numbers — the
// app code (and its TypeScript types) expect plain numbers throughout.
types.setTypeParser(20, (val) => parseInt(val, 10));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required — e.g. your Neon connection string. Set it in server/.env for local dev.');
}

const pool = new Pool({
  connectionString,
  // Neon (and most hosted Postgres) terminate TLS with a cert this app
  // doesn't otherwise need to validate — standard for this class of host.
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
});

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL,
      last_message TEXT NOT NULL DEFAULT '',
      last_message_at BIGINT NOT NULL,
      has_pending_invoice BOOLEAN NOT NULL DEFAULT FALSE
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
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      merchant_id TEXT NOT NULL,
      chat_id TEXT NOT NULL,
      delivery DOUBLE PRECISION NOT NULL DEFAULT 0,
      note TEXT,
      payment_status TEXT NOT NULL,
      escrow_status TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      secured_at BIGINT,
      accepted_at BIGINT,
      ready_at BIGINT,
      completed_at BIGINT
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id TEXT NOT NULL,
      name TEXT NOT NULL,
      qty INTEGER NOT NULL,
      price DOUBLE PRECISION NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      merchant_id TEXT,
      label TEXT NOT NULL,
      sub TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      direction TEXT NOT NULL,
      date BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saved_merchants (
      merchant_id TEXT PRIMARY KEY
    );

    CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  `);
}

module.exports = { pool, initSchema };
