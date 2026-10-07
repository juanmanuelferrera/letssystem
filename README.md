# Lets System — plataforma de intercambio local (LETS)

**LETS** = *Local Exchange Trading System*: un sistema de intercambio local en el que
un grupo de personas intercambia servicios, conocimientos y objetos **sin usar dinero**,
llevando la cuenta con una **moneda propia** del grupo.

Esta web es **una instancia** de ese sistema: la monta **una sola persona (su
administrador)**, que crea **uno o varios grupos**, cada uno con su propia comunidad,
su propia moneda y su propio reglamento. Los grupos pueden **federarse** (aceptarse las
monedas) o no: eso lo deciden sus administradores.

> **Un software, una instancia, un administrador, muchos grupos.**
> El que instala el software es el administrador de su instancia: crea los grupos y los
> administra todos. Los grupos son **hermanos**, no jerarquía: ninguno está dentro de
> otro. Se crean cuando hacen falta —por distancia o por número de socios— y pueden
> federarse de mutuo acuerdo.

## Cómo funciona

- **Una instancia = un administrador.** Quien monta la web (tú) es el único admin de
  *esa* instancia. Nadie de fuera crea grupos ni administra los tuyos.
- **La instancia nace vacía.** No trae grupos de ejemplo: el primero que entra crea su
  grupo y queda como administrador. A partir de ahí, solo el admin crea más grupos.
- **La portada lleva al grupo.** La página de inicio no es un escaparate: sirve a quien
  ya conoce el sistema y solo quiere entrar en su grupo. Con **un** grupo, `/` entra
  **directo** en él; con **varios**, `/` muestra **la lista para elegir el tuyo**; solo
  cuando aún **no hay ninguno** (instancia recién instalada) aparece la página de
  presentación. Las explicaciones (`/presentacion`, `/faq`, `/ideas`) siguen en el menú.
- **Grupos hermanos**: creas uno al instalar y luego más cuando haga falta. Cada grupo
  tiene su moneda, su bono de bienvenida, su límite de crédito y su ubicación (ciudad,
  país, CP). Ninguno está dentro de otro.
- **Crear y dividir grupos = solo el admin.** Cuando un grupo crece, se pueden mover los
  socios de un código postal a un grupo nuevo, que arranca con su propia identidad y
  queda integrado con el original.
- **Federación opcional**: dos grupos pueden **aceptarse la moneda** y verse las ofertas
  entre sí. Se propone y se acepta desde el panel; nunca es automático.
- **Autonomía real**: tu instancia es tuya. Tus datos no salen de tus manos.

## Qué incluye

- **Varios grupos** conviviendo, cada uno con su moneda (nombre y símbolo), su bono de
  bienvenida, su límite de crédito y su ubicación.
- **Moneda propia por grupo**: p. ej. *Puntos ✦*, *Semillas ❋*, *Granos ●*.
- **Alta fácil**: formulario corto + **contrato digital** que se firma con un clic
  (queda guardada una huella digital —SHA-256— del contrato de cada socio).
- **Bono de bienvenida** configurable (por defecto 10 unidades al entrar).
- **Pagos entre socios** con control de **límite de crédito**.
- **Tablero de ofertas y necesidades** por grupo.
- **Administrador** con panel propio: ajusta la moneda, el bono, el límite, los puntos
  por transacción, la ubicación y **crea o divide grupos** cuando crece la comunidad.
- **Federación** entre grupos: aceptar la moneda del otro y ver sus ofertas.
- **Explicación de cómo funciona el LETS** y **FAQ** completa.
- **Multi-idioma**: **español, inglés, francés y portugués**, con selector en la
  cabecera. El idioma por defecto se elige al instalar (`LETS_LANG`).

## Por qué no es un banco de tiempo

Merece la pena decirlo claro, porque es la confusión más común: **esto no es un
banco de tiempo.**

Los bancos de tiempo miden el intercambio en **horas**: da igual quién seas, una
hora tuya vale una hora mía. Sobre el papel suena igualitario, pero **en la
práctica no funciona**, porque **el tiempo de cada persona no vale lo mismo**:

- La hora de un **especialista** (un abogado, un médico, un traductor, un músico,
  un profesor) no vale lo mismo que la hora de una tarea sencilla.
- Al tratar como iguales cosas que no lo son, **quien más aporta se siente
  tratado injustamente** y acaba dejando de participar.
- Resultado: el sistema se vacía por arriba — se van los que más tienen que dar,
  y solo queda lo más fácil de conseguir en cualquier sitio.

Por eso este sistema **no cuenta horas**: usa una **moneda propia de la comunidad**
en la que **cada intercambio vale lo que las dos partes acuerdan libremente**. Una
persona puede cobrar más por una hora de su especialidad y menos por una tarea
sencilla, sin que nadie le imponga una equivalencia falsa. Así cada uno recibe algo
justo por lo que da, y el sistema se sostiene porque a todos les compensa.

La diferencia con el trueque es otra: aquí no hace falta que coincidan dos personas
en el tiempo; la unidad de cuenta permite pagar hoy a una persona y cobrar mañana de
otra.

---

## Instalar tu propia instancia

El despliegue son **dos piezas, las dos gratis: GitHub y Cloudflare.** Nada de Docker,
servidores ni contenedores.

### 0. Clona a un repositorio **privado** tuyo

El repositorio solo lleva **el programa, sin datos**: no hay socios, ni saldos, ni
configuración privada. Aun así, **clónalo en un repositorio privado tuyo**: tu
instancia es tuya y no tiene por qué ser pública.

En GitHub, el camino más simple:

1. Crea un repositorio **privado** nuevo en tu cuenta (botón **New → Private**).
2. Sube el código del software a ese repo (o usa **Import a repository**).
3. Cloudflare se conectará a **ese** repo tuyo, no al original.

> **Por qué privado**: la instancia la controla una sola persona — tú. Al ser tu
> copia, tú eres el administrador único. Mantener el repo privado evita que nadie más
> se apunte a administrar tu instancia por sorpresa.

### 1. Publícala en Cloudflare (gratis, sin servidor)

Corre en **Cloudflare Workers**: **gratis, sin servidor, sin disco que mantener y sin
tarjeta de crédito**. Las vistas y los textos (`src/views.mjs`, `src/content.mjs`) se
reutilizan tal cual; el acceso a datos usa un **Durable Object con SQLite**.

- **Datos**: un único Durable Object (`Ledger`) con SQLite — **persistente y gratis**.
- **Config**: `wrangler.toml` (`main = worker/index.mjs`, binding `LEDGER`, migración `v1`).
- **Código**: `worker/index.mjs` (router) · `worker/ledger.mjs` (dominio y datos) ·
  `worker/schema.mjs` (esquema y utilidades).

```bash
npx wrangler login    # una vez: abre el navegador para autorizar tu cuenta
npx wrangler dev      # probar en local (emula el Durable Object + SQLite)
npx wrangler deploy   # publicar en https://letssystem.<tu-subdominio>.workers.dev
```

La instancia se publica **vacía**. `GET /api/stats` responde cuántos grupos hay (sirve
para comprobar que la web está viva).

### 2. Crear el primer grupo (y tu cuenta de administrador)

Se hace **desde la propia web**:

1. Entra en tu URL y ve a **`/systems/new`** («Crear un grupo»).
2. Rellena el nombre del grupo, su moneda y **tus datos de administrador**
   (nombre, correo y contraseña de 6+ caracteres).
3. Al enviarlo, **tú quedas como administrador** de ese grupo, se te abona el bono de
   bienvenida y entras en tu panel (`/s/<slug>/admin`).

Desde ahí ya puedes configurar la moneda, el bono, el límite, los puntos por
transacción y la ubicación; y **crear más grupos** cuando haga falta. Los socios
siguientes se apuntan solos desde `/s/<slug>/join`.

> **Nota**: la puerta para crear grupos está cerrada a todos salvo el administrador.
> La única excepción es el **arranque**: si la instancia aún no tiene ningún grupo,
> quien entra puede crear el primero y queda como admin. A partir de ahí, cerrada.

### Correrla en tu máquina (opcional)

Requiere **Node.js 22.5+** (recomendado 24 LTS). Usa el SQLite integrado
(`node:sqlite`): **no hay dependencias que instalar**.

```bash
./start.sh                          # arranque en un paso (instancia vacía)
```

O a mano:

```bash
node --no-warnings src/server.mjs   # http://127.0.0.1:4173
```

Variables de entorno: `PORT` (4173), `HOST` (127.0.0.1), `LETS_DB` (ruta del fichero
SQLite), `LETS_LANG` (es|en|fr|pt). Copia `.env.example` a `.env` para fijarlas.

**Datos de ejemplo (solo para pruebas locales).** Los datos demo (dos grupos con sus
socios y ofertas) **no** se cargan solos: la instancia nace vacía también en local. Si
los quieres para probar sin montar un grupo real:

```bash
SEED=1 ./start.sh                   # carga los datos de ejemplo y arranca
# o directamente:
node --no-warnings src/seed.mjs     # carga los datos de ejemplo (idempotente)
```

Cuentas de ejemplo (contraseña `demo1234`): `admin@mantrayoga.local` (admin de *Mantra
Yoga Alicante*), `ana@example.com` (socia), `admin@huerta.local` (admin de *Huerta de
Cabezuelo*).

---

## Coste: qué es gratis y qué no

- **El software (este repositorio) — gratis y libre, siempre.** Licencia **MIT**
  (ver [`LICENSE`](LICENSE)): puedes copiarlo, modificarlo, regalarlo o venderlo
  sin pagar nada a nadie. No tiene dependencias npm (usa solo Node y Cloudflare),
  así que no hay licencias de terceros ni suscripciones por usarlo.
- **GitHub (dónde vive tu código) — gratis.** El plan **GitHub Free** incluye
  repositorios **privados ilimitados**, colaboradores ilimitados y Actions.
  **Recomendado: privado** (es tu instancia). Los datos de los socios **nunca**
  están en GitHub: viven en el Durable Object.
- **La web en Cloudflare — gratis.** El Durable Object con SQLite entra en el plan
  gratuito, con datos persistentes. Sin servidor que mantener ni tarjeta.

Resumen: **software 0 €, GitHub 0 € y la web 0 €.**

## Estructura

```
worker/          versión Cloudflare Workers (reutiliza las vistas y los textos):
  index.mjs        router HTTP
  ledger.mjs       dominio y datos en un Durable Object con SQLite
  schema.mjs       esquema y utilidades del SQLite del Durable Object
wrangler.toml    config de Cloudflare Workers (binding LEDGER, migración v1)
src/content.mjs  todo el texto de la web en ES/EN/FR/PT (editable sin tocar el código)
src/views.mjs    plantillas HTML
src/db.mjs       esquema y acceso a datos local (node:sqlite) — para correr con Node
src/server.mjs   servidor HTTP local y rutas (incluye /healthz)
src/seed.mjs     datos de ejemplo (solo para pruebas locales, a propósito)
src/reset.mjs    reinicia la base de datos local
start.sh         arranque local en un paso (comprueba Node y sirve)
LICENSE          licencia MIT (software libre)
data/lets.db     base de datos local (no se versiona)
```

## Rutas principales

- `/` — portada: entra directo al grupo si hay uno, elige si hay varios, y presentación
  solo si aún no hay ninguno · `/faq` — preguntas frecuentes
- Vídeo explicativo: en `/presentacion` (uno por idioma: ES/EN)
- `/ideas` — ideas y casos de uso
- `/presentacion` — presentación y explicación («Cómo funciona») · `/systems/new` — crear un grupo (solo el admin)
- `/s/<slug>` — página del grupo · `/s/<slug>/join` — apuntarse y firmar
- `/s/<slug>/me` — panel del socio · `/s/<slug>/admin` — administración y federación
- `/api/stats` — cuántos grupos hay (comprobación de salud) · `/healthz` — «ok»
- `/lang?to=es|en|fr|pt` — cambio de idioma

## Modelo de datos

`systems` (grupos: slug, nombre, moneda, bono, límite, puntos por transacción,
ubicación) · `users` (grupo, saldo, puntos, contrato y su huella, rol admin) ·
`transactions` (origen, destino, importe, concepto, tipo) ·
`offers` (ofrezco / necesito) · `federation` (grupos federados y sus monedas) ·
`sessions`.

## Aviso

Proyecto en desarrollo. La FAQ recoge la postura del proyecto sobre los impuestos
(se pueden cobrar, pero tendrían que cobrarse en la moneda del sistema, que al no ser
de curso legal multiplica la riqueza comunitaria). No es asesoramiento fiscal.
