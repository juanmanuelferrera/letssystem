// server.mjs — servidor HTTP (node:http, sin dependencias).
import http from 'node:http';
import { readFileSync, statSync, createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  openDb, now, hashPassword, verifyPassword, sha256, slugify, newToken,
} from './db.mjs';
import { content, LANGS } from './content.mjs';
import * as V from './views.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const DB_PATH = process.env.LETS_DB || join(ROOT, 'data', 'lets.db');
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';
// Idioma por defecto del sitio (LETS_LANG en .env). Si no es válido, español.
const DEFAULT_LANG = LANGS.includes(String(process.env.LETS_LANG || '').slice(0, 2).toLowerCase())
  ? String(process.env.LETS_LANG).slice(0, 2).toLowerCase()
  : 'es';
// Una instancia = un administrador (quien la instala). Solo él crea sistemas y grupos.
const normLang = (v) => {
  const code = String(v || '').slice(0, 2).toLowerCase();
  return LANGS.includes(code) ? code : DEFAULT_LANG;
};

const db = openDb(DB_PATH);

/* ---------- helpers ---------- */
function parseCookies(req) {
  const out = {};
  const h = req.headers.cookie || '';
  for (const part of h.split(';')) {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      const o = {};
      for (const [k, v] of new URLSearchParams(data)) o[k] = v;
      resolve(o);
    });
  });
}

function send(res, code, body, headers = {}) {
  const buf = Buffer.from(body);
  res.writeHead(code, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': buf.length,
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  res.end(buf);
}

// estáticos de /media/* (p. ej. el vídeo de portada). Soporta Range para el vídeo.
const MEDIA_TYPES = {
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.avif': 'image/avif',
};
function sendMedia(res, req, path) {
  const rel = path.replace(/^\/media\//, '');
  // sólo nombres simples: evita traversal (.., /, \0).
  if (!/^[A-Za-z0-9._-]+$/.test(rel)) return send(res, 404, 'No encontrado', { 'Content-Type': 'text/plain; charset=utf-8' });
  const abs = join(ROOT, 'public', 'media', rel);
  let st;
  try { st = statSync(abs); } catch { return send(res, 404, 'No encontrado', { 'Content-Type': 'text/plain; charset=utf-8' }); }
  if (!st.isFile()) return send(res, 404, 'No encontrado', { 'Content-Type': 'text/plain; charset=utf-8' });
  const ext = rel.slice(rel.lastIndexOf('.')).toLowerCase();
  const type = MEDIA_TYPES[ext] || 'application/octet-stream';
  const headers = {
    'Content-Type': type,
    'Cache-Control': 'public, max-age=604800',
    'Accept-Ranges': 'bytes',
    'X-Content-Type-Options': 'nosniff',
  };
  const range = req.headers.range;
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (m) {
      let start = m[1] === '' ? null : Number(m[1]);
      let end = m[2] === '' ? null : Number(m[2]);
      if (start === null && end !== null) { start = Math.max(0, st.size - end); end = st.size - 1; }
      else if (start !== null && end === null) { end = st.size - 1; }
      if (start !== null && end !== null && start <= end && start < st.size) {
        end = Math.min(end, st.size - 1);
        res.writeHead(206, { ...headers, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${st.size}` });
        createReadStream(abs, { start, end }).pipe(res);
        return;
      }
      res.writeHead(416, { ...headers, 'Content-Range': `bytes */${st.size}` });
      return res.end();
    }
  }
  res.writeHead(200, { ...headers, 'Content-Length': st.size });
  createReadStream(abs).pipe(res);
}

function redirect(res, to, cookies = []) {
  const h = { Location: to };
  if (cookies.length) h['Set-Cookie'] = cookies;
  res.writeHead(303, h);
  res.end();
}

// 301 para URLs antiguas que ya no existen (/how, /systems): conserva el ranking.
function movedPermanently(res, to) {
  res.writeHead(301, { Location: to });
  res.end();
}

function cookieHeader(name, value, maxAge = 60 * 60 * 24 * 30) {
  // En HTTPS (PaaS y VPS con proxy) la cookie se marca Secure; en local queda sin Secure
  // para poder entrar por http://127.0.0.1. Se controla con LETS_SECURE_COOKIE=1.
  const secure = String(process.env.LETS_SECURE_COOKIE || '') === '1' ? '; Secure' : '';
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function num(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

// Las cantidades del sistema se cuentan en unidades enteras (1, 2, 3…),
// nunca en fracciones. Todo importe que entra se redondea a entero.
function int(v, d = 0) {
  return Math.round(num(v, d));
}

/* ---------- data accessors ---------- */
const q = {
  systems: () => db.prepare(`
    SELECT s.*, (SELECT COUNT(*) FROM users u WHERE u.system_id = s.id) AS n
    FROM systems s ORDER BY s.id`).all(),
  systemBySlug: (slug) => db.prepare('SELECT * FROM systems WHERE slug = ?').get(slug),
  systemById: (id) => db.prepare('SELECT * FROM systems WHERE id = ?').get(id),
  members: (sid) => db.prepare(`
    SELECT id, name, email, phone, is_admin, balance, points, contract_hash, contract_at, created_at
    FROM users WHERE system_id = ? ORDER BY is_admin DESC, id`).all(sid),
  userByEmail: (email) => db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase().trim()),
  userById: (id) => db.prepare('SELECT * FROM users WHERE id = ?').get(id),
  offers: (sid) => db.prepare(`
    SELECT o.*, u.name FROM offers o JOIN users u ON u.id = o.user_id
    WHERE o.system_id = ? ORDER BY o.id DESC LIMIT 50`).all(sid),
  txFor: (sid, uid) => db.prepare(`
    SELECT t.*, uf.name AS from_name, ut.name AS to_name
    FROM transactions t
    LEFT JOIN users uf ON uf.id = t.from_user
    LEFT JOIN users ut ON ut.id = t.to_user
    WHERE t.system_id = ? AND (t.from_user = ? OR t.to_user = ?)
    ORDER BY t.id DESC LIMIT 50`).all(sid, uid, uid),
  openAlerts: (sid) => db.prepare(`
    SELECT a.*, u.name AS user_name, u.email AS user_email
    FROM alerts a JOIN users u ON u.id = a.user_id
    WHERE a.system_id = ? AND a.status = 'abierta'
    ORDER BY a.id DESC`).all(sid),
  myAlert: (sid, uid) => db.prepare(`
    SELECT * FROM alerts
    WHERE system_id = ? AND user_id = ? AND status = 'abierta'
    ORDER BY id DESC LIMIT 1`).get(sid, uid),
  federations: (sid) => db.prepare('SELECT * FROM federation WHERE a_id = ? OR b_id = ? ORDER BY id DESC').all(sid, sid),
  federationBetween: (a, b) => db.prepare('SELECT * FROM federation WHERE (a_id = ? AND b_id = ?) OR (a_id = ? AND b_id = ?)').get(a, b, b, a),
};

/* ---------- federación ----------
   Cada grupo conserva su identidad y su moneda. Un acuerdo bilateral puede
   (a) aceptar la moneda del otro grupo y (b) mostrar sus ofertas/demandas. */
function fedPeers(sid) {
  return q.federations(sid).map((f) => {
    const peerId = f.a_id === sid ? f.b_id : f.a_id;
    return { ...f, peer_id: peerId, peer: q.systemById(peerId) };
  });
}
function peerOffers(sid) {
  const ids = fedPeers(sid).filter((f) => f.status === 'aceptada' && f.see_offers).map((f) => f.peer_id);
  if (!ids.length) return [];
  const ph = ids.map(() => '?').join(',');
  return db.prepare(`SELECT o.*, u.name, s.name AS system_name, s.currency_sym AS system_sym, s.slug AS system_slug
    FROM offers o JOIN users u ON u.id = o.user_id JOIN systems s ON s.id = o.system_id
    WHERE o.system_id IN (${ph}) ORDER BY o.id DESC LIMIT 60`).all(...ids);
}
function federatedMembers(sid) {
  return fedPeers(sid)
    .filter((f) => f.status === 'aceptada' && f.accept_currency)
    .map((f) => {
      const members = db.prepare('SELECT id, name, balance FROM users WHERE system_id = ? ORDER BY id').all(f.peer_id);
      for (const m of members) m.system_id = f.peer_id;
      return { system: f.peer, rate: f.rate || 1, members };
    });
}

/* ---------- donaciones ----------
   Traspaso libre de fondos entre socios sin contraprestación de servicio: el que
   dona cede saldo y el que recibe lo acepta. Queda registrado como donación. */
function donate(sys, user, f) {
  if (!user) return { error: 'Entra para poder donar.' };
  const toId = Number(f.to_user);
  const amount = int(f.amount, 0);
  const note = String(f.concept || '').trim().slice(0, 120);
  if (!toId || toId === user.id) return { error: 'Elige a quién quieres donar.' };
  if (!(amount > 0)) return { error: 'Indica una cantidad mayor que cero.' };
  const to = q.userById(toId);
  if (!to) return { error: 'Ese socio no existe.' };
  const concept = (note ? note + ' — ' : '') + 'Donación';
  // Igual que un pago, pero sin servicio: solo saldo que se cede y se recibe.
  db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(amount, user.id);
  db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, to.id);
  db.prepare(`INSERT INTO transactions (system_id, from_user, to_user, amount, concept, kind, created_at)
    VALUES (?,?,?,?,?,'donacion',?)`).run(sys.id, user.id, to.id, amount, concept, now());
  const alert = checkDebtLimit(sys, user.id);
  let ok = `Donación de ${amount} ${sys.currency_sym} a ${to.name} registrada.`;
  if (alert && alert.opened) ok += ` Has llegado al límite de deuda (${sys.credit_limit} ${sys.currency_sym}); la administración recibirá un aviso.`;
  return { redirect: `/s/${sys.slug}/me`, ok };
}

/* ---------- cuentas públicas ----------
   El listado de socios y sus saldos de cada sistema es visible para todo el
   mundo (dentro y fuera del grupo). Los correos no se publican. Los avisos de
   deuda sí, porque forman parte de la confianza del sistema. */
function publicAccounts(sid) {
  const members = db.prepare('SELECT id, name, balance, points, city, postcode, is_admin, contract_at FROM users WHERE system_id = ? ORDER BY balance DESC, name').all(sid);
  const open = db.prepare(`SELECT user_id, debt FROM alerts WHERE system_id = ? AND status = 'abierta'`).all(sid);
  const openMap = new Map(open.map((a) => [a.user_id, a.debt]));
  for (const m of members) m.debt = openMap.get(m.id) || 0;
  const totals = members.reduce((acc, m) => {
    if (m.balance > 0) acc.positive += m.balance;
    else acc.negative += -m.balance;
    acc.net += m.balance;
    return acc;
  }, { positive: 0, negative: 0, net: 0 });
  return { members, totals, count: members.length };
}

/* ---------- avisos de límite de deuda ----------
   Cuando un socio alcanza el límite de deuda (100 unidades por defecto) se abre
   un aviso para el administrador y un mensaje de ayuda para el deudor. El aviso
   se cierra solo en cuanto el socio vuelve a estar por encima del límite. */
function checkDebtLimit(sys, uid) {
  const u = q.userById(uid);
  if (!u || u.is_admin) return null;
  const debt = -u.balance;
  const open = db.prepare(`SELECT * FROM alerts WHERE system_id = ? AND user_id = ? AND status = 'abierta'`).get(sys.id, uid);
  if (debt >= sys.credit_limit - 1e-9) {
    if (!open) {
      const id = db.prepare(`INSERT INTO alerts (system_id, user_id, kind, debt, limit_val, status, created_at)
        VALUES (?,?,?,?,?,'abierta',?)`).run(sys.id, uid, 'limite_deuda', debt, sys.credit_limit, now()).lastInsertRowid;
      return { id, opened: true, name: u.name, debt };
    }
    db.prepare('UPDATE alerts SET debt = ? WHERE id = ?').run(debt, open.id);
    return { id: open.id, opened: false, name: u.name, debt };
  }
  if (open) db.prepare(`UPDATE alerts SET status = 'cerrada', closed_at = ? WHERE id = ?`).run(now(), open.id);
  return null;
}

function sessionUser(req) {
  const ck = parseCookies(req);
  const lang = normLang(ck.ls_lang);
  if (!ck.ls_session) return { user: null, lang };
  const s = db.prepare('SELECT * FROM sessions WHERE token = ?').get(ck.ls_session);
  if (!s) return { user: null, lang };
  const u = q.userById(s.user_id);
  return { user: u || null, lang };
}

/* ---------- domain actions ---------- */
function createSystem(f, res) {
  const name = String(f.name || '').trim();
  const currencyName = String(f.currency_name || '').trim();
  const currencySym = String(f.currency_sym || '').trim() || '✦';
  const adminName = String(f.admin_name || '').trim();
  const adminEmail = String(f.admin_email || '').toLowerCase().trim();
  const adminPass = String(f.admin_pass || '');
  if (!name || !currencyName || !adminName || !adminEmail || adminPass.length < 6) {
    return { error: 'Faltan datos o la contraseña es corta (mínimo 6).' };
  }
  if (q.userByEmail(adminEmail)) return { error: 'Ese correo ya está registrado.' };
  let slug = slugify(name);
  if (q.systemBySlug(slug)) slug = slug + '-' + Math.random().toString(36).slice(2, 6);
  const signupBonus = int(f.signup_bonus, 10);
  const creditLimit = int(f.credit_limit, 100);
  const locale = String(f.locale || '').trim();
  const currencyEmoji = String(f.currency_emoji || '').trim().slice(0, 8);
  const currencyImage = String(f.currency_image || '').trim().slice(0, 400);
  const city = String(f.city || '').trim().slice(0, 80);
  const country = String(f.country || '').trim().slice(0, 80);
  const postcode = String(f.postcode || '').trim().slice(0, 20);
  const info = db.prepare(`
    INSERT INTO systems (slug, name, locale, currency_name, currency_sym, currency_emoji, currency_image, signup_bonus, credit_limit, annual_fee, admin_points_per_tx, contract_text, city, country, postcode, created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    slug, name, locale, currencyName, currencySym, currencyEmoji, currencyImage, signupBonus, creditLimit, 10, 1, '', city, country, postcode, now());
  const sid = info.lastInsertRowid;
  const uid = db.prepare(`
    INSERT INTO users (system_id, name, email, phone, password, is_admin, balance, points, contract_hash, contract_name, contract_at, created_at)
    VALUES (?,?,?,?,?,1,?,0,?,?,?,?)`).run(
    sid, adminName, adminEmail, '', hashPassword(adminPass), signupBonus,
    sha256(name + '|' + adminEmail + '|' + now()), adminName, now(), now()).lastInsertRowid;
  db.prepare(`INSERT INTO transactions (system_id, from_user, to_user, amount, concept, kind, created_at)
    VALUES (?,NULL,?,?,'Bono de bienvenida (admin)','bono',?)`).run(sid, uid, signupBonus, now());
  const token = newToken();
  db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?,?,?)').run(token, uid, now());
  return { redirect: `/s/${slug}/admin`, token };
}

function joinSystem(sys, f) {
  const name = String(f.name || '').trim();
  const email = String(f.email || '').toLowerCase().trim();
  const phone = String(f.phone || '').trim();
  const pass = String(f.password || '');
  if (!name || !email || pass.length < 6) return { error: 'Revisa los datos (contraseña, mínimo 6).' };
  if (!f.accept) return { error: 'Debes aceptar las condiciones y firmar el contrato.' };
  if (q.userByEmail(email)) return { error: 'Ese correo ya está registrado.' };
  const hash = sha256(sys.slug + '|' + email + '|' + name + '|' + JSON.stringify(sys.contract_text || sys.slug));
  const city = String(f.city || '').trim().slice(0, 80);
  const postcode = String(f.postcode || '').trim().slice(0, 20);
  const uid = db.prepare(`
    INSERT INTO users (system_id, name, email, phone, password, is_admin, balance, points, contract_hash, contract_name, contract_at, city, postcode, created_at)
    VALUES (?,?,?,?,?,0,?,0,?,?,?,?,?,?)`).run(
    sys.id, name, email, phone, hashPassword(pass), sys.signup_bonus, hash, name, now(), city, postcode, now()).lastInsertRowid;
  db.prepare(`INSERT INTO transactions (system_id, from_user, to_user, amount, concept, kind, created_at)
    VALUES (?,NULL,?,?,'Bono de bienvenida','bono',?)`).run(sys.id, uid, sys.signup_bonus, now());
  const token = newToken();
  db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?,?,?)').run(token, uid, now());
  return { redirect: `/s/${sys.slug}/me`, token };
}

function login(sys, f) {
  const email = String(f.email || '').toLowerCase().trim();
  const u = q.userByEmail(email);
  if (!u || u.system_id !== sys.id) return { error: 'Correo o contraseña incorrectos.' };
  if (!verifyPassword(String(f.password || ''), u.password)) return { error: 'Correo o contraseña incorrectos.' };
  const token = newToken();
  db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?,?,?)').run(token, u.id, now());
  return { redirect: `/s/${sys.slug}/me`, token };
}

function transfer(sys, user, f) {
  if (!user) return { error: 'Entra para poder pagar.' };
  const toId = Number(f.to_user);
  const amount = int(f.amount, 0);
  let concept = String(f.concept || '').slice(0, 120);
  if (!toId || toId === user.id) return { error: 'Elige un socio distinto.' };
  const to = q.userById(toId);
  if (!to) return { error: 'Ese socio no existe.' };
  if (amount <= 0) return { error: 'La cantidad debe ser mayor que cero.' };
  if (user.balance - amount < -sys.credit_limit) {
    return { error: `Supera el límite de crédito (${sys.credit_limit} ${sys.currency_sym}).` };
  }

  // ¿El pago es a otro grupo (federación)? Solo si hay acuerdo aceptado que acepte su moneda.
  let peer = null, peerAmount = amount;
  if (to.system_id !== sys.id) {
    const fed = q.federationBetween(Math.min(sys.id, to.system_id), Math.max(sys.id, to.system_id));
    if (!fed || fed.status !== 'aceptada' || !fed.accept_currency) {
      return { error: 'Ese grupo no está integrado con el tuyo para aceptar esta moneda.' };
    }
    peer = q.systemById(to.system_id);
    peerAmount = Math.round(amount * (fed.rate || 1));
    concept = (concept ? concept + ' — ' : '') + `cambio ${amount} ${sys.currency_sym} → ${peerAmount} ${peer.currency_sym}`;
  }

  db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(amount, user.id);
  db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(peerAmount, to.id);
  db.prepare(`INSERT INTO transactions (system_id, from_user, to_user, amount, concept, kind, peer_system_id, created_at)
    VALUES (?,?,?,?,?,'pago',?,?)`).run(sys.id, user.id, to.id, amount, concept, peer ? peer.id : null, now());
  if (peer) {
    // asiento espejo en el grupo del receptor, en su propia moneda
    db.prepare(`INSERT INTO transactions (system_id, from_user, to_user, amount, concept, kind, peer_system_id, created_at)
      VALUES (?,NULL,?,?,?,'fed_entrada',?,?)`).run(peer.id, to.id, peerAmount, `Pago recibido de ${sys.name}`, sys.id, now());
  }
  // El administrador cobra sus puntos por transacción
  if (sys.admin_points_per_tx > 0) {
    const admin = db.prepare('SELECT id FROM users WHERE system_id = ? AND is_admin = 1 ORDER BY id LIMIT 1').get(sys.id);
    if (admin) db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(sys.admin_points_per_tx, admin.id);
  }
  // ¿Se ha alcanzado el límite de deuda? Aviso al admin + mensaje de ayuda al deudor.
  let ok = peer
    ? `Pago de ${amount} ${sys.currency_sym} registrado (${peerAmount} ${peer.currency_sym} para ${to.name}).`
    : `Pago de ${amount} ${sys.currency_sym} registrado.`;
  const alert = checkDebtLimit(sys, user.id);
  if (alert && alert.opened) {
    ok += ` Has llegado al límite de deuda (${sys.credit_limit} ${sys.currency_sym}). La administración recibe un aviso y te contactará para ayudarte a salir del saldo negativo.`;
  }
  return { redirect: `/s/${sys.slug}/me`, ok };
}

function addOffer(sys, user, f) {
  if (!user) return { error: 'Entra para publicar.' };
  const text = String(f.text || '').trim().slice(0, 400);
  const kind = f.kind === 'necesito' ? 'necesito' : 'ofrezco';
  if (!text) return { error: 'Escribe qué ofreces o necesitas.' };
  // El precio lo fija libremente quien publica; puede dejarlo en blanco.
  const rawPrice = String(f.price ?? '').trim();
  const price = rawPrice === '' ? null : Math.round(num(rawPrice, 0));
  const priceNote = String(f.price_note || '').trim().slice(0, 80);
  db.prepare('INSERT INTO offers (system_id, user_id, kind, text, price, price_note, created_at) VALUES (?,?,?,?,?,?,?)')
    .run(sys.id, user.id, kind, text, price === null ? null : price, priceNote, now());
  return { redirect: `/s/${sys.slug}/me`, ok: 'Publicado.' };
}

function saveAdmin(sys, f) {
  const currencyName = String(f.currency_name || sys.currency_name).trim().slice(0, 30) || sys.currency_name;
  const sym = String(f.currency_sym || sys.currency_sym).trim().slice(0, 6) || sys.currency_sym;
  const bonus = int(f.signup_bonus, sys.signup_bonus);
  const limit = int(f.credit_limit, sys.credit_limit);
  const fee = int(f.admin_points_per_tx, sys.admin_points_per_tx);
  db.prepare(`UPDATE systems SET currency_name=?, currency_sym=?, signup_bonus=?, credit_limit=?, admin_points_per_tx=? WHERE id=?`)
    .run(currencyName, sym, bonus, limit, fee, sys.id);
  // Proximidad y umbral de división (campos nuevos)
  const city = String(f.city ?? sys.city ?? '').trim().slice(0, 80);
  const country = String(f.country ?? sys.country ?? '').trim().slice(0, 80);
  const postcode = String(f.postcode ?? sys.postcode ?? '').trim().slice(0, 20);
  const thr = Math.max(2, int(f.split_threshold, sys.split_threshold || 50));
  db.prepare('UPDATE systems SET city=?, country=?, postcode=?, split_threshold=? WHERE id=?')
    .run(city, country, postcode, thr, sys.id);
  // Moneda con emoji y/o imagen (URL o data-URI corto). Se puede quitar dejando el campo vacío.
  const emoji = String(f.currency_emoji ?? sys.currency_emoji ?? '').trim().slice(0, 8);
  const image = String(f.currency_image ?? sys.currency_image ?? '').trim().slice(0, 400);
  db.prepare('UPDATE systems SET currency_emoji=?, currency_image=? WHERE id=?').run(emoji, image, sys.id);
  return { redirect: `/s/${sys.slug}/admin`, ok: 'Ajustes guardados.' };
}

/* ---------- federación (integración de grupos) ----------
   El administrador propone la integración; el otro grupo acepta o rechaza.
   Cada grupo decide por su lado si acepta la moneda ajena y si ve sus ofertas. */
function fedAction(sys, user, f) {
  if (!user || !user.is_admin) return { error: 'Solo la administración puede integrar grupos.' };
  const raw = String(f.peer || '').trim();
  let peer = q.systemBySlug(slugify(raw));
  if (!peer) {
    const all = q.systems();
    peer = all.find((s) => String(s.name).toLowerCase() === raw.toLowerCase());
  }
  if (!peer) return { error: 'No encuentro ese grupo. Escribe su nombre o su dirección.' };
  if (peer.id === sys.id) return { error: 'No se puede integrar un grupo consigo mismo.' };

  const action = String(f.action || 'propose');
  const a = Math.min(sys.id, peer.id), b = Math.max(sys.id, peer.id);
  let fed = q.federationBetween(a, b);

  const flag = (v, d) => (v === undefined || v === null || v === '' ? d : (v === '1' || v === 'on' || v === true ? 1 : 0));

  if (action === 'propose') {
    if (fed) return { error: 'Ya existe un acuerdo entre estos grupos.' };
    db.prepare(`INSERT INTO federation (a_id, b_id, status, accept_currency, see_offers, rate, created_by, created_at)
      VALUES (?,?,?,?,?,?,?,?)`).run(
      a, b, 'pendiente', flag(f.accept_currency, 1), flag(f.see_offers, 1), num(f.rate, 1), user.id, now());
    return { redirect: `/s/${sys.slug}/admin`, ok: `Propuesta de integración enviada a «${peer.name}».` };
  }
  if (action === 'accept') {
    if (!fed) return { error: 'No hay propuesta pendiente.' };
    db.prepare(`UPDATE federation SET status='aceptada', accept_currency=?, see_offers=?, rate=?, accepted_at=? WHERE id=?`)
      .run(flag(f.accept_currency, 1), flag(f.see_offers, 1), num(f.rate, fed.rate || 1), now(), fed.id);
    return { redirect: `/s/${sys.slug}/admin`, ok: `Integración con «${peer.name}» aceptada. Cada grupo conserva su identidad y su moneda.` };
  }
  if (action === 'update') {
    if (!fed) return { error: 'No hay acuerdo con ese grupo.' };
    db.prepare('UPDATE federation SET accept_currency=?, see_offers=?, rate=? WHERE id=?')
      .run(flag(f.accept_currency, 0), flag(f.see_offers, 0), num(f.rate, fed.rate || 1), fed.id);
    return { redirect: `/s/${sys.slug}/admin`, ok: 'Ajustes de integración guardados.' };
  }
  if (action === 'revoke') {
    if (!fed) return { error: 'No hay acuerdo con ese grupo.' };
    db.prepare('DELETE FROM federation WHERE id = ?').run(fed.id);
    return { redirect: `/s/${sys.slug}/admin`, ok: `Integración con «${peer.name}» deshecha.` };
  }
  return { error: 'Acción no reconocida.' };
}

/* ---------- división por proximidad (código postal) ----------
   Cuando un grupo supera el umbral, el admin puede crear un grupo nuevo basado
   en el código postal: los socios se reparten por cercanía y el nuevo grupo
   nace con su propia identidad (moneda, ciudad, CP). */
function splitSystem(sys, user, f) {
  if (!user || !user.is_admin) return { error: 'Solo la administración puede dividir el grupo.' };
  const postcode = String(f.postcode || '').trim();
  if (!postcode) return { error: 'Indica el código postal del grupo nuevo.' };
  const city = String(f.city || sys.city || '').trim();
  const country = String(f.country || sys.country || '').trim();
  const name = String(f.name || `${sys.name} — ${postcode}`).trim().slice(0, 80);
  const members = q.members(sys.id).filter((m) => !m.is_admin);
  const movers = members.filter((m) => String(m.postcode || '').trim() === postcode);
  if (!movers.length) return { error: `Ningún socio declara el código postal ${postcode}.` };

  let slug = slugify(name);
  if (q.systemBySlug(slug)) slug = slug + '-' + Math.random().toString(36).slice(2, 6);
  const info = db.prepare(`INSERT INTO systems
    (slug,name,locale,currency_name,currency_sym,signup_bonus,credit_limit,annual_fee,admin_points_per_tx,contract_text,
     city,country,postcode,split_threshold,parent_id,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    slug, name, city || sys.locale || '', sys.currency_name, sys.currency_sym, sys.signup_bonus, sys.credit_limit,
    sys.annual_fee, sys.admin_points_per_tx, sys.contract_text, city, country, postcode, sys.split_threshold, sys.id, now());
  const newId = info.lastInsertRowid;

  let moved = 0;
  for (const m of movers) {
    db.prepare('UPDATE users SET system_id = ?, city = ?, postcode = ? WHERE id = ?').run(newId, city, postcode, m.id);
    db.prepare(`INSERT INTO transactions (system_id, from_user, to_user, amount, concept, kind, created_at)
      VALUES (?,?,?,?,?,?,?)`).run(newId, null, m.id, m.balance, 'Saldo traído al grupo nuevo', 'traslado', now());
    moved++;
  }
  // El grupo nuevo nace con un administrador local (el socio de mayor saldo).
  const first = db.prepare('SELECT id FROM users WHERE system_id = ? ORDER BY balance DESC, id LIMIT 1').get(newId);
  if (first) db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(first.id);

  // Los dos grupos quedan integrados de salida: misma comunidad, monedas que se aceptan.
  const a = Math.min(sys.id, newId), b = Math.max(sys.id, newId);
  db.prepare(`INSERT INTO federation (a_id,b_id,status,accept_currency,see_offers,rate,created_by,created_at,accepted_at)
    VALUES (?,?,'aceptada',1,1,1,?,?,?)`).run(a, b, user.id, now(), now());

  return { redirect: `/s/${sys.slug}/admin`, ok: `Grupo nuevo «${name}» (CP ${postcode}) con ${moved} socio(s). Queda integrado con el grupo original.` };
}

/* ---------- router ---------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname;
  const method = req.method || 'GET';
  const { user, lang } = sessionUser(req);
  const isAdmin = !!(user && user.is_admin);
  const c = content(lang);
  const cookies = [];

  try {
    // idioma
    if (path === '/lang') {
      const to = normLang(url.searchParams.get('to'));
      const back = url.searchParams.get('back') || '/';
      return redirect(res, back, [cookieHeader('ls_lang', to)]);
    }

    // logout
    if (path === '/logout') {
      const ck = parseCookies(req);
      if (ck.ls_session) db.prepare('DELETE FROM sessions WHERE token = ?').run(ck.ls_session);
      return redirect(res, '/', [`ls_session=; Path=/; HttpOnly; Max-Age=0`]);
    }

    // salud (para PaaS: balanceadores, health checks, monitorización)
    if (path === '/healthz') {
      return send(res, 200, 'ok', { 'Content-Type': 'text/plain; charset=utf-8' });
    }

    // indexación: robots.txt y sitemap.xml propios (origin dinámico)
    if (path === '/robots.txt') {
      const origin = `${url.protocol}//${url.host}`;
      const txt = `User-agent: *\nAllow: /\nDisallow: /s/*/me\nDisallow: /s/*/admin\nDisallow: /s/*/login\nDisallow: /systems/new\nSitemap: ${origin}/sitemap.xml\n`;
      return send(res, 200, txt, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    if (path === '/sitemap.xml') {
      const origin = `${url.protocol}//${url.host}`;
      const urls = [
        { loc: '/', pri: '1.0' },
        { loc: '/presentacion', pri: '0.9' },
        { loc: '/faq', pri: '0.7' },
        { loc: '/ideas', pri: '0.8' },
        ...q.systems().map((s) => ({ loc: `/s/${s.slug}`, pri: '0.6' })),
        ...q.systems().map((s) => ({ loc: `/s/${s.slug}/amarillas`, pri: '0.5' })),
        ...q.systems().map((s) => ({ loc: `/s/${s.slug}/cuentas`, pri: '0.4' })),
      ];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls.map((u) => `  <url><loc>${origin}${u.loc}</loc><priority>${u.pri}</priority></url>`).join('\n') +
        `\n</urlset>\n`;
      return send(res, 200, xml, { 'Content-Type': 'application/xml; charset=utf-8' });
    }

    // estáticos: vídeo/imágenes de /media/* (carpeta media/ del repo, mapeada a public/ en el Worker).
    if (path.startsWith('/media/')) return sendMedia(res, req, path);

    // Bootstrap: si la instancia aún no tiene ningún grupo, el que la instala crea el
    // primero (queda como su administrador). A partir de ahí, solo el administrador crea.
    const allSystems = q.systems();
    const canCreate = isAdmin || allSystems.length === 0;

    if (path === '/') {
      // La portada lleva al grupo: con un solo grupo se entra directo; con varios se
      // elige; sin ninguno, presentación de bienvenida (instancia recién instalada).
      if (allSystems.length === 1) return redirect(res, `/s/${allSystems[0].slug}`);
      if (allSystems.length > 1) return send(res, 200, V.groupsLandingPage(c, { user, sys: sysFrom(user), lang, systems: allSystems, canCreate }));
      return send(res, 200, V.presentationPage(c, { user, sys: sysFrom(user), lang, canCreate }));
    }
    if (path === '/presentacion') return send(res, 200, V.presentationPage(c, { user, sys: sysFrom(user), lang, canCreate }));
    // /how se fundió en /presentacion; /systems en la portada (/). 301 para no perder ranking.
    if (path === '/how') return movedPermanently(res, '/presentacion');
    if (path === '/faq') return send(res, 200, V.faqPage(c, { user, sys: sysFrom(user), lang }));
    if (path === '/ideas') return send(res, 200, V.ideasPage(c, { user, sys: sysFrom(user), lang }));

    if (path === '/systems') return movedPermanently(res, '/');

    if (path === '/systems/new' && method === 'GET') {
      if (!canCreate) return send(res, 403, V.simplePage(c, { title: c.systems.closedTitle, text: c.systems.closedText, user, sys: sysFrom(user), lang }));
      return send(res, 200, V.newSystemPage(c, { user, sys: sysFrom(user), lang }));
    }
    if (path === '/systems/new' && method === 'POST') {
      const f = await readBody(req);
      if (!canCreate) return send(res, 403, V.simplePage(c, { title: c.systems.closedTitle, text: c.systems.closedText, user, sys: sysFrom(user), lang }));
      const r = createSystem(f, res);
      if (r.error) return send(res, 200, V.newSystemPage(c, { user, sys: sysFrom(user), lang, error: r.error }));
      return redirect(res, r.redirect, [cookieHeader('ls_session', r.token)]);
    }

    // /s/:slug ...
    const m = path.match(/^\/s\/([^/]+)(\/(.*))?$/);
    if (m) {
      const slug = decodeURIComponent(m[1]);
      const rest = (m[3] || '').replace(/\/$/, '');
      const sys = q.systemBySlug(slug);
      if (!sys) return send(res, 404, V.simplePage(c, { title: '404', text: c.common.notFound, user, sys: null, lang }));

      // página del sistema (incluye sus páginas amarillas y su federación)
      if (rest === '' && method === 'GET') {
        const flash = url.searchParams.get('ok') ? { ok: true, text: url.searchParams.get('ok') } : null;
        return send(res, 200, V.systemPage(c, {
          user, sys, lang, offers: q.offers(sys.id), members: q.members(sys.id), flash,
          peerOffers: peerOffers(sys.id), peers: fedPeers(sys.id),
        }));
      }

      // páginas amarillas del sistema (directorio de ofertas y demandas)
      if (rest === 'amarillas' && method === 'GET') {
        const kind = url.searchParams.get('tipo') || '';
        const qsearch = (url.searchParams.get('q') || '').trim().toLowerCase();
        const filter = (list) => list.filter((o) => (!kind || o.kind === kind) &&
          (!qsearch || String(o.text).toLowerCase().includes(qsearch)));
        return send(res, 200, V.yellowPage(c, {
          user, sys, lang, kind, q: url.searchParams.get('q') || '',
          own: filter(q.offers(sys.id)), peers: fedPeers(sys.id),
          peerOffers: filter(peerOffers(sys.id)),
        }));
      }

      // cuentas públicas del sistema: visibles para todo el mundo
      if (rest === 'cuentas' && method === 'GET') {
        return send(res, 200, V.accountsPage(c, { user, sys, lang, ...publicAccounts(sys.id) }));
      }

      // alta
      if (rest === 'join' && method === 'GET') {
        if (user && user.system_id === sys.id) return redirect(res, `/s/${slug}/me`);
        return send(res, 200, V.joinPage(c, { user, sys, lang }));
      }
      if (rest === 'join' && method === 'POST') {
        const f = await readBody(req);
        const r = joinSystem(sys, f);
        if (r.error) return send(res, 200, V.joinPage(c, { user, sys, lang, error: r.error }));
        return redirect(res, r.redirect, [cookieHeader('ls_session', r.token)]);
      }

      // login
      if (rest === 'login' && method === 'GET') return send(res, 200, V.loginPage(c, { user, sys, lang }));
      if (rest === 'login' && method === 'POST') {
        const f = await readBody(req);
        const r = login(sys, f);
        if (r.error) return send(res, 200, V.loginPage(c, { user, sys, lang, error: r.error }));
        return redirect(res, r.redirect, [cookieHeader('ls_session', r.token)]);
      }

      // panel del socio
      if (rest === 'me' && method === 'GET') {
        if (!user || user.system_id !== sys.id) return redirect(res, `/s/${slug}/login`);
        checkDebtLimit(sys, user.id);
        const flash = url.searchParams.get('ok') ? { ok: true, text: url.searchParams.get('ok') } : null;
        return send(res, 200, V.dashboardPage(c, {
          user, sys, lang, offers: q.offers(sys.id), members: q.members(sys.id),
          myTx: q.txFor(sys.id, user.id), flash, myAlert: q.myAlert(sys.id, user.id),
          peerOffers: peerOffers(sys.id), fedGroups: federatedMembers(sys.id),
        }));
      }

      // pagar
      if (rest === 'transfer' && method === 'POST') {
        const f = await readBody(req);
        const r = transfer(sys, user, f);
        if (r.error) {
          checkDebtLimit(sys, user.id);
          return send(res, 200, V.dashboardPage(c, {
            user, sys, lang, offers: q.offers(sys.id), members: q.members(sys.id),
            myTx: q.txFor(sys.id, user.id), flash: { ok: false, text: r.error },
            myAlert: q.myAlert(sys.id, user.id),
          }));
        }
        return redirect(res, r.redirect + '?ok=' + encodeURIComponent(r.ok));
      }

      // donar (traspaso libre, sin servicio)
      if (rest === 'donate' && method === 'POST') {
        const f = await readBody(req);
        const r = donate(sys, user, f);
        if (r.error) return redirect(res, `/s/${slug}/me?ok=` + encodeURIComponent(r.error));
        return redirect(res, r.redirect + '?ok=' + encodeURIComponent(r.ok));
      }

      // publicar oferta
      if (rest === 'offer' && method === 'POST') {
        const f = await readBody(req);
        const r = addOffer(sys, user, f);
        if (r.error) return redirect(res, `/s/${slug}/me`) ;
        return redirect(res, r.redirect + '?ok=' + encodeURIComponent(r.ok));
      }

      // administración
      if (rest === 'admin' && method === 'GET') {
        if (!user || !user.is_admin || user.system_id !== sys.id) {
          return send(res, 403, V.simplePage(c, { title: '403', text: c.common.noAccess, user, sys, lang }));
        }
        const flash = url.searchParams.get('ok') ? { ok: true, text: url.searchParams.get('ok') } : null;
        // refresca el estado de todos los avisos del sistema (p. ej. si se baja el límite)
        for (const m of q.members(sys.id)) checkDebtLimit(sys, m.id);
        return send(res, 200, V.adminPage(c, {
          user, sys, lang, members: q.members(sys.id), flash, alerts: q.openAlerts(sys.id),
          peers: fedPeers(sys.id), allSystems: q.systems(),
        }));
      }
      if (rest === 'admin' && method === 'POST') {
        if (!user || !user.is_admin || user.system_id !== sys.id) {
          return send(res, 403, V.simplePage(c, { title: '403', text: c.common.noAccess, user, sys, lang }));
        }
        const f = await readBody(req);
        const r = f.form === 'federation' ? fedAction(sys, user, f)
          : f.form === 'split' ? splitSystem(sys, user, f)
          : saveAdmin(sys, f);
        if (r.error) {
          for (const m of q.members(sys.id)) checkDebtLimit(sys, m.id);
          return send(res, 200, V.adminPage(c, {
            user, sys, lang, members: q.members(sys.id), error: r.error,
            alerts: q.openAlerts(sys.id), peers: fedPeers(sys.id), allSystems: q.systems(),
          }));
        }
        return redirect(res, r.redirect + '?ok=' + encodeURIComponent(r.ok));
      }
    }

    return send(res, 404, V.simplePage(c, { title: '404', text: c.common.notFound, user, sys: sysFrom(user), lang }));
  } catch (e) {
    console.error('[error]', e);
    return send(res, 500, '<h1>500</h1><p>Error interno.</p>');
  }
});

function sysFrom(user) {
  return user ? q.systemById(user.system_id) : null;
}

// sirve el README en /about para referencia
try {
  readFileSync(join(ROOT, 'README.md'), 'utf8');
} catch {}

server.listen(PORT, HOST, () => {
  console.log(`Lets System escuchando en http://${HOST}:${PORT}  (db: ${DB_PATH})`);
});
