// index.mjs — punto de entrada para Cloudflare Workers (sin dependencias npm).
// Reutiliza TAL CUAL las vistas y los textos del proyecto de Node:
//   ../src/views.mjs   (HTML, 0 APIs de Node — funciona igual en Workers)
//   ../src/content.mjs (textos ES/EN/FR/PT, 0 APIs de Node)
// Lo único que cambia es el acceso a datos: en vez de node:sqlite, un Durable Object
// con SQLite (worker/ledger.mjs). El DO atiende las peticiones en serie y su
// sql.exec() es síncrono, así que la lógica de dominio se traslada sin reescribirla.
import { content, LANGS } from '../src/content.mjs';
import * as V from '../src/views.mjs';
import { Ledger } from './ledger.mjs';

export { Ledger };

const DEFAULT_LANG = LANGS.includes(String(globalThis.process?.env?.LETS_LANG || '').slice(0, 2).toLowerCase())
  ? String(globalThis.process?.env?.LETS_LANG).slice(0, 2).toLowerCase()
  : 'es';

// Una instancia = un administrador (quien la instala). Solo él crea sistemas y
// grupos nuevos; los grupos que cree quedan bajo su administración.
const normLang = (v) => {
  const code = String(v || '').slice(0, 2).toLowerCase();
  return LANGS.includes(code) ? code : DEFAULT_LANG;
};

/* ---------- acceso a datos: un único Durable Object ---------- */
function ledger(env) {
  return env.LEDGER.get(env.LEDGER.idFromName('global'));
}
async function api(env, name, payload) {
  return ledger(env).api(name, payload);
}

/* ---------- helpers HTTP ---------- */
function parseCookies(req) {
  const out = {};
  const h = req.headers.get('cookie') || '';
  for (const part of h.split(';')) {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

async function readBody(req) {
  const ct = req.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await req.json(); } catch { return {}; }
  }
  try {
    const fd = await req.formData();
    const o = {};
    for (const [k, v] of fd.entries()) o[k] = typeof v === 'string' ? v : '';
    return o;
  } catch {
    return {};
  }
}

function send(code, body, headers = {}) {
  const h = new Headers(headers);
  h.set('Content-Type', h.get('Content-Type') || 'text/html; charset=utf-8');
  h.set('X-Content-Type-Options', 'nosniff');
  return new Response(body, { status: code, headers: h });
}

function redirect(to, cookies = []) {
  const h = new Headers();
  h.set('Location', to);
  for (const c of cookies) h.append('Set-Cookie', c);
  return new Response(null, { status: 303, headers: h });
}

// 301 para URLs antiguas que ya no existen (/how, /systems): conserva el ranking.
function movedPermanently(to) {
  return new Response(null, { status: 301, headers: { Location: to } });
}

// En Workers todo va por HTTPS, así que la cookie de sesión se marca Secure siempre.
function cookieHeader(name, value, maxAge = 60 * 60 * 24 * 30) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`;
}

function json(obj, code = 200) {
  return new Response(JSON.stringify(obj), { status: code, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}

const sysFrom = (user, sys) => sys || null;

/* ---------- router ---------- */
async function handle(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method || 'GET';
  const ck = parseCookies(request);
  const lang = normLang(ck.ls_lang);
  const c = content(lang);

  // salud: balanceadores, monitorización y keep-alive del cron.
  if (path === '/healthz') return send(200, 'ok', { 'Content-Type': 'text/plain; charset=utf-8' });

  // indexación: robots.txt y sitemap.xml propios (origin dinámico)
  if (path === '/robots.txt') {
    const origin = url.origin;
    const txt = `User-agent: *\nAllow: /\nDisallow: /s/*/me\nDisallow: /s/*/admin\nDisallow: /s/*/login\nDisallow: /systems/new\nSitemap: ${origin}/sitemap.xml\n`;
    return send(200, txt, { 'Content-Type': 'text/plain; charset=utf-8' });
  }
  if (path === '/sitemap.xml') {
    const origin = url.origin;
    const systems = await api(env, 'systems');
    const urls = [
      { loc: '/', pri: '1.0' },
      { loc: '/presentacion', pri: '0.9' },
      { loc: '/faq', pri: '0.7' },
      { loc: '/ideas', pri: '0.8' },
      ...systems.map((s) => ({ loc: `/s/${s.slug}`, pri: '0.6' })),
      ...systems.map((s) => ({ loc: `/s/${s.slug}/amarillas`, pri: '0.5' })),
      ...systems.map((s) => ({ loc: `/s/${s.slug}/cuentas`, pri: '0.4' })),
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map((u) => `  <url><loc>${origin}${u.loc}</loc><priority>${u.pri}</priority></url>`).join('\n') +
      `\n</urlset>\n`;
    return send(200, body, { 'Content-Type': 'application/xml; charset=utf-8' });
  }

  // comprobación del plan gratuito / puesta en marcha: cuenta los sistemas.
  if (path === '/api/stats') {
    const systems = await api(env, 'systems');
    return json({ ok: true, systems: systems.length, detail: systems.map((s) => ({ slug: s.slug, name: s.name, n: s.n })) });
  }

  try {
    const user = await api(env, 'sessionUser', { token: ck.ls_session });
    const isAdmin = !!(user && user.is_admin);

    // idioma
    if (path === '/lang') {
      const to = normLang(url.searchParams.get('to'));
      const back = url.searchParams.get('back') || '/';
      return redirect(back, [cookieHeader('ls_lang', to)]);
    }

    // logout
    if (path === '/logout') {
      if (ck.ls_session) await api(env, 'logout', { token: ck.ls_session });
      return redirect('/', [`ls_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`]);
    }

    // estáticos: vídeo/imágenes de /media/* (servidos por el binding ASSETS).
    if (path.startsWith('/media/')) {
      if (!env.ASSETS) return send(404, V.simplePage(c, { title: '404', text: c.common.notFound, user, sys: sysFrom(user), lang }));
      const rel = path.replace(/^\/media\//, '');
      if (!/^[A-Za-z0-9._-]+$/.test(rel)) return send(404, V.simplePage(c, { title: '404', text: c.common.notFound, user, sys: sysFrom(user), lang }));
      const notFound = () => send(404, V.simplePage(c, { title: '404', text: c.common.notFound, user, sys: sysFrom(user), lang }));
      const range = request.headers.get('Range');
      // Sin Range: dejamos pasar el stream del binding tal cual.
      if (!range) {
        const assetRes = await env.ASSETS.fetch(new Request(new URL(`/media/${rel}`, url.origin)));
        if (assetRes.status === 404) return notFound();
        const h = new Headers(assetRes.headers);
        h.set('Cache-Control', 'public, max-age=604800');
        h.set('Accept-Ranges', 'bytes');
        return new Response(assetRes.body, { status: 200, headers: h });
      }
      // Con Range: leemos el asset completo y devolvemos 206 con el trozo pedido.
      // (El binding no siempre respeta Range detrás de la caché del edge.)
      const baseRes = await env.ASSETS.fetch(new Request(new URL(`/media/${rel}`, url.origin)));
      if (baseRes.status === 404) return notFound();
      const buf = await baseRes.arrayBuffer();
      const size = buf.byteLength;
      const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (!m) {
        const h = new Headers(baseRes.headers);
        h.set('Cache-Control', 'public, max-age=604800');
        h.set('Accept-Ranges', 'bytes');
        return new Response(buf, { status: 200, headers: h });
      }
      let start = m[1] === '' ? Math.max(0, size - (parseInt(m[2], 10) || 0)) : parseInt(m[1], 10);
      let end = m[1] === '' || m[2] === '' ? size - 1 : parseInt(m[2], 10);
      if (end >= size) end = size - 1;
      if (start > end || start >= size) {
        return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}`, 'Accept-Ranges': 'bytes' } });
      }
      const slice = buf.slice(start, end + 1);
      const h = new Headers();
      h.set('Content-Type', baseRes.headers.get('Content-Type') || 'application/octet-stream');
      h.set('Content-Length', String(slice.byteLength));
      h.set('Content-Range', `bytes ${start}-${end}/${size}`);
      h.set('Accept-Ranges', 'bytes');
      h.set('Cache-Control', 'public, max-age=604800');
      return new Response(slice, { status: 206, headers: h });
    }

    // Bootstrap: si la instancia aún no tiene ningún grupo, el que la instala crea el
    // primero (queda como su administrador). A partir de ahí, solo el administrador crea.
    const allSystems = await api(env, 'systems');
    const canCreate = isAdmin || allSystems.length === 0;

    if (path === '/') {
      // La portada lleva al grupo: con un solo grupo se entra directo; con varios se
      // elige; sin ninguno, presentación de bienvenida (instancia recién instalada).
      if (allSystems.length === 1) return redirect(`/s/${allSystems[0].slug}`);
      if (allSystems.length > 1) return send(200, V.groupsLandingPage(c, { user, sys: sysFrom(user), lang, systems: allSystems, canCreate }));
      return send(200, V.presentationPage(c, { user, sys: sysFrom(user), lang, canCreate }));
    }
    if (path === '/presentacion') return send(200, V.presentationPage(c, { user, sys: sysFrom(user), lang, canCreate }));
    // /how se fundió en /presentacion; /systems en la portada (/). 301 para no perder ranking.
    if (path === '/how') return movedPermanently('/presentacion');
    if (path === '/faq') return send(200, V.faqPage(c, { user, sys: sysFrom(user), lang }));
    if (path === '/ideas') return send(200, V.ideasPage(c, { user, sys: sysFrom(user), lang }));
    if (path === '/systems') return movedPermanently('/');

    if (path === '/systems/new' && method === 'GET') {
      if (!canCreate) return send(403, V.simplePage(c, { title: c.systems.closedTitle, text: c.systems.closedText, user, sys: sysFrom(user), lang }));
      return send(200, V.newSystemPage(c, { user, sys: sysFrom(user), lang }));
    }
    if (path === '/systems/new' && method === 'POST') {
      const f = await readBody(request);
      if (!canCreate) return send(403, V.simplePage(c, { title: c.systems.closedTitle, text: c.systems.closedText, user, sys: sysFrom(user), lang }));
      const r = await api(env, 'createSystem', { f });
      if (r.error) return send(200, V.newSystemPage(c, { user, sys: sysFrom(user), lang, error: r.error }));
      return redirect(r.redirect, [cookieHeader('ls_session', r.token)]);
    }

    // /s/:slug ...
    const m = path.match(/^\/s\/([^/]+)(\/(.*))?$/);
    if (m) {
      const slug = decodeURIComponent(m[1]);
      const rest = (m[3] || '').replace(/\/$/, '');
      const sys = await api(env, 'systemBySlug', { slug });
      if (!sys) return send(404, V.simplePage(c, { title: '404', text: c.common.notFound, user, sys: null, lang }));

      // página del sistema (incluye sus páginas amarillas y su federación)
      if (rest === '' && method === 'GET') {
        const flash = url.searchParams.get('ok') ? { ok: true, text: url.searchParams.get('ok') } : null;
        return send(200, V.systemPage(c, {
          user, sys, lang, flash,
          offers: await api(env, 'offers', { sid: sys.id }),
          members: await api(env, 'members', { sid: sys.id }),
          peerOffers: await api(env, 'peerOffers', { sid: sys.id }),
          peers: await api(env, 'fedPeers', { sid: sys.id }),
        }));
      }

      // páginas amarillas del sistema (directorio de ofertas y demandas)
      if (rest === 'amarillas' && method === 'GET') {
        const kind = url.searchParams.get('tipo') || '';
        const qsearch = (url.searchParams.get('q') || '').trim().toLowerCase();
        const filter = (list) => list.filter((o) => (!kind || o.kind === kind) &&
          (!qsearch || String(o.text).toLowerCase().includes(qsearch)));
        return send(200, V.yellowPage(c, {
          user, sys, lang, kind, q: url.searchParams.get('q') || '',
          own: filter(await api(env, 'offers', { sid: sys.id })),
          peers: await api(env, 'fedPeers', { sid: sys.id }),
          peerOffers: filter(await api(env, 'peerOffers', { sid: sys.id })),
        }));
      }

      // cuentas públicas del sistema: visibles para todo el mundo
      if (rest === 'cuentas' && method === 'GET') {
        const acc = await api(env, 'publicAccounts', { sid: sys.id });
        return send(200, V.accountsPage(c, { user, sys, lang, ...acc }));
      }

      // alta
      if (rest === 'join' && method === 'GET') {
        if (user && user.system_id === sys.id) return redirect(`/s/${slug}/me`);
        return send(200, V.joinPage(c, { user, sys, lang }));
      }
      if (rest === 'join' && method === 'POST') {
        const f = await readBody(request);
        const r = await api(env, 'join', { sys, f });
        if (r.error) return send(200, V.joinPage(c, { user, sys, lang, error: r.error }));
        return redirect(r.redirect, [cookieHeader('ls_session', r.token)]);
      }

      // login
      if (rest === 'login' && method === 'GET') return send(200, V.loginPage(c, { user, sys, lang }));
      if (rest === 'login' && method === 'POST') {
        const f = await readBody(request);
        const r = await api(env, 'login', { sys, f });
        if (r.error) return send(200, V.loginPage(c, { user, sys, lang, error: r.error }));
        return redirect(r.redirect, [cookieHeader('ls_session', r.token)]);
      }

      // panel del socio
      if (rest === 'me' && method === 'GET') {
        if (!user || user.system_id !== sys.id) return redirect(`/s/${slug}/login`);
        await api(env, 'checkDebtLimit', { sys, uid: user.id });
        const flash = url.searchParams.get('ok') ? { ok: true, text: url.searchParams.get('ok') } : null;
        return send(200, V.dashboardPage(c, {
          user, sys, lang, flash,
          offers: await api(env, 'offers', { sid: sys.id }),
          members: await api(env, 'members', { sid: sys.id }),
          myTx: await api(env, 'txFor', { sid: sys.id, uid: user.id }),
          myAlert: await api(env, 'myAlert', { sid: sys.id, uid: user.id }),
          peerOffers: await api(env, 'peerOffers', { sid: sys.id }),
          fedGroups: await api(env, 'federatedMembers', { sid: sys.id }),
        }));
      }

      // pagar
      if (rest === 'transfer' && method === 'POST') {
        const f = await readBody(request);
        const r = await api(env, 'transfer', { sys, user, f });
        if (r.error) {
          await api(env, 'checkDebtLimit', { sys, uid: user.id });
          return send(200, V.dashboardPage(c, {
            user, sys, lang, flash: { ok: false, text: r.error },
            offers: await api(env, 'offers', { sid: sys.id }),
            members: await api(env, 'members', { sid: sys.id }),
            myTx: await api(env, 'txFor', { sid: sys.id, uid: user.id }),
            myAlert: await api(env, 'myAlert', { sid: sys.id, uid: user.id }),
          }));
        }
        return redirect(r.redirect + '?ok=' + encodeURIComponent(r.ok));
      }

      // donar (traspaso libre, sin servicio)
      if (rest === 'donate' && method === 'POST') {
        const f = await readBody(request);
        const r = await api(env, 'donate', { sys, user, f });
        if (r.error) return redirect(`/s/${slug}/me?ok=` + encodeURIComponent(r.error));
        return redirect(r.redirect + '?ok=' + encodeURIComponent(r.ok));
      }

      // publicar oferta
      if (rest === 'offer' && method === 'POST') {
        const f = await readBody(request);
        const r = await api(env, 'addOffer', { sys, user, f });
        if (r.error) return redirect(`/s/${slug}/me`);
        return redirect(r.redirect + '?ok=' + encodeURIComponent(r.ok));
      }

      // administración
      if (rest === 'admin' && method === 'GET') {
        if (!user || !user.is_admin || user.system_id !== sys.id) {
          return send(403, V.simplePage(c, { title: '403', text: c.common.noAccess, user, sys, lang }));
        }
        const flash = url.searchParams.get('ok') ? { ok: true, text: url.searchParams.get('ok') } : null;
        const members = await api(env, 'members', { sid: sys.id });
        // refresca el estado de todos los avisos del sistema (p. ej. si se baja el límite)
        for (const mem of members) await api(env, 'checkDebtLimit', { sys, uid: mem.id });
        return send(200, V.adminPage(c, {
          user, sys, lang, members, flash,
          alerts: await api(env, 'openAlerts', { sid: sys.id }),
          peers: await api(env, 'fedPeers', { sid: sys.id }),
          allSystems: await api(env, 'systems'),
        }));
      }
      if (rest === 'admin' && method === 'POST') {
        if (!user || !user.is_admin || user.system_id !== sys.id) {
          return send(403, V.simplePage(c, { title: '403', text: c.common.noAccess, user, sys, lang }));
        }
        const f = await readBody(request);
        const r = f.form === 'federation' ? await api(env, 'fedAction', { sys, user, f })
          : f.form === 'split' ? await api(env, 'split', { sys, user, f })
          : await api(env, 'saveAdmin', { sys, f });
        if (r.error) {
          const members = await api(env, 'members', { sid: sys.id });
          for (const mem of members) await api(env, 'checkDebtLimit', { sys, uid: mem.id });
          return send(200, V.adminPage(c, {
            user, sys, lang, members, error: r.error,
            alerts: await api(env, 'openAlerts', { sid: sys.id }),
            peers: await api(env, 'fedPeers', { sid: sys.id }),
            allSystems: await api(env, 'systems'),
          }));
        }
        return redirect(r.redirect + '?ok=' + encodeURIComponent(r.ok));
      }
    }

    return send(404, V.simplePage(c, { title: '404', text: c.common.notFound, user, sys: sysFrom(user), lang }));
  } catch (e) {
    console.error('[error]', e);
    return send(500, '<h1>500</h1><p>Error interno.</p>');
  }
}

export default {
  async fetch(request, env) {
    // Instancia limpia: no se siembra nada. La primera visita la usa el
    // administrador para crear su grupo (ver /systems/new).
    return handle(request, env);
  },
};
