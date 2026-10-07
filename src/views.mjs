// views.mjs — plantillas HTML (sin dependencias). Texto en español; los literales
// de interfaz salen de content.mjs. Aquí solo se compone la página.

import { LANGS, LANG_NAMES, LANG_FLAGS } from './content.mjs';

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// La moneda de cada sistema se muestra así: imagen propia si la hay, si no el
// emoji elegido, y si no el símbolo de texto. Devuelve HTML ya escapado.
export function curHtml(sys, size = 20) {
  const img = String(sys.currency_image || '').trim();
  if (img) return `<img src="${esc(img)}" alt="${esc(sys.currency_sym || '')}" style="height:${size}px;width:auto;vertical-align:-3px">`;
  const emoji = String(sys.currency_emoji || '').trim();
  if (emoji) return `<span style="font-size:${size}px;line-height:1">${esc(emoji)}</span>`;
  return esc(sys.currency_sym || '');
}

// La ubicación de un sistema (ciudad · país, y CP). Se muestra en las tarjetas
// para que se vea de un vistazo dónde está cada comunidad.
export function placeText(s) {
  const bits = [String(s.city || '').trim(), String(s.country || '').trim()].filter(Boolean);
  const pc = String(s.postcode || '').trim();
  return bits.join(' · ') + (pc ? ` (${pc})` : '');
}


// Listado de sistemas. withJoin añade el bono/límite y el botón «Apuntarme».
function sysCards(c, systems, { withJoin = false } = {}) {
  return systems.map((s) => `
    <div class="card syscard">
      <div>
        <h3 style="margin:0">${curHtml(s, 22)} ${esc(s.name)}</h3>
        <div class="small mut">${esc(placeText(s) || s.locale || '')} · ${esc(s.currency_name)} (${curHtml(s, 16)}) · ${s.n} ${esc(c.common.members)}</div>
        ${withJoin ? `<div class="small mut">${esc(c.systems.welcome)}: ${s.signup_bonus} ${curHtml(s, 16)} · ${esc(c.systems.limit)}: ${s.credit_limit} ${curHtml(s, 16)}</div>` : ''}
        ${(s.children && s.children.length) ? `<div class="small mut">${esc(c.systems.children)}: ${s.children.map((ch) => esc(ch.name)).join(', ')}</div>` : ''}
      </div>
      <div class="cta" style="margin:0">
        <a class="btn sm sec" href="/s/${esc(s.slug)}">${esc(c.systems.open)}</a>
        ${withJoin ? `<a class="btn sm" href="/s/${esc(s.slug)}/join">${esc(c.systems.join)}</a>` : ''}
      </div>
    </div>`).join('');
}

/* Todos los grupos en una lista plana: cada uno con su nombre y su moneda.
   Los grupos son hermanos, no jerarquía: el mismo administrador los gobierna
   todos y pueden integrarse entre sí (o no) de mutuo acuerdo. */
function groupCards(c, ranked, { withJoin = false } = {}) {
  return sysCards(c, ranked, { withJoin });
}

export const CSS = `
:root{--bg:#faf8f3;--bg2:#f2efe6;--fg:#20333a;--mut:#647278;--line:#dde7e1;--card:#fff;--acc:#236b5a;--acc-d:#18483d;--acc2:#eaf3ee;--terra:#e7795b;--terra2:#fbeee9;--warn:#c08a2b;--warn2:#fdf6e6;--fed:#3f6d9e;--fed2:#eef4fa;--shadow:0 1px 2px rgba(32,51,58,.05),0 10px 30px rgba(32,51,58,.07);--shadow-sm:0 1px 2px rgba(32,51,58,.05);--sans:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;--serif:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;overflow-x:hidden}
img,video{max-width:100%;height:auto}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.65 var(--sans);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
a{color:var(--acc);text-decoration:none}a:hover{text-decoration:underline}
::selection{background:var(--acc2)}
.wrap{max-width:980px;margin:0 auto;padding:0 22px}
header.site{border-bottom:1px solid var(--line);background:rgba(250,248,243,.88);backdrop-filter:saturate(1.3) blur(10px);position:sticky;top:0;z-index:30}
header.site .bar{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;padding:13px 0}
.brand{display:inline-flex;align-items:center;gap:9px;font-weight:800;font-size:21px;color:var(--fg);letter-spacing:-.02em}
.brand:hover{text-decoration:none}
.brand .mark{width:27px;height:27px;border-radius:8px;background:var(--acc);color:#fff;display:grid;place-items:center;font-size:15px;font-weight:800}
.brand span{color:var(--acc)}
nav.main{display:flex;flex-wrap:wrap;gap:3px;margin-left:auto;align-items:center}
nav.main a{color:var(--mut);font-size:15.5px;font-weight:500;padding:7px 11px;border-radius:9px}
nav.main a:hover{color:var(--fg);background:var(--bg2);text-decoration:none}
nav.main a.on{color:var(--acc-d);background:var(--acc2);font-weight:600}
main{padding:36px 0 64px}
h1,h2,h3{font-family:var(--serif);letter-spacing:-.02em;color:var(--fg)}
h1{font-size:36px;line-height:1.16;margin:4px 0 16px;font-weight:800}
h2{font-size:24px;margin:38px 0 12px;font-weight:700}
h3{font-size:18px;margin:24px 0 6px;font-weight:700}
p{margin:11px 0}
.lead{font-size:19.5px;line-height:1.6;color:#3c4a50}
ul.big{padding-left:22px}ul.big li{margin:9px 0}
ol.big{list-style:none;padding-left:0;counter-reset:none}ol.big li{margin:9px 0}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px;margin:16px 0;box-shadow:var(--shadow-sm)}
.grid{display:grid;gap:16px;grid-template-columns:minmax(0,1fr)}
@media(min-width:680px){.grid.two{grid-template-columns:1fr 1fr}}
.btn{display:inline-flex;align-items:center;justify-content:center;background:var(--acc);color:#fff;border:0;border-radius:11px;padding:12px 22px;min-height:46px;font-size:16.5px;font-weight:600;line-height:1;cursor:pointer;transition:transform .06s ease,opacity .15s ease;box-shadow:var(--shadow-sm)}
.btn:hover{opacity:.95;text-decoration:none}
.btn:active{transform:translateY(1px)}
.btn.sec{background:var(--acc2);color:var(--acc-d);box-shadow:none;border:1px solid #cfe0d7}
.btn.primary{background:var(--terra)}
.btn.sm{padding:8px 15px;font-size:14.5px;border-radius:9px}
.cta{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:24px 0}
.idea{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px 26px;margin:8px 0 2px;padding:0;list-style:none}
.idea li{position:relative;padding-left:21px;font-size:16px;line-height:1.5}
.idea li:before{content:"✓";position:absolute;left:0;color:var(--acc);font-weight:700}
@media(max-width:640px){.idea{grid-template-columns:minmax(0,1fr)}}
label{display:block;font-weight:600;margin:15px 0 5px;font-size:15.5px}
input,select,textarea{width:100%;padding:11px 13px;font-size:16.5px;border:1px solid var(--line);border-radius:10px;background:#fff;font-family:inherit;color:var(--fg)}
input:focus,select:focus,textarea:focus{outline:2px solid var(--acc2);border-color:var(--acc)}
textarea{min-height:88px}
.row{display:grid;gap:13px}@media(min-width:620px){.row.two{grid-template-columns:1fr 1fr}.row.three{grid-template-columns:1fr 1fr 1fr}}
table{border-collapse:collapse;width:100%;font-size:15.5px;margin:12px 0}
th,td{border-bottom:1px solid var(--line);padding:10px 8px;text-align:left;vertical-align:top}
th{color:var(--mut);font-size:12.5px;text-transform:uppercase;letter-spacing:.06em;font-weight:600}
tbody tr:hover{background:var(--bg2)}
.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.tag{display:inline-block;background:var(--acc2);color:var(--acc-d);border-radius:999px;padding:3px 11px;font-size:12.5px;font-weight:700;letter-spacing:.02em}
.tag.neg{background:var(--terra2);color:#b34a2c}
.tag.offer{background:var(--acc2);color:var(--acc-d)}
.tag.need{background:var(--warn2);color:#8a6410}
.grouphead{margin:30px 0 10px;font-size:19px;font-family:var(--serif);font-weight:700;display:flex;align-items:center;gap:9px}
.dot{width:11px;height:11px;border-radius:999px;display:inline-block}
.dot.offer{background:var(--acc)}
.dot.need{background:var(--warn)}
.mut{color:var(--mut)}.small{font-size:14.5px}
.msg{border-radius:12px;padding:13px 17px;margin:18px 0;font-size:15.5px}
.msg.ok{background:var(--acc2);border:1px solid #c9e3d6;color:var(--acc-d)}
.msg.err{background:var(--terra2);border:1px solid #f2d2c8;color:#9c3f22}
details{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:0;margin:12px 0;box-shadow:var(--shadow-sm)}
details summary{cursor:pointer;padding:16px 19px;font-weight:600;font-size:16.5px;font-family:var(--serif)}
details[open] summary{border-bottom:1px solid var(--line)}
details .ans{padding:8px 19px 18px;color:#3c4a50}
footer.site{border-top:1px solid var(--line);color:var(--mut);font-size:14px;padding:26px 0;margin-top:48px}
footer.site .fnav{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:10px}
.kv{display:flex;flex-wrap:wrap;gap:14px;margin:14px 0}
.kv>div{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:13px 18px;min-width:132px;box-shadow:var(--shadow-sm)}
.kv b{display:block;font-size:25px;font-weight:800;font-family:var(--serif);letter-spacing:-.01em}
.kv small{color:var(--mut)}
code{background:var(--bg2);padding:2px 7px;border-radius:7px;font-size:14px;word-break:break-all}
.syscard{display:flex;justify-content:space-between;gap:14px;align-items:center;flex-wrap:wrap}
.grp{margin:0 0 6px;font-weight:700}
.grp .mut{font-weight:400}
.nearnote{background:var(--acc2);color:var(--acc-d);border-radius:10px;padding:10px 14px;font-size:15px;margin:10px 0 16px}
.lang{position:relative;margin-left:6px}
.lang summary{list-style:none;cursor:pointer;color:var(--mut);font-size:14.5px;padding:6px 10px;border:1px solid var(--line);border-radius:9px;white-space:nowrap;background:#fff}
.lang summary::-webkit-details-marker{display:none}
.lang[open] summary{border-color:var(--acc);color:var(--acc)}
.langmenu{position:absolute;right:0;top:calc(100% + 8px);background:var(--card);border:1px solid var(--line);border-radius:12px;padding:6px;z-index:35;display:flex;flex-direction:column;min-width:185px;box-shadow:0 12px 30px rgba(32,51,58,.14)}
.langmenu a{padding:9px 11px;border-radius:8px;color:var(--fg);font-size:15.5px;white-space:nowrap}
.langmenu a:hover,.langmenu a.on{background:var(--acc2);text-decoration:none}
.langmenu a.on{font-weight:600;color:var(--acc)}
/* --- inicio: héroe, pasos y características --- */
.hero{padding:10px 0 2px}
.hero .eyebrow{display:inline-block;background:var(--acc2);color:var(--acc-d);font-size:12.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:5px 12px;border-radius:999px;margin-bottom:14px}
.hero h1{font-size:42px;max-width:15em}
.hero .lead{max-width:44em}
.hero-grid{display:grid;gap:26px;grid-template-columns:minmax(0,1fr);align-items:center}
.hero-grid>*,.grid>*,.steps>*,.feat>*{min-width:0}
@media(min-width:880px){.hero-grid.with-video{grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:34px}.hero-grid.with-video .videocard{max-width:360px;justify-self:center}.hero-grid.with-video .videocard video{max-height:600px}}
.videocard{margin:0}
.videocard video{display:block;width:100%;height:auto;border-radius:16px;border:1px solid var(--line);background:#0b1a17;box-shadow:var(--shadow)}
.videocard figcaption{margin-top:10px;font-size:14.5px;color:var(--mut);line-height:1.5}
.videocard figcaption b{color:var(--fg)}
.how-video{max-width:420px;margin:22px 0}
.how-video video{max-height:70vh}
.steps{display:grid;gap:16px;grid-template-columns:minmax(0,1fr);margin:18px 0}
@media(min-width:720px){.steps{grid-template-columns:repeat(2,minmax(0,1fr))}}
.step{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px;box-shadow:var(--shadow-sm)}
.step .n{width:34px;height:34px;border-radius:10px;background:var(--acc2);color:var(--acc-d);font-weight:800;display:grid;place-items:center;margin-bottom:12px;font-size:16px}
.step h3{margin:0 0 6px}
.step p{margin:0;font-size:15.5px;color:#3c4a50}
.feat{display:grid;gap:14px;grid-template-columns:minmax(0,1fr);margin:18px 0}
@media(min-width:720px){.feat{grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}}
.feat .item{display:flex;gap:12px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:15px 17px;box-shadow:var(--shadow-sm)}
.feat .item .ic{width:26px;height:26px;flex:0 0 26px;border-radius:8px;background:var(--acc2);color:var(--acc-d);display:grid;place-items:center;font-size:15px;font-weight:800}
.feat .item p{margin:0;font-size:15.5px;color:#3c4a50}
.why{margin:20px 0 26px;background:var(--acc2);border:1px solid var(--line);border-left:4px solid var(--acc-d);border-radius:14px;padding:20px 24px}
.why h3{margin:0 0 8px;font-size:17.5px;color:var(--acc-d)}
.why p{margin:0;font-size:16px;line-height:1.6;color:#2c3a40;max-width:70ch}
.pagehead{margin-bottom:4px}
.empty{border:1px dashed var(--line);border-radius:14px;padding:26px;text-align:center;color:var(--mut);background:var(--card)}
.note{display:inline-block;background:var(--warn2);border:1px solid #eddcb4;color:#7a5713;border-radius:10px;padding:9px 14px;font-size:15px}
.offer-card{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:16px 18px;margin:11px 0;box-shadow:var(--shadow-sm)}
.offer-card p{margin:8px 0 4px;font-size:16.5px}
.kv .chip{display:inline-flex;align-items:center;gap:8px}
@media(max-width:520px){.hero h1{font-size:33px}h1{font-size:30px}}
`;

export function layout(c, { title, body, user, sys, active = '', lang = 'es', flash = null, back = '/', canonical = '/', robots = 'index,follow' }) {
  const cur = LANGS.includes(lang) ? lang : LANGS[0];
  const langItems = LANGS.map((l) =>
    `<a href="/lang?to=${l}&back=${encodeURIComponent(back)}" class="${l === cur ? 'on' : ''}">${LANG_FLAGS[l] || ''} ${esc(LANG_NAMES[l] || l)}</a>`
  ).join('');
  const langNav = `<details class="lang"><summary>${LANG_FLAGS[cur] || ''} ${esc(cur.toUpperCase())}</summary><div class="langmenu">${langItems}</div></details>`;
  const sysHref = sys ? `/s/${esc(sys.slug)}` : '/';
  // Menú: Inicio (lista de grupos), Presentación (explicación) e Ideas/FAQ.
  // «Cómo funciona» vivía duplicado en /how; ahora es la propia presentación.
  const nav = [
    ['/', c.nav.home, 'home'],
    ['/presentacion', c.nav.presentation, 'presentation'],
    ['/ideas', c.nav.ideas, 'ideas'],
    ['/faq', c.nav.faq, 'faq'],
  ];
  if (sys) nav.push([sysHref, sys.name, 'sys']);
  let sessionLinks = '';
  if (user && sys) {
    sessionLinks = `<a href="/s/${esc(sys.slug)}/me">${esc(c.nav.profile)}</a>` +
      `<a href="/s/${esc(sys.slug)}/amarillas">${esc(c.nav.yellow)}</a>` +
      `<a href="/s/${esc(sys.slug)}/cuentas">${esc(c.nav.accounts)}</a>` +
      (user.is_admin ? `<a href="/s/${esc(sys.slug)}/admin">${esc(c.nav.admin)}</a>` : '') +
      `<a href="/logout">${esc(c.nav.logout)}</a>`;
  } else if (sys) {
    sessionLinks = `<a href="/s/${esc(sys.slug)}/amarillas">${esc(c.nav.yellow)}</a>` +
      `<a href="/s/${esc(sys.slug)}/cuentas">${esc(c.nav.accounts)}</a>` +
      `<a href="/">${esc(c.nav.home)}</a>`;
  } else {
    // sin sesión y sin sistema: el array nav ya cubre Inicio (/), la lista de grupos.
    sessionLinks = '';
  }
  const navHtml = nav.map(([h, t, k]) => `<a href="${h}" class="${active === k ? 'on' : ''}">${esc(t)}</a>`).join('');
  const flashHtml = flash
    ? `<div class="msg ${flash.ok ? 'ok' : 'err'}">${esc(flash.text)}</div>`
    : '';
  return `<!doctype html>
<html lang="${esc(lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — Lets System</title>
<meta name="description" content="${esc(c.meta.tagline)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${esc(robots)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Lets System">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(c.meta.tagline)}">
<meta property="og:url" content="${canonical}">
<meta name="theme-color" content="#236b5a">
<style>${CSS}</style>
</head>
<body>
<header class="site"><div class="wrap bar">
  <a class="brand" href="/"><span class="mark">L</span>Lets<span>System</span></a>
  <nav class="main">${navHtml}${sessionLinks}${langNav}
  </nav>
</div></header>
<main><div class="wrap">
${flashHtml}
${body}
</div></main>
<footer class="site"><div class="wrap">
  <nav class="fnav">
    <a href="/">${esc(c.nav.home)}</a>
    <a href="/presentacion">${esc(c.nav.presentation)}</a>
    <a href="/ideas">${esc(c.nav.ideas)}</a>
    <a href="/faq">${esc(c.nav.faq)}</a>
  </nav>
  <div>${esc(c.footer)}</div>
</div></footer>
</body>
</html>`;
}

/* Presentación: la única explicación «Cómo funciona». Antes había dos páginas
   casi iguales (/presentacion y /how); ahora /how redirige aquí. Lleva el vídeo,
   los 5 bloques de detalle y el resumen. */
export function presentationPage(c, { user, sys, lang, canCreate = false }) {
  const b = c.home;
  const p = c.presentation;
  const video = { es: 'como-funciona-lets', en: 'how-lets-works' }[lang] || null;
  // Las explicaciones, en tarjetas (una por bloque: número + título + texto).
  // El número lo pone el badge; el título ya no repite el «1. ».
  const detail = `<div class="steps">${c.how.blocks.map((x, i) => `
    <div class="step"><span class="n">${i + 1}</span><h3>${esc(x.h.replace(/^\d+\.\s*/, ''))}</h3><p>${esc(x.p)}</p></div>`).join('')}
  </div>`;
  const body = `
<section class="hero">
  <div class="hero-grid${video ? ' with-video' : ''}">
    <div class="hero-copy">
      <span class="eyebrow">LETS · Local Exchange Trading System</span>
      <h1>${esc(b.h1)}</h1>
      <p class="lead">${esc(b.lead)}</p>
      <div class="cta">
        <a class="btn primary" href="/">${esc(b.ctaJoin)}</a>
      </div>
    </div>${video ? `
    <figure class="card videocard">
      <video controls playsinline preload="metadata" poster="/media/${video}-poster.jpg" width="720" height="1280">
        <source src="/media/${video}.mp4" type="video/mp4">
        ${esc(b.videoTitle)} — <a href="/media/${video}.mp4">${esc(b.videoTitle)}</a>
      </video>
      <figcaption><b>${esc(b.videoTitle)}</b> · ${esc(b.videoCaption)}</figcaption>
    </figure>` : ''}
  </div>
</section>
<h2>${esc(c.how.title)}</h2>
<p class="lead">${esc(c.how.summary)}</p>
${detail}
<div class="why"><h3>${esc(b.why.h)}</h3><p>${esc(b.why.p)}</p></div>
<p class="small"><a href="/ideas">${esc(b.ctaIdeas)} →</a></p>
<p><a class="btn" href="/">${esc(b.ctaJoin)}</a>${canCreate ? ` <a class="btn sec" href="/systems/new">${esc(b.ctaNewSystem)}</a>` : ''}</p>`;
  return layout(c, { title: p.title, body, user, sys, active: 'presentation', lang, canonical: '/presentacion' });
}

/* Portada de una instancia viva con varios grupos: el visitante elige el suyo.
   La puerta de entrada es el grupo; la presentación (/presentacion) queda para
   la instancia recién instalada, cuando aún no hay ninguno. */
export function groupsLandingPage(c, { user, sys, lang, systems = [], canCreate = true, active = 'home' }) {
  const g = c.groupsLanding;
  const cards = groupCards(c, systems, { withJoin: true }) || `<p class="mut">${esc(c.systems.noResults)}</p>`;
  const howBtn = `<a class="btn sec sm" href="/presentacion">${esc(c.nav.presentation)}</a>`;
  const body = `
<section class="hero">
  <div class="hero-copy">
    <h1>${esc(g.h1)}</h1>
    <p class="lead">${esc(g.lead)}</p>
    <div class="cta">
      ${canCreate ? `<a class="btn sec" href="/systems/new">${esc(c.systems.create)}</a>` : ''}
      ${howBtn}
    </div>
  </div>
</section>
<div class="grid">${cards}</div>
${canCreate ? '' : `<p class="small mut">${esc(g.createHint)}</p>`}`;
  return layout(c, { title: g.h1, body, user, sys, active, lang, canonical: '/' });
}

export function faqPage(c, { user, sys, lang }) {
  const items = c.faq.items.map((x, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(x.q)}</summary><div class="ans">${esc(x.a)}</div></details>`).join('');
  const body = `<h1>${esc(c.faq.title)}</h1>${items}
<div class="cta"><a class="btn" href="/">${esc(c.home.ctaJoin)}</a></div>`;
  return layout(c, { title: c.faq.title, body, user, sys, active: 'faq', lang, canonical: '/faq' });
}

/* ---------- ideas para ofrecer ----------
   Lista hecha a mano con cosas que se pueden ofrecer. Sirve para quien cree
   que no tiene nada que dar: al leerla descubre cuántas cosas ya sabe hacer. */
export function ideasPage(c, { user, sys, lang }) {
  const g = c.ideas;
  const cats = g.categories.map((cat) => `
<div class="card">
  <h2 style="margin-top:6px">${esc(cat.title)}</h2>
  <ul class="idea">${cat.items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul>
</div>`).join('');
  const body = `
<h1>${esc(g.title)}</h1>
<p class="lead">${esc(g.lead)}</p>
${cats}
<div class="why"><h3>${esc(g.outroH)}</h3><p>${esc(g.outro)}</p></div>
<div class="cta"><a class="btn" href="/presentacion">${esc(c.nav.presentation)}</a><a class="btn sec" href="/">${esc(c.home.ctaSystems)}</a></div>`;
  return layout(c, { title: g.title, body, user, sys, active: 'ideas', lang, back: '/ideas', canonical: '/ideas' });
}

// Catálogo de grupos: misma página que la portada con varios grupos (una sola
// plantilla, sin listas duplicadas); solo cambia el resaltado del menú.
export function systemsPage(c, opts) {
  return groupsLandingPage(c, { ...opts, active: 'sys' });
}

export function newSystemPage(c, { user, sys, lang, error = null }) {
  const s = c.systems;
  const body = `
<h1>${esc(s.create)}</h1>
${error ? `<div class="msg err">${esc(error)}</div>` : ''}
<form method="post" action="/systems/new" class="card">
  <label>${esc(s.name)}</label><input name="name" required maxlength="80" value="">
  <div class="row two">
    <div><label>${esc(s.currency)}</label><input name="currency_name" required maxlength="30" value="Puntos"></div>
    <div><label>${esc(s.symbol)}</label><input name="currency_sym" required maxlength="6" value="✦"></div>
  </div>
  <div class="row two">
    <div><label>${esc(s.emoji)}</label><input name="currency_emoji" maxlength="8" placeholder="🌱"></div>
    <div><label>${esc(s.image)}</label><input name="currency_image" maxlength="500" placeholder="https://…"></div>
  </div>
  <p class="small mut">${esc(s.preview || '')}</p>
  <div class="row two">
    <div><label>${esc(s.welcome)}</label><input name="signup_bonus" type="number" step="1" value="10"></div>
    <div><label>${esc(s.limit)}</label><input name="credit_limit" type="number" step="1" value="100"></div>
  </div>
  <div class="row three">
    <div><label>${esc(s.city)}</label><input name="city" maxlength="80"></div>
    <div><label>${esc(s.postcode)}</label><input name="postcode" maxlength="12"></div>
    <div><label>${esc(s.country)}</label><input name="country" maxlength="60"></div>
  </div>
  <label>${esc(s.locale)}</label><input name="locale" maxlength="60" value="">
  <hr style="border:0;border-top:1px solid var(--line);margin:22px 0">
  <label>${esc(s.adminName)}</label><input name="admin_name" required maxlength="80">
  <label>${esc(s.adminEmail)}</label><input name="admin_email" type="email" required>
  <label>${esc(s.adminPass)}</label><input name="admin_pass" type="password" minlength="6" required>
  <p><button class="btn" type="submit">${esc(s.submit)}</button></p>
</form>`;
  return layout(c, { title: s.create, body, user, sys, active: 'sys', lang, back: '/systems/new', canonical: '/systems/new', robots: 'noindex,follow' });
}

function groupOffers(list, d, render) {
  const offered = list.filter((o) => o.kind !== 'necesito');
  const needed = list.filter((o) => o.kind === 'necesito');
  const section = (label, cls, rows) => rows.length
    ? `<div class="grouphead"><span class="dot ${cls}"></span>${esc(label)}</div>${rows.map(render).join('')}`
    : '';
  return section(d.typeOffer, 'offer', offered) + section(d.typeNeed, 'need', needed);
}

export function systemPage(c, { user, sys, lang, offers = [], members = [], flash = null, peers = [], peerOffers = [] }) {
  const renderOffer = (o) => `
    <div class="card">
      <span class="tag ${o.kind === 'necesito' ? 'need' : 'offer'}">${esc(o.kind === 'necesito' ? c.dashboard.typeNeed : c.dashboard.typeOffer)}</span>
      <p style="margin:8px 0 4px">${esc(o.text)}</p>
      <div class="small mut">${esc(o.name)} · ${esc((o.created_at || '').slice(0, 10))}</div>
    </div>`;
  const offersHtml = offers.length
    ? groupOffers(offers, c.dashboard, renderOffer)
    : `<p class="mut">${esc(c.dashboard.noOffers)}</p>`;
  const membersHtml = members.map((m) => `
    <tr><td>${esc(m.name)} ${m.is_admin ? `<span class="tag">${esc(c.common.adminTag)}</span>` : ''}</td>
    <td class="num">${m.balance} ${curHtml(sys, 16)}</td>
    <td class="small mut">${esc((m.created_at || '').slice(0, 10))}</td></tr>`).join('');
  const body = `
<h1>${curHtml(sys, 30)} ${esc(sys.name)}</h1>
<p class="mut">${esc(sys.locale || '')} · ${esc(sys.currency_name)} (${curHtml(sys, 18)})</p>
<div class="kv">
  <div><b>${sys.signup_bonus} ${curHtml(sys, 18)}</b><small>${esc(c.systems.welcome)}</small></div>
  <div><b>${sys.credit_limit} ${curHtml(sys, 18)}</b><small>${esc(c.systems.limit)}</small></div>
  <div><b>${members.length}</b><small>${esc(c.common.members)}</small></div>
</div>
<div class="cta">
  <a class="btn" href="/s/${esc(sys.slug)}/join">${esc(c.systems.join)}</a>
  <a class="btn sec" href="/s/${esc(sys.slug)}/login">${esc(c.nav.login)}</a>
</div>
<h2>${esc(c.dashboard.offers)}</h2>
${offersHtml}
<h2>${esc(c.dashboard.members)}</h2>
<table><thead><tr><th>${esc(c.common.user)}</th><th class="num">${esc(c.common.balance)}</th><th>${esc(c.common.createdAt)}</th></tr></thead>
<tbody>${membersHtml}</tbody></table>
${peers.length ? `<h2>${esc(c.systems.federated || 'Grupos federados')}</h2>
<p class="lead small">${esc(c.systems.fedNote)}</p>
<table><thead><tr><th>${esc(c.systems.fedGroup)}</th><th>${esc(c.systems.fedCurrency)}</th><th class="num">${esc(c.systems.fedRate)}</th></tr></thead><tbody>${
  peers.filter((f) => f.status === 'aceptada').map((f) => `<tr>
    <td>${esc(f.peer ? f.peer.name : '?')}</td>
    <td class="small mut">${f.peer ? esc(f.peer.currency_name) + ' (' + esc(f.peer.currency_sym) + ')' : ''}</td>
    <td class="num">${f.rate || 1}</td>
  </tr>`).join('')}</tbody></table>` : ''}`;
  return layout(c, { title: sys.name, body, user, sys, active: 'sys', lang, flash, canonical: `/s/${sys.slug}` });
}

export function joinPage(c, { user, sys, lang, error = null, back = null }) {
  const s = c.signup;
  const terms = c.terms.map((t) => `<li>${esc(t)}</li>`).join('');
  const body = `
<h1>${esc(sys.name)}</h1>
<p class="lead">${esc(s.intro)}</p>
${placeText(sys) ? `<div class="nearnote">📍 ${esc(s.location)}: <strong>${esc(placeText(sys))}</strong><br>${esc(s.farWarn)} <a href="/">${esc(c.nav.home)}</a></div>` : ''}
${error ? `<div class="msg err">${esc(error)}</div>` : ''}
<form method="post" action="/s/${esc(sys.slug)}/join" class="card">
  <label>${esc(s.name)}</label><input name="name" required maxlength="80">
  <div class="row two">
    <div><label>${esc(s.email)}</label><input name="email" type="email" required></div>
    <div><label>${esc(s.phone)}</label><input name="phone" maxlength="40"></div>
  </div>
  <label>${esc(s.password)}</label><input name="password" type="password" minlength="6" required>
  <h3>${esc(s.contractTitle)}</h3>
  <div class="card" style="background:var(--bg2)"><ol class="big" style="margin:0">${terms}</ol></div>
  <label style="display:flex;gap:10px;align-items:flex-start;font-weight:400;margin-top:16px">
    <input type="checkbox" name="accept" value="1" required style="width:auto;margin-top:4px">
    <span>${esc(s.accept)}</span>
  </label>
  <p><button class="btn" type="submit">${esc(s.submit)}</button></p>
</form>`;
  return layout(c, { title: s.title, body, user, sys, active: 'sys', lang, back: back || `/s/${sys.slug}/join`, canonical: `/s/${sys.slug}/join` });
}

export function loginPage(c, { user, sys, lang, error = null }) {
  const l = c.login;
  const body = `
<h1>${esc(l.title)} — ${esc(sys.name)}</h1>
${error ? `<div class="msg err">${esc(error)}</div>` : ''}
<form method="post" action="/s/${esc(sys.slug)}/login" class="card">
  <label>${esc(l.email)}</label><input name="email" type="email" required>
  <label>${esc(l.password)}</label><input name="password" type="password" required>
  <p><button class="btn" type="submit">${esc(l.submit)}</button></p>
</form>
<p><a href="/s/${esc(sys.slug)}/join">${esc(c.signup.title)}</a></p>`;
  return layout(c, { title: l.title, body, user, sys, active: 'sys', lang, canonical: `/s/${sys.slug}/login`, robots: 'noindex,follow' });
}

export function dashboardPage(c, { user, sys, lang, offers = [], members = [], myTx = [], flash = null, myAlert = null, peerOffers = [], fedGroups = [] }) {
  const d = c.dashboard;
  const opts = members.filter((m) => m.id !== user.id)
    .map((m) => `<option value="${m.id}">${esc(m.name)} — ${m.balance} ${esc(sys.currency_sym)}</option>`).join('');
  // socios de grupos integrados que aceptan nuestra moneda
  const fedOpts = fedGroups.map((g) => {
    const inn = g.members.map((m) => `<option value="${m.id}">${esc(g.system.name)} · ${esc(m.name)} — ${m.balance} ${esc(g.system.currency_sym)}</option>`).join('');
    return inn;
  }).join('');
  const renderOffer = (o) => `
    <div class="card"><span class="tag ${o.kind === 'necesito' ? 'need' : 'offer'}">${esc(o.kind === 'necesito' ? d.typeNeed : d.typeOffer)}</span>
    <p style="margin:8px 0 4px">${esc(o.text)}</p>
    <div class="small mut">${esc(o.name)} · ${esc((o.created_at || '').slice(0, 10))}</div></div>`;
  const offersHtml = offers.length ? groupOffers(offers, d, renderOffer) : `<p class="mut">${esc(d.noOffers)}</p>`;
  const renderPeerOffer = (o) => `
    <div class="card" style="border-left:4px solid var(--fed)"><span class="tag ${o.kind === 'necesito' ? 'need' : 'offer'}">${esc(o.kind === 'necesito' ? d.typeNeed : d.typeOffer)} · ${esc(o.system_name)}</span>
    <p style="margin:8px 0 4px">${esc(o.text)}</p>
    <div class="small mut">${esc(o.name)} · ${esc((o.created_at || '').slice(0, 10))}</div></div>`;
  const peerOffersHtml = peerOffers.length ? groupOffers(peerOffers, d, renderPeerOffer)
    : `<p class="mut">${esc(d.noPeerOffers || d.noOffers)}</p>`;
  const membersHtml = members.map((m) => `
    <tr><td>${esc(m.name)} ${m.is_admin ? `<span class="tag">${esc(c.common.adminTag)}</span>` : ''} ${m.id === user.id ? '←' : ''}</td>
    <td class="num">${m.balance} ${curHtml(sys, 16)}</td></tr>`).join('');
  const txHtml = myTx.map((t) => `
    <tr><td class="small">${esc((t.created_at || '').slice(0, 16).replace('T', ' '))}</td>
    <td>${esc(t.from_user === user.id ? d.transferTo + ' ' + (t.to_name || '') : (t.from_name || ''))}</td>
    <td>${esc(t.concept || '')}</td>
    <td class="num">${t.from_user === user.id ? '−' : '+'}${t.amount} ${curHtml(sys, 16)}</td></tr>`).join('');
  const body = `
<h1>${curHtml(sys, 30)} ${esc(d.title)} — ${esc(sys.name)}</h1>
<div class="kv">
  <div><b>${user.balance} ${curHtml(sys, 18)}</b><small>${esc(d.balance)}</small></div>
  <div><b>${user.points}</b><small>${esc(d.points)}</small></div>
  <div><b>${esc((user.contract_at || '').slice(0, 10) || '—')}</b><small>${esc(d.contractOk)} ${user.contract_hash ? `· <code>${esc(String(user.contract_hash).slice(0, 12))}…</code>` : ''}</small></div>
</div>
${user.is_admin ? `<p><a class="btn sec sm" href="/s/${esc(sys.slug)}/admin">${esc(c.nav.admin)}</a></p>` : ''}
${myAlert ? `<div class="msg err" style="border-left:6px solid var(--terra);background:var(--terra2)">
  <b>${esc(d.helpTitle)}</b>
  <p style="margin:8px 0 6px">${esc(d.helpBody)}</p>
  <div class="small mut">${esc(d.balance)}: ${user.balance} ${curHtml(sys, 16)} · ${esc(c.systems.limit)}: ${sys.credit_limit} ${curHtml(sys, 16)}</div>
</div>` : ''}

<h2>${esc(d.transfer)}</h2>
<form method="post" action="/s/${esc(sys.slug)}/transfer" class="card">
  <div class="row two">
    <div><label>${esc(d.transferTo)}</label><select name="to_user" required>${opts}</select></div>
    <div><label>${esc(d.transferAmount)}</label><input name="amount" type="number" min="1" step="1" required></div>
  </div>
  <label>${esc(d.transferConcept)}</label><input name="concept" maxlength="120">
  <p><button class="btn" type="submit">${esc(d.transferSubmit)}</button></p>
</form>
${fedOpts ? `<p class="small mut">${esc(d.fedPay)}</p>
<form method="post" action="/s/${esc(sys.slug)}/transfer" class="card" style="border-left:4px solid var(--fed)">
  <div class="row two">
    <div><label>${esc(d.transferTo)}</label><select name="to_user" required>${fedOpts}</select></div>
    <div><label>${esc(d.transferAmount)}</label><input name="amount" type="number" min="1" step="1" required></div>
  </div>
  <label>${esc(d.transferConcept)}</label><input name="concept" maxlength="120">
  <p><button class="btn sec" type="submit">${esc(d.transferSubmit)}</button></p>
</form>` : ''}

<h2>${esc(d.donate)}</h2>
<p class="small mut">${esc(d.donateIntro)}</p>
<form method="post" action="/s/${esc(sys.slug)}/donate" class="card" style="border-left:4px solid var(--warn)">
  <div class="row two">
    <div><label>${esc(d.donateTo)}</label><select name="to_user" required>${fedOpts || opts}</select></div>
    <div><label>${esc(d.transferAmount)}</label><input name="amount" type="number" min="1" step="1" required></div>
  </div>
  <label>${esc(d.donateNote)}</label><input name="concept" maxlength="120">
  <p><button class="btn sec" type="submit">${esc(d.donateSubmit)}</button></p>
</form>

<h2>${esc(d.newOffer)}</h2>
<form method="post" action="/s/${esc(sys.slug)}/offer" class="card">
  <label>${esc(d.offerText)}</label><textarea name="text" required maxlength="400"></textarea>
  <label>${esc(d.offerText)} — tipo</label>
  <select name="kind"><option value="ofrezco">${esc(d.typeOffer)}</option><option value="necesito">${esc(d.typeNeed)}</option></select>
  <p><button class="btn" type="submit">${esc(d.newOffer)}</button></p>
</form>

<h2>${esc(d.offers)}</h2>${offersHtml}
${peerOffers.length ? `<h2>${esc(d.fedOffers)}</h2>${peerOffersHtml}` : ''}
<h2>${esc(d.members)}</h2>
<table><thead><tr><th>${esc(c.common.user)}</th><th class="num">${esc(c.common.balance)}</th></tr></thead><tbody>${membersHtml}</tbody></table>
<h2>${esc(d.history)}</h2>
<table><thead><tr><th>${esc(c.common.date)}</th><th>${esc(c.common.to)}</th><th>${esc(c.common.concept)}</th><th class="num">${esc(c.common.amount)}</th></tr></thead>
<tbody>${txHtml || `<tr><td colspan="4" class="mut">—</td></tr>`}</tbody></table>`;
  return layout(c, { title: d.title, body, user, sys, active: 'sys', lang, flash, back: `/s/${sys.slug}/me`, canonical: `/s/${sys.slug}/me`, robots: 'noindex,follow' });
}

export function adminPage(c, { user, sys, lang, members = [], flash = null, error = null, alerts = [], peers = [], allSystems = [] }) {
  const a = c.admin;
  const alertsHtml = alerts.length
    ? `<table><thead><tr><th>${esc(c.common.user)}</th><th>Email</th><th class="num">${esc(a.debtLabel)}</th><th>${esc(c.common.date)}</th></tr></thead><tbody>${
        alerts.map((al) => `<tr><td>${esc(al.user_name)}</td><td class="small">${esc(al.user_email)}</td>
          <td class="num">${-Math.abs(al.debt)} ${curHtml(sys, 16)} <small class="mut">/ ${al.limit_val}</small></td>
          <td class="small mut">${esc((al.created_at || '').slice(0, 10))}</td></tr>`).join('')
      }</tbody></table>`
    : `<p class="mut">${esc(a.noAlerts)}</p>`;
  const membersHtml = members.map((m) => `
    <tr><td>${esc(m.name)} ${m.is_admin ? `<span class="tag">${esc(c.common.adminTag)}</span>` : ''}
        ${m.city || m.postcode ? `<div class="small mut">${esc([m.city, m.postcode].filter(Boolean).join(' · '))}</div>` : ''}</td>
    <td class="small">${esc(m.email)}</td>
    <td class="num">${m.balance} ${curHtml(sys, 16)}</td>
    <td class="num">${m.points}</td>
    <td class="small mut">${esc((m.contract_at || '').slice(0, 10) || '—')}</td></tr>`).join('');

  // socios agrupados por código postal, para decidir la división por cercanía
  const byPc = new Map();
  for (const m of members) {
    const k = (m.postcode || '—').trim() || '—';
    if (!byPc.has(k)) byPc.set(k, []);
    byPc.get(k).push(m);
  }
  const pcRows = [...byPc.entries()].sort((x, y) => y[1].length - x[1].length)
    .map(([pc, list]) => `<tr><td>${esc(pc)}</td><td class="num">${list.length}</td>
      <td class="small mut">${esc(list.slice(0, 6).map((m) => m.name).join(', '))}${list.length > 6 ? '…' : ''}</td></tr>`).join('');

  const overThreshold = members.length >= (sys.split_threshold || 9999);
  const peerOptions = allSystems.filter((s) => s.id !== sys.id)
    .map((s) => `<option value="${s.id}">${esc(s.name)} (${esc(s.currency_name)} ${esc(s.currency_sym)})</option>`).join('');
  const peersHtml = peers.length
    ? `<table><thead><tr><th>${esc(a.fedCurrency)}</th><th>${esc(a.fedCurrency)}</th>
        <th>${esc(a.fedRate)}</th><th>${esc(a.fedOffersCol)}</th><th>${esc(a.fedActions)}</th></tr></thead><tbody>${
        peers.map((f) => {
          const st = f.status === 'aceptada' ? `<span class="tag">${esc(a.fedAccepted)}</span>` : `<span class="tag">${esc(a.fedPending)}</span>`;
          const canManage = f.status === 'aceptada';
          return `<tr>
            <td>${esc(f.peer ? f.peer.name : '?')} ${st}</td>
            <td class="small mut">${f.peer ? esc(f.peer.currency_name) + ' (' + esc(f.peer.currency_sym) + ')' : ''}</td>
            <td class="num">${f.rate || 1}</td>
            <td class="small">${f.see_offers ? esc(a.fedYes) : esc(a.fedNo)}</td>
            <td>
              ${canManage ? `<form method="post" action="/s/${esc(sys.slug)}/admin" class="small">
                <input type="hidden" name="form" value="federation">
                <input type="hidden" name="fid" value="${f.id}">
                <input type="hidden" name="action" value="update">
                <label class="small"><input type="checkbox" name="accept_currency" value="1" ${f.accept_currency ? 'checked' : ''} style="width:auto"> ${esc(a.fedAcceptCur)}</label>
                <label class="small"><input type="checkbox" name="see_offers" value="1" ${f.see_offers ? 'checked' : ''} style="width:auto"> ${esc(a.fedSeeOffers)}</label>
                <input name="rate" type="number" step="0.01" min="0" value="${f.rate || 1}" style="width:90px">
                <button class="btn sm" type="submit">${esc(a.fedUpdate)}</button>
              </form>` : `<form method="post" action="/s/${esc(sys.slug)}/admin" class="small">
                <input type="hidden" name="form" value="federation">
                <input type="hidden" name="fid" value="${f.id}">
                <input type="hidden" name="action" value="accept">
                <button class="btn sm" type="submit">${esc(a.fedAccept)}</button>
              </form>`}
              <form method="post" action="/s/${esc(sys.slug)}/admin" class="small">
                <input type="hidden" name="form" value="federation">
                <input type="hidden" name="fid" value="${f.id}">
                <input type="hidden" name="action" value="revoke">
                <button class="btn sm sec" type="submit">${esc(a.fedRevoke)}</button>
              </form>
            </td></tr>`;
        }).join('')
      }</tbody></table>`
    : `<p class="mut">${esc(a.fedEmpty)}</p>`;

  const body = `
<h1>${esc(a.title)} — ${esc(sys.name)}</h1>
<p class="lead">${esc(a.feeNote)}</p>
<div class="kv">
  <div><b>${user.points}</b><small>${esc(a.myPoints)}</small></div>
  <div><b>${sys.admin_points_per_tx}</b><small>${esc(a.feeLabel)}</small></div>
  <div><b>${members.length}</b><small>${esc(c.common.members)}</small></div>
</div>
${error ? `<div class="msg err">${esc(error)}</div>` : ''}
<h2>${esc(a.settings)}</h2>
<form method="post" action="/s/${esc(sys.slug)}/admin" class="card">
  <div class="row two">
    <div><label>${esc(a.currencyLabel)}</label><input name="currency_name" value="${esc(sys.currency_name)}" maxlength="30"></div>
    <div><label>${esc(a.symbolLabel)}</label><input name="currency_sym" value="${esc(sys.currency_sym)}" maxlength="6"></div>
  </div>
  <div class="row two">
    <div><label>${esc(a.emojiLabel)}</label><input name="currency_emoji" value="${esc(sys.currency_emoji || '')}" maxlength="8" placeholder="🌱"></div>
    <div><label>${esc(a.imageLabel)}</label><input name="currency_image" value="${esc(sys.currency_image || '')}" maxlength="500" placeholder="https://…"></div>
  </div>
  <p class="small mut">${esc(a.currencyPreview)}: <b>10 ${curHtml(sys, 22)}</b></p>
  <div class="row two">
    <div><label>${esc(a.welcomeLabel)}</label><input name="signup_bonus" type="number" step="1" value="${sys.signup_bonus}"></div>
    <div><label>${esc(a.limitLabel)}</label><input name="credit_limit" type="number" step="1" value="${sys.credit_limit}"></div>
  </div>
  <label>${esc(a.feeLabel)}</label><input name="admin_points_per_tx" type="number" min="0" step="1" value="${sys.admin_points_per_tx}">
  <h3>${esc(a.locationTitle)}</h3>
  <div class="row two">
    <div><label>${esc(a.cityLabel)}</label><input name="city" value="${esc(sys.city || '')}" maxlength="80"></div>
    <div><label>${esc(a.countryLabel)}</label><input name="country" value="${esc(sys.country || '')}" maxlength="60"></div>
  </div>
  <div class="row two">
    <div><label>${esc(a.postcodeLabel)}</label><input name="postcode" value="${esc(sys.postcode || '')}" maxlength="12"></div>
    <div><label>${esc(a.splitThresholdLabel)}</label><input name="split_threshold" type="number" step="1" value="${sys.split_threshold || 100}"></div>
  </div>
  <p><button class="btn" type="submit">${esc(a.save)}</button></p>
</form>

<h2>${esc(a.fedTitle)}</h2>
<p class="lead">${esc(a.fedIntro)}</p>
${peersHtml}
<form method="post" action="/s/${esc(sys.slug)}/admin" class="card">
  <input type="hidden" name="form" value="federation">
  <input type="hidden" name="action" value="propose">
  <label>${esc(a.fedPeer)}</label><select name="peer_id" required>${peerOptions}</select>
  <div class="row two">
    <div><label>${esc(a.fedRate)}</label><input name="rate" type="number" step="0.01" min="0" value="1"></div>
    <div><label>&nbsp;</label>
      <label class="small" style="margin:4px 0"><input type="checkbox" name="accept_currency" value="1" style="width:auto"> ${esc(a.fedAcceptCur)}</label>
      <label class="small" style="margin:4px 0"><input type="checkbox" name="see_offers" value="1" style="width:auto"> ${esc(a.fedSeeOffers)}</label>
    </div>
  </div>
  <p><button class="btn" type="submit">${esc(a.fedPropose)}</button></p>
</form>

<h2>${esc(a.splitTitle)}</h2>
<p class="lead">${esc(a.splitIntro)}</p>
${overThreshold ? `<div class="msg note"><b>${esc(a.splitWarnLabel)}</b> (${members.length} ≥ ${sys.split_threshold}). ${esc(a.splitSugerir)}</div>` : ''}
<p class="small mut">${esc(a.membersCityIntro)}</p>
<table><thead><tr><th>${esc(a.postcodeCol)}</th><th class="num">${esc(c.common.members)}</th><th>${esc(c.common.user)}</th></tr></thead>
<tbody>${pcRows || `<tr><td colspan="3" class="mut">—</td></tr>`}</tbody></table>
<form method="post" action="/s/${esc(sys.slug)}/admin" class="card">
  <input type="hidden" name="form" value="split">
  <div class="row two">
    <div><label>${esc(a.splitPostcode)}</label><input name="postcode" required maxlength="12"></div>
    <div><label>${esc(a.splitName)}</label><input name="name" maxlength="60"></div>
  </div>
  <div class="row two">
    <div><label>${esc(a.splitCity)}</label><input name="city" maxlength="80"></div>
    <div><label>${esc(a.splitCountry)}</label><input name="country" maxlength="60"></div>
  </div>
  <p><button class="btn" type="submit">${esc(a.splitSubmit)}</button></p>
</form>

<h2>${esc(a.alertsTitle)}</h2>
<p class="lead">${esc(a.alertsIntro)}</p>
${alertsHtml}
<h2>${esc(a.membersTable)}</h2>
<table><thead><tr><th>${esc(c.common.user)}</th><th>Email</th><th class="num">${esc(c.common.balance)}</th><th class="num">${esc(c.common.points)}</th><th>${esc(c.dashboard.contractOk)}</th></tr></thead>
<tbody>${membersHtml}</tbody></table>`;
  return layout(c, { title: a.title, body, user, sys, active: 'sys', lang, flash, back: `/s/${sys.slug}/admin`, canonical: `/s/${sys.slug}/admin`, robots: 'noindex,follow' });
}

/* ---------- páginas amarillas ----------
   El directorio del sistema, separado por grupo. Cada grupo tiene las suyas;
   las de los grupos integrados aparecen aparte, con su nombre y su moneda. */
export function yellowPage(c, { user, sys, lang, kind = '', q = '', own = [], peers = [], peerOffers = [] }) {
  const y = c.yellow;
  const offerCard = (o, ext = null) => `
    <div class="card"><span class="tag ${o.kind === 'necesito' ? 'need' : 'offer'}">${esc(o.kind === 'necesito' ? c.dashboard.typeNeed : c.dashboard.typeOffer)}${ext ? ' · ' + esc(ext) : ''}</span>
    <p style="margin:8px 0 4px">${esc(o.text)}</p>
    ${o.price != null || o.price_note ? `<div class="small"><b>${o.price != null ? o.price + ' ' + curHtml(sys, 15) : ''}</b>${o.price != null && o.price_note ? ' · ' : ''}${esc(o.price_note || '')}</div>` : `<div class="small mut">${esc(y.freePrice)}</div>`}
    <div class="small mut">${esc(o.name)} · ${esc((o.created_at || '').slice(0, 10))}</div></div>`;
  const ownHtml = own.length ? own.map((o) => offerCard(o)).join('') : `<p class="mut">${esc(c.dashboard.noOffers)}</p>`;
  const peersHtml = peers.length
    ? peers.map((f) => {
        const list = peerOffers.filter((o) => o.system_id === f.peer_id);
        if (!list.length) return '';
        return `<h2>${esc(f.peer ? f.peer.name : '')} <span class="small mut">${esc(f.peer ? f.peer.currency_name : '')} (${f.peer ? f.peer.currency_sym : ''})</span></h2>
          <p class="lead small">${esc(y.peerIntro)}</p>${list.map((o) => offerCard(o, o.system_name)).join('')}`;
      }).join('')
    : `<p class="mut small">${esc(y.noPeers || '')}</p>`;
  const body = `
<h1>${esc(y.title)} — ${esc(sys.name)}</h1>
<p class="lead">${esc(y.intro)}</p>
<p class="small"><a href="/ideas">${esc(c.home.ctaIdeas)} →</a></p>
<form method="get" action="/s/${esc(sys.slug)}/amarillas" class="card">
  <div class="row two">
    <div><label>${esc(y.filterKind)}</label><select name="tipo">
      <option value="">${esc(y.all)}</option>
      <option value="ofrezco" ${kind === 'ofrezco' ? 'selected' : ''}>${esc(c.dashboard.typeOffer)}</option>
      <option value="necesito" ${kind === 'necesito' ? 'selected' : ''}>${esc(c.dashboard.typeNeed)}</option>
    </select></div>
    <div><label>${esc(y.search)}</label><input name="q" value="${esc(q)}" placeholder="${esc(y.searchPh)}"></div>
  </div>
  <p><button class="btn" type="submit">${esc(y.filter)}</button></p>
</form>
<h2>${esc(sys.name)}</h2>
<p class="lead small">${esc(y.ownIntro)}</p>
${ownHtml}
${peersHtml}`;
  return layout(c, { title: y.title, body, user, sys, active: 'sys', lang, back: `/s/${sys.slug}/amarillas`, canonical: `/s/${sys.slug}/amarillas` });
}

/* ---------- cuentas públicas ----------
   Todo el mundo puede ver los socios de cada sistema y sus saldos. Los correos
   no se muestran. Es la transparencia que sostiene la confianza del grupo. */
export function accountsPage(c, { user, sys, lang, members = [], totals = { positive: 0, negative: 0, net: 0 }, count = 0 }) {
  const a = c.accounts;
  const rows = members.map((m) => `
    <tr>
      <td>${esc(m.name)} ${m.is_admin ? `<span class="tag">${esc(c.common.adminTag)}</span>` : ''} ${user && m.id === user.id ? '←' : ''}
        ${m.city || m.postcode ? `<div class="small mut">${esc([m.city, m.postcode].filter(Boolean).join(' · '))}</div>` : ''}</td>
      <td class="num" style="${m.balance < 0 ? 'color:#a3341f' : ''}">${m.balance} ${curHtml(sys, 16)}</td>
      <td class="num">${m.points}</td>
      <td class="small mut">${esc((m.contract_at || '').slice(0, 10) || '—')}</td>
    </tr>`).join('');
  const body = `
<h1>${esc(a.title)} — ${esc(sys.name)}</h1>
<p class="lead">${esc(a.intro)}</p>
<div class="kv">
  <div><b>${count}</b><small>${esc(a.members)}</small></div>
  <div><b>${totals.positive}</b><small>${esc(a.totalPositive)}</small></div>
  <div><b>${totals.negative}</b><small>${esc(a.totalNegative)}</small></div>
  <div><b>${totals.net}</b><small>${esc(a.net)}</small></div>
</div>
<p class="small mut">${esc(a.balanceNote)}</p>
<table><thead><tr>
  <th>${esc(c.common.user)}</th><th class="num">${esc(c.common.balance)}</th>
  <th class="num">${esc(c.common.points)}</th><th>${esc(c.dashboard.contractOk)}</th>
</tr></thead>
<tbody>${rows || `<tr><td colspan="4" class="mut">—</td></tr>`}</tbody></table>
<p class="small mut">${esc(a.privacyNote)}</p>`;
  return layout(c, { title: a.title, body, user, sys, active: 'sys', lang, back: `/s/${sys.slug}/cuentas`, canonical: `/s/${sys.slug}/cuentas` });
}

export function simplePage(c, { title, text, user, sys, lang = 'es' }) {
  const body = `<h1>${esc(title)}</h1><p class="lead">${esc(text)}</p><p><a class="btn sec" href="/">${esc(c.nav.home)}</a></p>`;
  return layout(c, { title, body, user, sys, lang });
}
