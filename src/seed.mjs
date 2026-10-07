// seed.mjs — Datos de ejemplo: dos grupos LETS en una misma instancia (para demostrar
// el modelo: un administrador, varios grupos).
import { openDb, now, hashPassword, sha256, slugify, newToken } from './db.mjs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.LETS_DB || join(__dir, '..', 'data', 'lets.db');
const db = openDb(DB_PATH);

function ensureSystem(o) {
  let s = db.prepare('SELECT * FROM systems WHERE slug = ?').get(o.slug);
  if (s) {
    // backfill de ubicación si el sistema ya existía sin ella
    if ((o.city || o.country || o.postcode) && !s.city && !s.country && !s.postcode) {
      db.prepare('UPDATE systems SET city=?, country=?, postcode=? WHERE id=?')
        .run(o.city || '', o.country || '', o.postcode || '', s.id);
      s = db.prepare('SELECT * FROM systems WHERE id = ?').get(s.id);
    }
    return { sys: s, created: false };
  }
  const info = db.prepare(`INSERT INTO systems
    (slug,name,locale,currency_name,currency_sym,signup_bonus,credit_limit,annual_fee,admin_points_per_tx,contract_text,city,country,postcode,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    o.slug, o.name, o.locale, o.currency_name, o.currency_sym, o.signup_bonus, o.credit_limit, 10, o.fee, '',
    o.city || '', o.country || '', o.postcode || '', now());
  s = db.prepare('SELECT * FROM systems WHERE id = ?').get(info.lastInsertRowid);
  return { sys: s, created: true };
}

function ensureUser(sys, u) {
  let x = db.prepare('SELECT * FROM users WHERE email = ?').get(u.email);
  if (x) return { user: x, created: false };
  const hash = sha256(sys.slug + '|' + u.email + '|' + u.name + '|contrato');
  const info = db.prepare(`INSERT INTO users
    (system_id,name,email,phone,password,is_admin,balance,points,contract_hash,contract_name,contract_at,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    sys.id, u.name, u.email, u.phone || '', hashPassword(u.pass || 'demo1234'),
    u.admin ? 1 : 0, u.bonus ?? sys.signup_bonus, 0, hash, u.name, now(), now());
  db.prepare(`INSERT INTO transactions (system_id,from_user,to_user,amount,concept,kind,created_at)
    VALUES (?,NULL,?,?,'Bono de bienvenida','bono',?)`).run(sys.id, info.lastInsertRowid, u.bonus ?? sys.signup_bonus, now());
  return { user: db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid), created: true };
}

const defs = [
  {
    slug: 'mantra-yoga-alicante',
    name: 'Mantra Yoga Alicante',
    locale: 'Alicante',
    city: 'Alicante',
    country: 'España',
    postcode: '03001',
    currency_name: 'Puntos',
    currency_sym: '✦',
    signup_bonus: 10,
    credit_limit: 100,
    fee: 1,
    admin: { name: 'Jagannatha M. dasa', email: 'admin@mantrayoga.local', phone: '+34 687 35 76 60', pass: 'demo1234' },
    users: [
      { name: 'Ana López', email: 'ana@example.com', pass: 'demo1234', phone: '+34 600 111 111' },
      { name: 'Bruno Pérez', email: 'bruno@example.com', pass: 'demo1234', phone: '+34 600 222 222' },
      { name: 'Carla Ruiz', email: 'carla@example.com', pass: 'demo1234', phone: '+34 600 333 333' },
    ],
    offers: [
      ['ofrezco', 'Clases de mantra yoga y respiración, mañana o tarde.'],
      ['necesito', 'Ayuda para montar un huerto urbano el fin de semana.'],
      ['ofrezco', 'Traducciones español–inglés de textos cortos.'],
      ['necesito', 'Arreglo de una fuga en el baño.'],
    ],
  },
  {
    slug: 'huerta-de-cabezuelo',
    name: 'Huerta de Cabezuelo',
    locale: 'La Huerta',
    city: 'Cabezuelo',
    country: 'España',
    postcode: '03699',
    currency_name: 'Semillas',
    currency_sym: '❋',
    signup_bonus: 12,
    credit_limit: 80,
    fee: 0.5,
    admin: { name: 'Rosa Miralles', email: 'admin@huerta.local', phone: '+34 600 444 444', pass: 'demo1234' },
    users: [
      { name: 'Diego Sanz', email: 'diego@example.com', pass: 'demo1234' },
      { name: 'Elena Vidal', email: 'elena@example.com', pass: 'demo1234' },
    ],
    offers: [
      ['ofrezco', 'Semillas de tomate y calabaza de la temporada pasada.'],
      ['necesito', 'Quien me preste la rotocultivadora un domingo.'],
      ['ofrezco', 'Un taller de compost casero para tres personas.'],
    ],
  },
];

for (const def of defs) {
  const { sys, created } = ensureSystem(def);
  if (!created) { console.log(`· sistema ya existía: ${sys.slug}`); }
  const admin = ensureUser(sys, { ...def.admin, admin: true, bonus: def.signup_bonus });
  if (def.users) for (const u of def.users) ensureUser(sys, u);
  if (created && def.offers) {
    const members = db.prepare('SELECT id FROM users WHERE system_id = ? ORDER BY id').all(sys.id);
    def.offers.forEach(([kind, text], i) => {
      db.prepare('INSERT INTO offers (system_id,user_id,kind,text,created_at) VALUES (?,?,?,?,?)')
        .run(sys.id, members[i % members.length].id, kind, text, now());
    });
  }
  console.log(`· ${created ? 'creado' : 'existente'}: ${sys.name} (${sys.currency_name} ${sys.currency_sym}) admin=${admin.user.email}`);
}
console.log('Sembrado terminado.');
