// ledger.mjs — el guardián de los datos: un Durable Object con SQLite (plan gratuito).
// Es el espejo de la capa de datos + lógica de dominio de src/server.mjs.
// ctx.storage.sql.exec() es SÍNCRONO y el DO atiende las peticiones en serie,
// así que las operaciones compuestas (un pago con sus dos asientos, un reparto
// por código postal…) quedan atómicas sin transacciones explícitas.
import { DurableObject } from 'cloudflare:workers';
import { initDb, now, hashPassword, verifyPassword, sha256, slugify, newToken } from './schema.mjs';

export class Ledger extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    // Crea el esquema y migra columnas una sola vez, antes de atender nada.
    ctx.blockConcurrencyWhile(async () => {
      this.db = initDb(ctx.storage.sql);
    });
  }

  /* ---------- utilidades ---------- */
  #num(v, d = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  }

  // Las cantidades del sistema se cuentan en unidades enteras (1, 2, 3…),
  // nunca en fracciones. Todo importe que entra se redondea a entero.
  #int(v, d = 0) {
    return Math.round(this.#num(v, d));
  }

  #sysWithCount() {
    return this.db.prepare(`
      SELECT s.*, (SELECT COUNT(*) FROM users u WHERE u.system_id = s.id) AS n
      FROM systems s ORDER BY s.id`).all();
  }
  #systemBySlug(slug) { return this.db.prepare('SELECT * FROM systems WHERE slug = ?').get(slug); }
  #systemById(id) { return this.db.prepare('SELECT * FROM systems WHERE id = ?').get(id); }
  #members(sid) {
    return this.db.prepare(`
      SELECT id, name, email, phone, is_admin, balance, points, contract_hash, contract_at, created_at
      FROM users WHERE system_id = ? ORDER BY is_admin DESC, id`).all(sid);
  }
  #userByEmail(email) {
    return this.db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase().trim());
  }
  #userById(id) { return this.db.prepare('SELECT * FROM users WHERE id = ?').get(id); }
  #offers(sid) {
    return this.db.prepare(`
      SELECT o.*, u.name FROM offers o JOIN users u ON u.id = o.user_id
      WHERE o.system_id = ? ORDER BY o.id DESC LIMIT 50`).all(sid);
  }
  #txFor(sid, uid) {
    return this.db.prepare(`
      SELECT t.*, uf.name AS from_name, ut.name AS to_name
      FROM transactions t
      LEFT JOIN users uf ON uf.id = t.from_user
      LEFT JOIN users ut ON ut.id = t.to_user
      WHERE t.system_id = ? AND (t.from_user = ? OR t.to_user = ?)
      ORDER BY t.id DESC LIMIT 50`).all(sid, uid, uid);
  }
  #openAlerts(sid) {
    return this.db.prepare(`
      SELECT a.*, u.name AS user_name, u.email AS user_email
      FROM alerts a JOIN users u ON u.id = a.user_id
      WHERE a.system_id = ? AND a.status = 'abierta'
      ORDER BY a.id DESC`).all(sid);
  }
  #myAlert(sid, uid) {
    return this.db.prepare(`
      SELECT * FROM alerts
      WHERE system_id = ? AND user_id = ? AND status = 'abierta'
      ORDER BY id DESC LIMIT 1`).get(sid, uid);
  }
  #federations(sid) {
    return this.db.prepare('SELECT * FROM federation WHERE a_id = ? OR b_id = ? ORDER BY id DESC').all(sid, sid);
  }
  #federationBetween(a, b) {
    return this.db.prepare('SELECT * FROM federation WHERE (a_id = ? AND b_id = ?) OR (a_id = ? AND b_id = ?)').get(a, b, b, a);
  }
  #fedPeers(sid) {
    return this.#federations(sid).map((f) => {
      const peerId = f.a_id === sid ? f.b_id : f.a_id;
      return { ...f, peer_id: peerId, peer: this.#systemById(peerId) };
    });
  }
  #peerOffers(sid) {
    const ids = this.#fedPeers(sid).filter((f) => f.status === 'aceptada' && f.see_offers).map((f) => f.peer_id);
    if (!ids.length) return [];
    const ph = ids.map(() => '?').join(',');
    return this.db.prepare(`SELECT o.*, u.name, s.name AS system_name, s.currency_sym AS system_sym, s.slug AS system_slug
      FROM offers o JOIN users u ON u.id = o.user_id JOIN systems s ON s.id = o.system_id
      WHERE o.system_id IN (${ph}) ORDER BY o.id DESC LIMIT 60`).all(...ids);
  }
  #federatedMembers(sid) {
    return this.#fedPeers(sid)
      .filter((f) => f.status === 'aceptada' && f.accept_currency)
      .map((f) => {
        const members = this.db.prepare('SELECT id, name, balance FROM users WHERE system_id = ? ORDER BY id').all(f.peer_id);
        for (const m of members) m.system_id = f.peer_id;
        return { system: f.peer, rate: f.rate || 1, members };
      });
  }

  /* ---------- cuentas públicas ---------- */
  #publicAccounts(sid) {
    const members = this.db.prepare('SELECT id, name, balance, points, city, postcode, is_admin, contract_at FROM users WHERE system_id = ? ORDER BY balance DESC, name').all(sid);
    const open = this.db.prepare(`SELECT user_id, debt FROM alerts WHERE system_id = ? AND status = 'abierta'`).all(sid);
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

  /* ---------- avisos de límite de deuda ---------- */
  checkDebtLimit(sys, uid) {
    const u = this.#userById(uid);
    if (!u || u.is_admin) return null;
    const debt = -u.balance;
    const open = this.db.prepare(`SELECT * FROM alerts WHERE system_id = ? AND user_id = ? AND status = 'abierta'`).get(sys.id, uid);
    if (debt >= sys.credit_limit - 1e-9) {
      if (!open) {
        const id = this.db.prepare(`INSERT INTO alerts (system_id, user_id, kind, debt, limit_val, status, created_at)
          VALUES (?,?,?,?,?,'abierta',?)`).run(sys.id, uid, 'limite_deuda', debt, sys.credit_limit, now()).lastInsertRowid;
        return { id, opened: true, name: u.name, debt };
      }
      this.db.prepare('UPDATE alerts SET debt = ? WHERE id = ?').run(debt, open.id);
      return { id: open.id, opened: false, name: u.name, debt };
    }
    if (open) this.db.prepare(`UPDATE alerts SET status = 'cerrada', closed_at = ? WHERE id = ?`).run(now(), open.id);
    return null;
  }

  /* ---------- dominio: alta de sistema ---------- */
  createSystem(f) {
    const name = String(f.name || '').trim();
    const currencyName = String(f.currency_name || '').trim();
    const currencySym = String(f.currency_sym || '').trim() || '✦';
    const adminName = String(f.admin_name || '').trim();
    const adminEmail = String(f.admin_email || '').toLowerCase().trim();
    const adminPass = String(f.admin_pass || '');
    if (!name || !currencyName || !adminName || !adminEmail || adminPass.length < 6) {
      return { error: 'Faltan datos o la contraseña es corta (mínimo 6).' };
    }
    if (this.#userByEmail(adminEmail)) return { error: 'Ese correo ya está registrado.' };
    let slug = slugify(name);
    if (this.#systemBySlug(slug)) slug = slug + '-' + Math.random().toString(36).slice(2, 6);
    const signupBonus = this.#int(f.signup_bonus, 10);
    const creditLimit = this.#int(f.credit_limit, 100);
    const locale = String(f.locale || '').trim();
    const currencyEmoji = String(f.currency_emoji || '').trim().slice(0, 8);
    const currencyImage = String(f.currency_image || '').trim().slice(0, 400);
    const city = String(f.city || '').trim().slice(0, 80);
    const country = String(f.country || '').trim().slice(0, 80);
    const postcode = String(f.postcode || '').trim().slice(0, 20);
    const info = this.db.prepare(`
      INSERT INTO systems (slug, name, locale, currency_name, currency_sym, currency_emoji, currency_image, signup_bonus, credit_limit, annual_fee, admin_points_per_tx, contract_text, city, country, postcode, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      slug, name, locale, currencyName, currencySym, currencyEmoji, currencyImage, signupBonus, creditLimit, 10, 1, '', city, country, postcode, now());
    const sid = info.lastInsertRowid;
    const uid = this.db.prepare(`
      INSERT INTO users (system_id, name, email, phone, password, is_admin, balance, points, contract_hash, contract_name, contract_at, created_at)
      VALUES (?,?,?,?,?,1,?,0,?,?,?,?)`).run(
      sid, adminName, adminEmail, '', hashPassword(adminPass), signupBonus,
      sha256(name + '|' + adminEmail + '|' + now()), adminName, now(), now()).lastInsertRowid;
    this.db.prepare(`INSERT INTO transactions (system_id, from_user, to_user, amount, concept, kind, created_at)
      VALUES (?,NULL,?,?,'Bono de bienvenida (admin)','bono',?)`).run(sid, uid, signupBonus, now());
    const token = newToken();
    this.db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?,?,?)').run(token, uid, now());
    return { redirect: `/s/${slug}/admin`, token };
  }

  /* ---------- dominio: alta de socio ---------- */
  join(sys, f) {
    const name = String(f.name || '').trim();
    const email = String(f.email || '').toLowerCase().trim();
    const phone = String(f.phone || '').trim();
    const pass = String(f.password || '');
    if (!name || !email || pass.length < 6) return { error: 'Revisa los datos (contraseña, mínimo 6).' };
    if (!f.accept) return { error: 'Debes aceptar las condiciones y firmar el contrato.' };
    if (this.#userByEmail(email)) return { error: 'Ese correo ya está registrado.' };
    const hash = sha256(sys.slug + '|' + email + '|' + name + '|' + JSON.stringify(sys.contract_text || sys.slug));
    const city = String(f.city || '').trim().slice(0, 80);
    const postcode = String(f.postcode || '').trim().slice(0, 20);
    const uid = this.db.prepare(`
      INSERT INTO users (system_id, name, email, phone, password, is_admin, balance, points, contract_hash, contract_name, contract_at, city, postcode, created_at)
      VALUES (?,?,?,?,?,0,?,0,?,?,?,?,?,?)`).run(
      sys.id, name, email, phone, hashPassword(pass), sys.signup_bonus, hash, name, now(), city, postcode, now()).lastInsertRowid;
    this.db.prepare(`INSERT INTO transactions (system_id, from_user, to_user, amount, concept, kind, created_at)
      VALUES (?,NULL,?,?,'Bono de bienvenida','bono',?)`).run(sys.id, uid, sys.signup_bonus, now());
    const token = newToken();
    this.db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?,?,?)').run(token, uid, now());
    return { redirect: `/s/${sys.slug}/me`, token };
  }

  /* ---------- dominio: entrar ---------- */
  login(sys, f) {
    const email = String(f.email || '').toLowerCase().trim();
    const u = this.#userByEmail(email);
    if (!u || u.system_id !== sys.id) return { error: 'Correo o contraseña incorrectos.' };
    if (!verifyPassword(String(f.password || ''), u.password)) return { error: 'Correo o contraseña incorrectos.' };
    const token = newToken();
    this.db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?,?,?)').run(token, u.id, now());
    return { redirect: `/s/${sys.slug}/me`, token };
  }

  /* ---------- dominio: pagar ---------- */
  transfer(sys, user, f) {
    if (!user) return { error: 'Entra para poder pagar.' };
    const toId = Number(f.to_user);
    const amount = this.#int(f.amount, 0);
    let concept = String(f.concept || '').slice(0, 120);
    if (!toId || toId === user.id) return { error: 'Elige un socio distinto.' };
    const to = this.#userById(toId);
    if (!to) return { error: 'Ese socio no existe.' };
    if (amount <= 0) return { error: 'La cantidad debe ser mayor que cero.' };
    if (user.balance - amount < -sys.credit_limit) {
      return { error: `Supera el límite de crédito (${sys.credit_limit} ${sys.currency_sym}).` };
    }

    let peer = null, peerAmount = amount;
    if (to.system_id !== sys.id) {
      const fed = this.#federationBetween(Math.min(sys.id, to.system_id), Math.max(sys.id, to.system_id));
      if (!fed || fed.status !== 'aceptada' || !fed.accept_currency) {
        return { error: 'Ese grupo no está integrado con el tuyo para aceptar esta moneda.' };
      }
      peer = this.#systemById(to.system_id);
      peerAmount = Math.round(amount * (fed.rate || 1));
      concept = (concept ? concept + ' — ' : '') + `cambio ${amount} ${sys.currency_sym} → ${peerAmount} ${peer.currency_sym}`;
    }

    this.db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(amount, user.id);
    this.db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(peerAmount, to.id);
    this.db.prepare(`INSERT INTO transactions (system_id, from_user, to_user, amount, concept, kind, peer_system_id, created_at)
      VALUES (?,?,?,?,?,'pago',?,?)`).run(sys.id, user.id, to.id, amount, concept, peer ? peer.id : null, now());
    if (peer) {
      this.db.prepare(`INSERT INTO transactions (system_id, from_user, to_user, amount, concept, kind, peer_system_id, created_at)
        VALUES (?,NULL,?,?,?,'fed_entrada',?,?)`).run(peer.id, to.id, peerAmount, `Pago recibido de ${sys.name}`, sys.id, now());
    }
    if (sys.admin_points_per_tx > 0) {
      const admin = this.db.prepare('SELECT id FROM users WHERE system_id = ? AND is_admin = 1 ORDER BY id LIMIT 1').get(sys.id);
      if (admin) this.db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(sys.admin_points_per_tx, admin.id);
    }
    let ok = peer
      ? `Pago de ${amount} ${sys.currency_sym} registrado (${peerAmount} ${peer.currency_sym} para ${to.name}).`
      : `Pago de ${amount} ${sys.currency_sym} registrado.`;
    const alert = this.checkDebtLimit(sys, user.id);
    if (alert && alert.opened) {
      ok += ` Has llegado al límite de deuda (${sys.credit_limit} ${sys.currency_sym}). La administración recibe un aviso y te contactará para ayudarte a salir del saldo negativo.`;
    }
    return { redirect: `/s/${sys.slug}/me`, ok };
  }

  /* ---------- dominio: donar ---------- */
  donate(sys, user, f) {
    if (!user) return { error: 'Entra para poder donar.' };
    const toId = Number(f.to_user);
    const amount = this.#int(f.amount, 0);
    const note = String(f.concept || '').trim().slice(0, 120);
    if (!toId || toId === user.id) return { error: 'Elige a quién quieres donar.' };
    if (!(amount > 0)) return { error: 'Indica una cantidad mayor que cero.' };
    const to = this.#userById(toId);
    if (!to) return { error: 'Ese socio no existe.' };
    const concept = (note ? note + ' — ' : '') + 'Donación';
    this.db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(amount, user.id);
    this.db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, to.id);
    this.db.prepare(`INSERT INTO transactions (system_id, from_user, to_user, amount, concept, kind, created_at)
      VALUES (?,?,?,?,?,'donacion',?)`).run(sys.id, user.id, to.id, amount, concept, now());
    const alert = this.checkDebtLimit(sys, user.id);
    let ok = `Donación de ${amount} ${sys.currency_sym} a ${to.name} registrada.`;
    if (alert && alert.opened) ok += ` Has llegado al límite de deuda (${sys.credit_limit} ${sys.currency_sym}); la administración recibirá un aviso.`;
    return { redirect: `/s/${sys.slug}/me`, ok };
  }

  /* ---------- dominio: publicar oferta ---------- */
  addOffer(sys, user, f) {
    if (!user) return { error: 'Entra para publicar.' };
    const text = String(f.text || '').trim().slice(0, 400);
    const kind = f.kind === 'necesito' ? 'necesito' : 'ofrezco';
    if (!text) return { error: 'Escribe qué ofreces o necesitas.' };
    const rawPrice = String(f.price ?? '').trim();
    const price = rawPrice === '' ? null : Math.round(this.#num(rawPrice, 0));
    const priceNote = String(f.price_note || '').trim().slice(0, 80);
    this.db.prepare('INSERT INTO offers (system_id, user_id, kind, text, price, price_note, created_at) VALUES (?,?,?,?,?,?,?)')
      .run(sys.id, user.id, kind, text, price === null ? null : price, priceNote, now());
    return { redirect: `/s/${sys.slug}/me`, ok: 'Publicado.' };
  }

  /* ---------- dominio: ajustes del admin ---------- */
  saveAdmin(sys, f) {
    const currencyName = String(f.currency_name || sys.currency_name).trim().slice(0, 30) || sys.currency_name;
    const sym = String(f.currency_sym || sys.currency_sym).trim().slice(0, 6) || sys.currency_sym;
    const bonus = this.#int(f.signup_bonus, sys.signup_bonus);
    const limit = this.#int(f.credit_limit, sys.credit_limit);
    const fee = this.#int(f.admin_points_per_tx, sys.admin_points_per_tx);
    this.db.prepare(`UPDATE systems SET currency_name=?, currency_sym=?, signup_bonus=?, credit_limit=?, admin_points_per_tx=? WHERE id=?`)
      .run(currencyName, sym, bonus, limit, fee, sys.id);
    const city = String(f.city ?? sys.city ?? '').trim().slice(0, 80);
    const country = String(f.country ?? sys.country ?? '').trim().slice(0, 80);
    const postcode = String(f.postcode ?? sys.postcode ?? '').trim().slice(0, 20);
    const thr = Math.max(2, this.#int(f.split_threshold, sys.split_threshold || 50));
    this.db.prepare('UPDATE systems SET city=?, country=?, postcode=?, split_threshold=? WHERE id=?')
      .run(city, country, postcode, thr, sys.id);
    const emoji = String(f.currency_emoji ?? sys.currency_emoji ?? '').trim().slice(0, 8);
    const image = String(f.currency_image ?? sys.currency_image ?? '').trim().slice(0, 400);
    this.db.prepare('UPDATE systems SET currency_emoji=?, currency_image=? WHERE id=?').run(emoji, image, sys.id);
    return { redirect: `/s/${sys.slug}/admin`, ok: 'Ajustes guardados.' };
  }

  /* ---------- dominio: federación ---------- */
  fedAction(sys, user, f) {
    if (!user || !user.is_admin) return { error: 'Solo la administración puede integrar grupos.' };
    const raw = String(f.peer || '').trim();
    let peer = this.#systemBySlug(slugify(raw));
    if (!peer) {
      const all = this.#sysWithCount();
      peer = all.find((s) => String(s.name).toLowerCase() === raw.toLowerCase());
    }
    if (!peer) return { error: 'No encuentro ese grupo. Escribe su nombre o su dirección.' };
    if (peer.id === sys.id) return { error: 'No se puede integrar un grupo consigo mismo.' };

    const action = String(f.action || 'propose');
    const a = Math.min(sys.id, peer.id), b = Math.max(sys.id, peer.id);
    let fed = this.#federationBetween(a, b);

    const flag = (v, d) => (v === undefined || v === null || v === '' ? d : (v === '1' || v === 'on' || v === true ? 1 : 0));

    if (action === 'propose') {
      if (fed) return { error: 'Ya existe un acuerdo entre estos grupos.' };
      this.db.prepare(`INSERT INTO federation (a_id, b_id, status, accept_currency, see_offers, rate, created_by, created_at)
        VALUES (?,?,?,?,?,?,?,?)`).run(
        a, b, 'pendiente', flag(f.accept_currency, 1), flag(f.see_offers, 1), this.#num(f.rate, 1), user.id, now());
      return { redirect: `/s/${sys.slug}/admin`, ok: `Propuesta de integración enviada a «${peer.name}».` };
    }
    if (action === 'accept') {
      if (!fed) return { error: 'No hay propuesta pendiente.' };
      this.db.prepare(`UPDATE federation SET status='aceptada', accept_currency=?, see_offers=?, rate=?, accepted_at=? WHERE id=?`)
        .run(flag(f.accept_currency, 1), flag(f.see_offers, 1), this.#num(f.rate, fed.rate || 1), now(), fed.id);
      return { redirect: `/s/${sys.slug}/admin`, ok: `Integración con «${peer.name}» aceptada. Cada grupo conserva su identidad y su moneda.` };
    }
    if (action === 'update') {
      if (!fed) return { error: 'No hay acuerdo con ese grupo.' };
      this.db.prepare('UPDATE federation SET accept_currency=?, see_offers=?, rate=? WHERE id=?')
        .run(flag(f.accept_currency, 0), flag(f.see_offers, 0), this.#num(f.rate, fed.rate || 1), fed.id);
      return { redirect: `/s/${sys.slug}/admin`, ok: 'Ajustes de integración guardados.' };
    }
    if (action === 'revoke') {
      if (!fed) return { error: 'No hay acuerdo con ese grupo.' };
      this.db.prepare('DELETE FROM federation WHERE id = ?').run(fed.id);
      return { redirect: `/s/${sys.slug}/admin`, ok: `Integración con «${peer.name}» deshecha.` };
    }
    return { error: 'Acción no reconocida.' };
  }

  /* ---------- dominio: división por proximidad (código postal) ---------- */
  split(sys, user, f) {
    if (!user || !user.is_admin) return { error: 'Solo la administración puede dividir el grupo.' };
    const postcode = String(f.postcode || '').trim();
    if (!postcode) return { error: 'Indica el código postal del grupo nuevo.' };
    const city = String(f.city || sys.city || '').trim();
    const country = String(f.country || sys.country || '').trim();
    const name = String(f.name || `${sys.name} — ${postcode}`).trim().slice(0, 80);
    const members = this.#members(sys.id).filter((m) => !m.is_admin);
    const movers = members.filter((m) => String(m.postcode || '').trim() === postcode);
    if (!movers.length) return { error: `Ningún socio declara el código postal ${postcode}.` };

    let slug = slugify(name);
    if (this.#systemBySlug(slug)) slug = slug + '-' + Math.random().toString(36).slice(2, 6);
    const info = this.db.prepare(`INSERT INTO systems
      (slug,name,locale,currency_name,currency_sym,signup_bonus,credit_limit,annual_fee,admin_points_per_tx,contract_text,
       city,country,postcode,split_threshold,parent_id,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      slug, name, city || sys.locale || '', sys.currency_name, sys.currency_sym, sys.signup_bonus, sys.credit_limit,
      sys.annual_fee, sys.admin_points_per_tx, sys.contract_text, city, country, postcode, sys.split_threshold, sys.id, now());
    const newId = info.lastInsertRowid;

    let moved = 0;
    for (const m of movers) {
      this.db.prepare('UPDATE users SET system_id = ?, city = ?, postcode = ? WHERE id = ?').run(newId, city, postcode, m.id);
      this.db.prepare(`INSERT INTO transactions (system_id, from_user, to_user, amount, concept, kind, created_at)
        VALUES (?,?,?,?,?,?,?)`).run(newId, null, m.id, m.balance, 'Saldo traído al grupo nuevo', 'traslado', now());
      moved++;
    }
    const first = this.db.prepare('SELECT id FROM users WHERE system_id = ? ORDER BY balance DESC, id LIMIT 1').get(newId);
    if (first) this.db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(first.id);

    // La integración (federación) NO es automática: los grupos pueden integrarse
    // o no. El administrador la propone/acepta luego desde su panel.
    return { redirect: `/s/${sys.slug}/admin`, ok: `Grupo nuevo «${name}» (CP ${postcode}) con ${moved} socio(s). Puedes integrarlo con los demás desde aquí.` };
  }

  /* ---------- sesión ---------- */
  sessionUser(token) {
    if (!token) return null;
    const s = this.db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
    if (!s) return null;
    return this.#userById(s.user_id) || null;
  }
  logout(token) {
    if (token) this.db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return true;
  }

  /* ---------- tabla de despacho ---------- */
  api(name, payload) {
    const p = payload || {};
    switch (name) {
      case 'systems': return this.#sysWithCount();
      case 'systemBySlug': return this.#systemBySlug(p.slug);
      case 'systemById': return this.#systemById(p.id);
      case 'members': return this.#members(p.sid);
      case 'offers': return this.#offers(p.sid);
      case 'txFor': return this.#txFor(p.sid, p.uid);
      case 'openAlerts': return this.#openAlerts(p.sid);
      case 'myAlert': return this.#myAlert(p.sid, p.uid);
      case 'fedPeers': return this.#fedPeers(p.sid);
      case 'peerOffers': return this.#peerOffers(p.sid);
      case 'federatedMembers': return this.#federatedMembers(p.sid);
      case 'publicAccounts': return this.#publicAccounts(p.sid);
      case 'userById': return this.#userById(p.id);
      case 'sessionUser': return this.sessionUser(p.token);
      case 'logout': return this.logout(p.token);
      case 'checkDebtLimit': return this.checkDebtLimit(p.sys, p.uid);
      case 'createSystem': return this.createSystem(p.f);
      case 'join': return this.join(p.sys, p.f);
      case 'login': return this.login(p.sys, p.f);
      case 'transfer': return this.transfer(p.sys, p.user, p.f);
      case 'donate': return this.donate(p.sys, p.user, p.f);
      case 'addOffer': return this.addOffer(p.sys, p.user, p.f);
      case 'saveAdmin': return this.saveAdmin(p.sys, p.f);
      case 'fedAction': return this.fedAction(p.sys, p.user, p.f);
      case 'split': return this.split(p.sys, p.user, p.f);
      default: throw new Error(`acción desconocida: ${name}`);
    }
  }
}
