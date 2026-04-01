const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.resolve(__dirname, "../data/cards.db");

// Ensure data directory exists
const fs = require("fs");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent reads
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS cards (
    card_id TEXT PRIMARY KEY,
    serial_number TEXT NOT NULL,
    issued_at TEXT NOT NULL DEFAULT (datetime('now')),
    holder_name TEXT,
    valid_from TEXT NOT NULL DEFAULT '2026-07-31',
    valid_thru TEXT NOT NULL DEFAULT '2027-07-31',
    is_active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT NOT NULL,
    scanned_at TEXT NOT NULL DEFAULT (datetime('now')),
    business_name TEXT,
    ip_address TEXT,
    user_agent TEXT,
    FOREIGN KEY (card_id) REFERENCES cards(card_id)
  );

  CREATE INDEX IF NOT EXISTS idx_scans_card_id ON scans(card_id);
  CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans(scanned_at);
`);

// Prepared statements
const insertCard = db.prepare(`
  INSERT INTO cards (card_id, serial_number, holder_name, valid_from, valid_thru)
  VALUES (?, ?, ?, ?, ?)
`);

const getCard = db.prepare(`SELECT * FROM cards WHERE card_id = ?`);

const logScan = db.prepare(`
  INSERT INTO scans (card_id, business_name, ip_address, user_agent)
  VALUES (?, ?, ?, ?)
`);

const getScansForCard = db.prepare(`
  SELECT * FROM scans WHERE card_id = ? ORDER BY scanned_at DESC
`);

const getAllCards = db.prepare(`
  SELECT c.*, COUNT(s.id) as scan_count, MAX(s.scanned_at) as last_scanned
  FROM cards c
  LEFT JOIN scans s ON c.card_id = s.card_id
  GROUP BY c.card_id
  ORDER BY c.issued_at DESC
`);

const getUsageStats = db.prepare(`
  SELECT
    s.business_name,
    COUNT(*) as total_scans,
    COUNT(DISTINCT s.card_id) as unique_cards,
    MAX(s.scanned_at) as last_scan
  FROM scans s
  GROUP BY s.business_name
  ORDER BY total_scans DESC
`);

const deactivateCard = db.prepare(`UPDATE cards SET is_active = 0 WHERE card_id = ?`);

module.exports = {
  db,
  insertCard,
  getCard,
  logScan,
  getScansForCard,
  getAllCards,
  getUsageStats,
  deactivateCard,
};
