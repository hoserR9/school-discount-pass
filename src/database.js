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
    auth_token TEXT NOT NULL,
    issued_at TEXT NOT NULL DEFAULT (datetime('now')),
    holder_name TEXT,
    valid_from TEXT NOT NULL DEFAULT '2026-07-31',
    valid_thru TEXT NOT NULL DEFAULT '2027-07-31',
    is_active INTEGER NOT NULL DEFAULT 1,
    last_updated TEXT NOT NULL DEFAULT (datetime('now'))
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

  CREATE TABLE IF NOT EXISTS registrations (
    device_id TEXT NOT NULL,
    push_token TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    pass_type_id TEXT NOT NULL,
    registered_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (device_id, serial_number)
  );

  CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    field_key TEXT,
    field_value TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    active_from TEXT NOT NULL DEFAULT (datetime('now')),
    active_until TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_scans_card_id ON scans(card_id);
  CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans(scanned_at);
  CREATE INDEX IF NOT EXISTS idx_registrations_serial ON registrations(serial_number);
  CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);
`);

// ── Card statements ──
const insertCard = db.prepare(`
  INSERT INTO cards (card_id, serial_number, auth_token, holder_name, valid_from, valid_thru)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const getCard = db.prepare(`SELECT * FROM cards WHERE card_id = ?`);

const getCardBySerial = db.prepare(`SELECT * FROM cards WHERE serial_number = ?`);

const getCardByAuthToken = db.prepare(`SELECT * FROM cards WHERE auth_token = ?`);

const touchCardUpdated = db.prepare(`
  UPDATE cards SET last_updated = datetime('now') WHERE serial_number = ?
`);

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

// ── Registration statements (Apple Wallet web service) ──
const registerDevice = db.prepare(`
  INSERT OR REPLACE INTO registrations (device_id, push_token, serial_number, pass_type_id)
  VALUES (?, ?, ?, ?)
`);

const unregisterDevice = db.prepare(`
  DELETE FROM registrations WHERE device_id = ? AND serial_number = ? AND pass_type_id = ?
`);

const getDevicesForSerial = db.prepare(`
  SELECT * FROM registrations WHERE serial_number = ?
`);

const getSerialsForDevice = db.prepare(`
  SELECT serial_number FROM registrations WHERE device_id = ? AND pass_type_id = ?
`);

const getAllPushTokens = db.prepare(`
  SELECT DISTINCT push_token FROM registrations
`);

const getRegistrationCount = db.prepare(`
  SELECT COUNT(DISTINCT device_id) as count FROM registrations
`);

// ── Promotion statements ──
const createPromotion = db.prepare(`
  INSERT INTO promotions (title, message, field_key, field_value, active_from, active_until)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const getActivePromotions = db.prepare(`
  SELECT * FROM promotions
  WHERE is_active = 1
    AND datetime(active_from) <= datetime('now')
    AND (active_until IS NULL OR datetime(active_until) >= datetime('now'))
  ORDER BY created_at DESC
`);

const getAllPromotions = db.prepare(`
  SELECT * FROM promotions ORDER BY created_at DESC
`);

const deactivatePromotion = db.prepare(`
  UPDATE promotions SET is_active = 0 WHERE id = ?
`);

module.exports = {
  db,
  // Cards
  insertCard,
  getCard,
  getCardBySerial,
  getCardByAuthToken,
  touchCardUpdated,
  logScan,
  getScansForCard,
  getAllCards,
  getUsageStats,
  deactivateCard,
  // Registrations
  registerDevice,
  unregisterDevice,
  getDevicesForSerial,
  getSerialsForDevice,
  getAllPushTokens,
  getRegistrationCount,
  // Promotions
  createPromotion,
  getActivePromotions,
  getAllPromotions,
  deactivatePromotion,
};
