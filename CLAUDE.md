# Funnel Menopausia

## Descripcion del Proyecto
Funnel de ventas para producto de bienestar en menopausia. Trafico desde Meta Ads.
Flujo: Landing captacion (nombre + email) -> VSL con reproductor restringido -> CTA hacia Comunidad de School.
Incluye dashboard de analiticas por lead y emails automaticos de abandono.

## Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Base de datos**: Turso (libSQL remoto en produccion) / SQLite local en dev via `@libsql/client`
- **Emails**: Resend (mock si no hay API key real — logea en consola)
- **Auth tokens**: jose (JWT en cookie)
- **Deploy**: Vercel (via GitHub — ver seccion Deploy)

## Comandos
- `npm run dev` — Servidor de desarrollo en puerto 3000
- `npm run build` — Build de produccion
- `npm run db:generate` — Generar migraciones Drizzle
- `npm run db:migrate` — Aplicar migraciones (SQLite local)
- `npm run db:studio` — Abrir Drizzle Studio (explorar DB)
- `npx tsx scripts/migrate-turso.ts` — Aplicar migraciones a Turso remoto (requiere TURSO_DATABASE_URL y TURSO_AUTH_TOKEN)

## Estructura Clave
- `src/app/page.tsx` — Landing de captacion (formulario + LandingTracker)
- `src/app/vsl/page.tsx` — Pagina VSL (reproductor + CTA); lee video_url y school_url de BD
- `src/app/politica-cookies/page.tsx` — Politica de cookies (estatica, robots: noindex)
- `src/app/admin/` — Dashboard de admin (acceso en /admin, contrasena en ADMIN_PASSWORD)
- `src/app/admin/leads/page.tsx` — Lista de leads + boton exportar
- `src/app/admin/settings/page.tsx` — Configuracion: video URL, Facebook Pixel ID, School URL, Politica Privacidad (URL + texto enlace), cron manual
- `src/app/api/` — API routes
- `src/app/api/admin/export/route.ts` — GET: exportar leads a CSV con filtros
- `src/app/api/config/public/route.ts` — GET publico (sin auth): devuelve privacy_url y privacy_link_text
- `src/app/api/track/pageview/route.ts` — POST anonimo: registra visita a landing en page_views
- `src/components/video-player.tsx` — Reproductor restringido (NO adelantar)
- `src/components/facebook-pixel.tsx` — Pixel de Facebook: solo carga si cookie_consent=true en localStorage
- `src/components/pixel-loader.tsx` — Server component: lee fb_pixel_id de BD y pasa a FacebookPixel
- `src/components/cookie-banner.tsx` — Banner de consentimiento de cookies (aparece en primera visita)
- `src/components/landing-tracker.tsx` — Client component: dispara POST /api/track/pageview al montar
- `src/components/lead-form.tsx` — Formulario con checkbox RGPD obligatorio (muestra error si no marcado)
- `src/components/admin/export-modal.tsx` — Modal de exportacion con filtros
- `src/db/schema.ts` — Esquema de BD (fuente de verdad): leads, video_events, lead_sessions, email_log, app_config, page_views
- `src/db/index.ts` — Conexion DB: usa TURSO_DATABASE_URL si existe, sino DATABASE_URL (local)
- `src/db/queries.ts` — Queries reutilizables incl. getLeadsForExport(), trackPageView(), getFunnelStats() (con landingVisits)
- `src/lib/email-templates/` — Plantillas de email (6 segmentos de abandono)
- `src/lib/config.ts` — Config centralizada desde env vars
- `vercel.json` — Cron de abandono configurado (1x/dia a las 8am — free tier Vercel)
- `scripts/migrate-turso.ts` — Script de migracion para Turso

## Funcionalidades Implementadas
- **Landing** (`/`): Formulario nombre+email, captura UTMs, email bienvenida, redirige a /vsl; checkbox RGPD obligatorio con enlace a politica de privacidad configurable desde admin
- **Tracking visitas landing**: LandingTracker dispara POST /api/track/pageview; tabla page_views en BD; primer paso del embudo en admin
- **VSL** (`/vsl`): Reproductor restringido (no adelantar), CTA aparece en minuto configurable; school_url leida de BD
- **Tracking**: Eventos de video (play, pause, seek, timeupdate) guardados en BD por lead
- **Emails abandono**: 6 segmentos segun minuto de abandono, cron diario a las 8am
- **Admin dashboard** (`/admin`): Stats generales, embudo 5 pasos (landing visits -> leads -> VSL -> CTA mostrado -> CTA clickeado), heatmap de retencion
- **Admin leads** (`/admin/leads`): Tabla de leads con tiempo visto, CTA, emails; drill-down por lead con timeline completo de eventos
- **Exportacion CSV** (`/admin/leads` → boton "Exportar leads"): Filtros por fecha, tiempo minimo visto, etapa del funnel, emails enviados; preview de cantidad antes de exportar
- **Facebook Pixel**: Configurable desde /admin/settings (key fb_pixel_id en app_config) O via NEXT_PUBLIC_FB_PIXEL_ID; solo se carga tras aceptar cookies
- **School URL (CTA)**: Configurable desde /admin/settings (key school_url en app_config)
- **Politica de Privacidad**: URL y texto del enlace configurables desde /admin/settings (keys privacy_url, privacy_link_text en app_config)
- **Cookie banner**: Aparece en primera visita, "Aceptar todas" / "Solo necesarias"; consent guardado en localStorage; Facebook Pixel solo carga si consented
- **Pagina de cookies**: `/politica-cookies` con tabla detallada de cookies, base legal, instrucciones de gestion por navegador

## Configuracion en BD (app_config)
Claves editables desde /admin/settings:
- `video_url` — URL del video VSL
- `fb_pixel_id` — Pixel ID de Facebook (puede estar vacio para desactivar)
- `school_url` — URL del CTA (comunidad School)
- `privacy_url` — URL de la politica de privacidad
- `privacy_link_text` — Texto visible del enlace de privacidad en el checkbox

## Convenciones
- Tiempos en BD: Unix timestamps (segundos)
- Timestamps de video: en segundos (REAL), no milisegundos
- UTMs se capturan de query params en landing y se guardan con el lead
- CTA_TIMESTAMP_SECONDS: env var para configurar cuando aparece el boton CTA
- Admin auth: password unico via ADMIN_PASSWORD env var (acceder en /admin)
- Todo el contenido de cara al usuario esta en espanol
- Cookie consent: localStorage key `cookie_consent` — null=no decidido, 'true'=aceptado, 'false'=rechazado
- Facebook Pixel: solo se carga si `cookie_consent === 'true'` (compliance RGPD/ePrivacy)

## Variables de Entorno
Ver `.env.example`. Todas las variables necesarias:

### Desarrollo (.env.local)
- `DATABASE_URL=file:./db/funnel.db` — SQLite local
- `TURSO_DATABASE_URL=` — Dejar vacio en dev
- `TURSO_AUTH_TOKEN=` — Dejar vacio en dev

### Produccion (Vercel dashboard)
- `TURSO_DATABASE_URL=libsql://funnel-menopausia-arturo-dito.aws-eu-west-1.turso.io`
- `TURSO_AUTH_TOKEN=<token>` — Token de Turso
- `RESEND_API_KEY=re_xxxxx` — Key de Resend para emails reales
- `ADMIN_PASSWORD=<contrasena>` — Contrasena del dashboard admin
- `JWT_SECRET=<secreto-aleatorio>` — Secreto para tokens JWT
- `CRON_SECRET=<secreto>` — Para autenticar llamadas al cron
- `CTA_TIMESTAMP_SECONDS=1500` — Segundo del video donde aparece el CTA
- `NEXT_PUBLIC_CTA_TIMESTAMP_SECONDS=1500` — Idem (publico para el cliente)
- `SCHOOL_COMMUNITY_URL=https://...` — URL de la comunidad de School (fallback si no hay en BD)
- `NEXT_PUBLIC_SCHOOL_COMMUNITY_URL=https://...` — Idem (publico, fallback)
- `NEXT_PUBLIC_BASE_URL=https://funnel-menopausia-app.vercel.app`
- `NEXT_PUBLIC_FB_PIXEL_ID=` — ID del Pixel de Facebook (fallback si no hay en BD; opcional)

## Reglas del Reproductor de Video
1. NUNCA permitir adelantar el video (forward seek prohibido)
2. Controles permitidos: play, pause, volumen, retroceder
3. Sin controles nativos del navegador (controls=false)
4. maxReachedTime rastrea el punto mas lejano visto (se guarda en localStorage)
5. CTA aparece solo cuando currentTime >= CTA_TIMESTAMP_SECONDS (no por tiempo en pagina)

## Compliance Legal (RGPD / LSSI-CE / ePrivacy)
- **Politica de Privacidad**: checkbox obligatorio en formulario; URL y texto configurables desde admin
- **Politica de Cookies**: pagina estatica en /politica-cookies con tabla de cookies por tipo
- **Cookie banner**: consentimiento previo al rastreo; Facebook Pixel no carga sin aceptacion
- **Terminos y Condiciones**: no obligatorios para landing de captacion de leads (sin e-commerce)
- **AEPD**: en caso de reclamacion, dirigir a https://www.aepd.es

## Deploy: Como subir a Vercel

**IMPORTANTE**: El CLI de Vercel (`vercel deploy`) NO funciona desde Windows con Next.js 16 + Turbopack.
El build local falla con `NEXT_MISSING_LAMBDA` en rutas de admin. Hay que usar GitHub.

### Proceso correcto (una sola vez):
1. Repo en GitHub: https://github.com/arturodiaz1991/funnel-menopausia (publico)
2. Proyecto en Vercel: https://vercel.com/arturodiaz1991-4263s-projects/funnel-menopausia-app
3. URL de produccion: https://funnel-menopausia-app.vercel.app
4. Cada `git push` despliega automaticamente

**IMPORTANTE al crear proyecto nuevo en Vercel**: Usar cuenta personal (no el equipo) para evitar restricciones del plan Hobby. El repo debe ser publico o estar en la cuenta personal.

### Actualizaciones futuras:
Una vez conectado GitHub, cada `git push` despliega automaticamente.

### Cron de abandono:
- Configurado en `vercel.json`: se ejecuta 1x/dia a las 8am (limite del free tier)
- Para ejecutar manualmente: ir a /admin/settings y usar el boton "Ejecutar cron de abandono"

### Base de datos Turso:
- Ya creada y con migraciones aplicadas
- URL: `libsql://funnel-menopausia-arturo-dito.aws-eu-west-1.turso.io`
- Token en `.env.local` (no subir a git — ya esta en .gitignore)
- Si se modifica el schema, correr: `npm run db:generate` y luego `npx tsx scripts/migrate-turso.ts`
