// schema.mjs — esquema y utilidades para Cloudflare Workers + Durable Object (SQLite).
// Espejo de src/db.mjs, pero sin node:sqlite: aquí el motor es ctx.storage.sql
// (la base de datos SQLite que vive dentro del Durable Object, disponible en el plan gratuito).

import crypto from 'node:crypto';

export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS systems (
    id            INTEGER PRIMARY KEY,
    slug          TEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL,
    locale        TEXT NOT NULL DEFAULT '',
    currency_name TEXT NOT NULL,
    currency_sym  TEXT NOT NULL,
    signup_bonus  REAL NOT NULL DEFAULT 10,
    credit_limit  REAL NOT NULL DEFAULT 100,
    annual_fee    REAL NOT NULL DEFAULT 10,
    admin_points_per_tx REAL NOT NULL DEFAULT 1,
    contract_text TEXT NOT NULL DEFAULT '',
    created_at    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY,
    system_id     INTEGER NOT NULL,
    name          TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    phone         TEXT,
    password      TEXT NOT NULL,
    is_admin      INTEGER NOT NULL DEFAULT 0,
    balance       REAL NOT NULL DEFAULT 0,
    points        REAL NOT NULL DEFAULT 0,
    contract_hash TEXT,
    contract_name TEXT,
    contract_at   TEXT,
    created_at    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id         INTEGER PRIMARY KEY,
    system_id  INTEGER NOT NULL,
    from_user  INTEGER,
    to_user    INTEGER,
    amount     REAL NOT NULL,
    concept    TEXT,
    kind       TEXT NOT NULL DEFAULT 'pago',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS offers (
    id         INTEGER PRIMARY KEY,
    system_id  INTEGER NOT NULL,
    user_id    INTEGER NOT NULL,
    kind       TEXT NOT NULL DEFAULT 'ofrezco',
    text       TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id         INTEGER PRIMARY KEY,
    system_id  INTEGER NOT NULL,
    user_id    INTEGER NOT NULL,
    kind       TEXT NOT NULL DEFAULT 'limite_deuda',
    debt       REAL NOT NULL DEFAULT 0,
    limit_val  REAL NOT NULL DEFAULT 0,
    status     TEXT NOT NULL DEFAULT 'abierta',
    created_at TEXT NOT NULL,
    closed_at  TEXT
  );

  CREATE TABLE IF NOT EXISTS federation (
    id              INTEGER PRIMARY KEY,
    a_id            INTEGER NOT NULL,
    b_id            INTEGER NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pendiente',
    accept_currency INTEGER NOT NULL DEFAULT 0,
    see_offers      INTEGER NOT NULL DEFAULT 1,
    rate            REAL NOT NULL DEFAULT 1,
    created_by      INTEGER,
    created_at      TEXT NOT NULL,
    accepted_at     TEXT
  );

  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    val TEXT
  );
`;

export const INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_users_system ON users(system_id);
  CREATE INDEX IF NOT EXISTS idx_tx_system ON transactions(system_id);
  CREATE INDEX IF NOT EXISTS idx_offers_system ON offers(system_id);
  CREATE INDEX IF NOT EXISTS idx_alerts_system ON alerts(system_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_fed_pair ON federation(a_id, b_id);
`;

// Columnas añadidas después (bases ya creadas): proximidad, división, moneda con imagen, precio.
const ADDED_COLUMNS = [
  ['systems', 'city', "TEXT NOT NULL DEFAULT ''"],
  ['systems', 'country', "TEXT NOT NULL DEFAULT ''"],
  ['systems', 'postcode', "TEXT NOT NULL DEFAULT ''"],
  ['systems', 'split_threshold', 'INTEGER NOT NULL DEFAULT 50'],
  ['systems', 'parent_id', 'INTEGER'],
  ['users', 'city', "TEXT NOT NULL DEFAULT ''"],
  ['users', 'postcode', "TEXT NOT NULL DEFAULT ''"],
  ['transactions', 'peer_system_id', 'INTEGER'],
  ['systems', 'currency_emoji', "TEXT NOT NULL DEFAULT ''"],
  ['systems', 'currency_image', "TEXT NOT NULL DEFAULT ''"],
  ['offers', 'price', 'REAL'],
  ['offers', 'price_note', "TEXT NOT NULL DEFAULT ''"],
];

// Tablas conocidas — se interpolan en el PRAGMA (no hay entrada de usuario aquí).
const KNOWN_TABLES = new Set(['systems', 'users', 'transactions', 'offers', 'sessions', 'alerts', 'federation']);

/* ---------- shim: misma API que node:sqlite (db.prepare(...).run/get/all) ----------
   ctx.storage.sql.exec() es SÍNCRONO dentro del Durable Object, así que el resto
   del código del servidor funciona sin volverse asíncrono. Como el DO procesa las
   peticiones en serie, `SELECT last_insert_rowid()` es fiable justo después del INSERT. */
export function makeDb(sql) {
  const stmt = (text) => ({
    run(...args) {
      sql.exec(text, ...args).toArray(); // consume el cursor: ejecuta la escritura ya
      let id = 0;
      try { id = sql.exec('SELECT last_insert_rowid() AS id').one().id; } catch { /* no-op */ }
      return { lastInsertRowid: Number(id) || 0, changes: 0 };
    },
    get(...args) {
      const rows = sql.exec(text, ...args).toArray();
      return rows[0];
    },
    all(...args) {
      return sql.exec(text, ...args).toArray();
    },
  });
  return {
    prepare: stmt,
    exec: (text) => { sql.exec(text).toArray(); },
    _sql: sql,
  };
}

export function initDb(sql) {
  sql.exec(SCHEMA_SQL).toArray();
  // añade columnas nuevas a bases ya existentes (migración idempotente)
  for (const [t, c, decl] of ADDED_COLUMNS) {
    if (!KNOWN_TABLES.has(t)) continue;
    const cols = sql.exec(`SELECT name FROM pragma_table_info('${t}')`).toArray().map((r) => r.name);
    if (!cols.includes(c)) sql.exec(`ALTER TABLE ${t} ADD COLUMN ${c} ${decl}`).toArray();
  }
  sql.exec(INDEX_SQL).toArray();
  return makeDb(sql);
}

/* ---------- utilidades (espejo de src/db.mjs) ---------- */
export const now = () => new Date().toISOString();

export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const h = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `${salt}:${h}`;
}

export function verifyPassword(pw, stored) {
  try {
    const [salt, h] = String(stored).split(':');
    const hh = crypto.scryptSync(pw, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(hh, 'hex'));
  } catch {
    return false;
  }
}

export const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');

export function slugify(s) {
  return String(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'sistema';
}

export const newToken = () => crypto.randomBytes(24).toString('hex');
