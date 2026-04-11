# Funnel Menopausia

## Instruccion para Claude
Cada vez que implementes una nueva funcionalidad, modifiques la estructura del proyecto, añadas claves a app_config, cambies el comportamiento de algun componente o ruta, o realices cualquier cambio relevante: actualiza este CLAUDE.md automaticamente sin esperar a que el usuario lo pida. Mantener este archivo al dia es parte de cada tarea.

## Descripcion del Proyecto
Funnel de ventas para producto de bienestar en menopausia. Trafico desde Meta Ads.
Flujo: Landing captacion (nombre + email) -> VSL con reproductor restringido -> CTA hacia Comunidad de School.
Incluye dashboard de analiticas por lead, emails automaticos de abandono, y A/B testing de funnels.

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
- `src/app/page.tsx` — Landing de captacion: renderiza FunnelLanding (asigna funnel A/B automaticamente)
- `src/app/vsl/page.tsx` — Pagina VSL; lee config global de BD y override por funnel asignado en cookie
- `src/app/politica-cookies/page.tsx` — Politica de cookies (estatica, robots: noindex)
- `src/app/admin/` — Dashboard de admin (acceso en /admin, contrasena en ADMIN_PASSWORD)
- `src/app/admin/leads/page.tsx` — Lista de leads + boton exportar
- `src/app/admin/ab-testing/page.tsx` — Gestion y comparacion de funnels A/B: CRUD de variantes, stats por funnel, banner ganador
- `src/app/admin/settings/page.tsx` — Configuracion global: video URL, Facebook Pixel ID, School URL, Politica Privacidad, banner de cookies, email de contacto, flujo del funnel (skip landing), CTA timestamp (segundos), timeout de abandono (minutos), reset consentimiento cookies, cron manual
- `src/app/api/` — API routes
- `src/app/api/funnel/assign/route.ts` — GET: asigna funnel A/B aleatorio al visitante (cookie funnel_id), devuelve config del funnel
- `src/app/api/admin/funnels/route.ts` — GET: lista funnels; POST: crear funnel
- `src/app/api/admin/funnels/[id]/route.ts` — PATCH: editar funnel; DELETE: eliminar funnel
- `src/app/api/admin/ab-stats/route.ts` — GET: metricas comparativas por funnel (visitas, leads, VSL, CTA, conversiones)
- `src/app/api/admin/export/route.ts` — GET: exportar leads a CSV con filtros
- `src/app/api/config/public/route.ts` — GET publico (sin auth): devuelve privacy_url, privacy_link_text, cookie_banner_enabled, contact_email
- `src/app/api/track/pageview/route.ts` — POST anonimo: registra visita a landing en page_views (acepta funnelId)
- `src/components/funnel-landing.tsx` — Client component: llama a /api/funnel/assign, aplica config dinamica (titular, subtitulo, CTA text), renderiza LeadForm
- `src/components/video-player.tsx` — Reproductor restringido (NO adelantar)
- `src/components/facebook-pixel.tsx` — Pixel de Facebook: solo carga si cookie_consent=true en localStorage
- `src/components/pixel-loader.tsx` — Server component: lee fb_pixel_id de BD y pasa a FacebookPixel
- `src/components/cookie-banner.tsx` — Banner de consentimiento de cookies (aparece en primera visita)
- `src/components/landing-tracker.tsx` — Client component: dispara POST /api/track/pageview al montar (acepta funnelId prop)
- `src/components/lead-form.tsx` — Formulario con checkbox RGPD obligatorio; acepta funnelId y ctaText como props
- `src/components/admin/export-modal.tsx` — Modal de exportacion con filtros
- `src/db/schema.ts` — Esquema de BD (fuente de verdad): funnels, leads, video_events, lead_sessions, email_log, app_config, page_views
- `src/db/index.ts` — Conexion DB: usa TURSO_DATABASE_URL si existe, sino DATABASE_URL (local)
- `src/db/queries.ts` — Queries reutilizables incl. getLeadsForExport(), trackPageView(page, funnelId?), getFunnelStats()
- `src/lib/email-templates/` — Plantillas de email (6 segmentos de abandono)
- `src/lib/config.ts` — Config centralizada desde env vars
- `vercel.json` — Cron de abandono configurado (1x/dia a las 8am — free tier Vercel)
- `scripts/migrate-turso.ts` — Script de migracion para Turso

## Funcionalidades Implementadas
- **Landing** (`/`): Formulario nombre+email, captura UTMs, email bienvenida, redirige a /vsl; checkbox RGPD obligatorio con enlace a politica de privacidad configurable desde admin
- **A/B Testing de funnels** (`/admin/ab-testing`): Crear variantes con nombre, titular, subtitulo, texto CTA, video_url, school_url, cta_timestamp_seconds propios. Cada visitante es asignado aleatoriamente a un funnel activo (cookie funnel_id). Si hay un solo funnel activo, todos lo ven. Stats comparativas por funnel con banner del ganador, tabla y grafico de barras. El ganador se calcula por conversion global (visitas landing -> click CTA).
- **Tracking visitas landing**: LandingTracker dispara POST /api/track/pageview con funnelId; tabla page_views en BD; primer paso del embudo en admin
- **VSL** (`/vsl`): Reproductor restringido (no adelantar), CTA aparece en segundo configurable; override de video_url/school_url/cta_timestamp por funnel asignado
- **Tracking**: Eventos de video (play, pause, seek, timeupdate) guardados en BD por lead
- **Emails abandono**: 6 segmentos segun minuto de abandono, cron diario a las 8am
- **Admin dashboard** (`/admin`): Stats generales, embudo 5 pasos (landing visits -> leads -> VSL -> CTA mostrado -> CTA clickeado), heatmap de retencion
- **Admin leads** (`/admin/leads`): Tabla de leads con tiempo visto, CTA, emails; drill-down por lead con timeline completo de eventos
- **Exportacion CSV** (`/admin/leads` → boton "Exportar leads"): Filtros por fecha, tiempo minimo visto, etapa del funnel, emails enviados; preview de cantidad antes de exportar
- **Facebook Pixel**: Configurable desde /admin/settings (key fb_pixel_id en app_config) O via NEXT_PUBLIC_FB_PIXEL_ID; solo se carga tras aceptar cookies
- **School URL (CTA)**: Configurable desde /admin/settings (key school_url en app_config)
- **Politica de Privacidad**: URL y texto del enlace configurables desde /admin/settings (keys privacy_url, privacy_link_text en app_config)
- **Cookie banner**: Aparece en primera visita, "Aceptar todas" / "Solo necesarias"; consent guardado en localStorage; Facebook Pixel solo carga si consented
- **Pagina de cookies**: `/politica-cookies` con tabla detallada de cookies, base legal, instrucciones de gestion por navegador; email de contacto configurable desde admin
- **Cookie banner oculto en admin**: el banner no aparece en rutas /admin/* (el titular no necesita consentimiento)
- **Banner de cookies configurable**: activar/desactivar desde /admin/settings (key cookie_banner_enabled)
- **Email de contacto configurable**: editable desde /admin/settings (key contact_email); se muestra en /politica-cookies
- **Skip landing**: toggle en /admin/settings para redirigir directamente a /vsl sin mostrar la landing de captacion (key skip_landing)

## Esquema de BD
7 tablas:
- **funnels**: id, name, is_active, config (JSON), created_at — variantes A/B
- **leads**: id, full_name, email, funnel_id, utm_*, ip_address, user_agent, timestamps
- **video_events**: id, lead_id, session_id, event_type, timestamp_sec, metadata, created_at
- **lead_sessions**: id, lead_id, started_at, last_active_at, max_timestamp_sec, abandoned_at_sec, cta_shown, cta_clicked
- **email_log**: id, lead_id, email_type, template_key, sent_at, resend_id, status
- **app_config**: key, value, updated_at
- **page_views**: id, page, funnel_id, created_at

## A/B Testing — Como funciona
1. Crear variantes en `/admin/ab-testing` (al menos 2 activas para test real)
2. Cada visitante a `/` llama a `GET /api/funnel/assign` que asigna un funnel aleatorio y lo guarda en cookie `funnel_id` (30 dias)
3. `FunnelLanding` aplica el titular/subtitulo/CTA text del funnel asignado
4. `LeadForm` guarda `funnelId` con el lead al registrarse
5. `LandingTracker` guarda `funnelId` con la visita en `page_views`
6. `/vsl/page.tsx` lee la cookie `funnel_id` y aplica el `video_url`/`school_url`/`cta_timestamp_seconds` especifico del funnel (override sobre config global)
7. Stats en `/admin/ab-testing` muestran metricas separadas por funnel y el ganador

## Configuracion en BD (app_config)
Claves editables desde /admin/settings (valores globales, pueden ser sobreescritos por config de funnel A/B):
- `video_url` — URL del video VSL
- `fb_pixel_id` — Pixel ID de Facebook (puede estar vacio para desactivar)
- `school_url` — URL del CTA (comunidad School)
- `privacy_url` — URL de la politica de privacidad
- `privacy_link_text` — Texto visible del enlace de privacidad en el checkbox
- `cookie_banner_enabled` — "false" para desactivar el banner de cookies (por defecto activo)
- `contact_email` — Email de contacto mostrado en /politica-cookies (por defecto: info@natucoach.com)
- `skip_landing` — "true" para redirigir directamente a /vsl sin pasar por la landing
- `cta_timestamp_seconds` — Segundo del video donde aparece el CTA (fallback: env var CTA_TIMESTAMP_SECONDS)
- `abandonment_timeout_minutes` — Minutos de inactividad para considerar sesion abandonada (fallback: 30)

## Configuracion de Funnel A/B (campo config JSON en tabla funnels)
Claves configurables por variante (todas opcionales — si vacio usa el valor global):
- `landing_headline` — Titular principal de la landing
- `landing_subheadline` — Subtitulo/descripcion de la landing
- `landing_cta_text` — Texto del boton del formulario
- `video_url` — URL del video VSL especifica para esta variante
- `school_url` — URL del CTA especifica para esta variante
- `cta_timestamp_seconds` — Segundo de aparicion del CTA especifico para esta variante

## Convenciones
- Tiempos en BD: Unix timestamps (segundos)
- Timestamps de video: en segundos (REAL), no milisegundos
- UTMs se capturan de query params en landing y se guardan con el lead
- CTA_TIMESTAMP_SECONDS: env var para configurar cuando aparece el boton CTA
- Admin auth: password unico via ADMIN_PASSWORD env var (acceder en /admin)
- Todo el contenido de cara al usuario esta en espanol
- Cookie consent: localStorage key `cookie_consent` — null=no decidido, 'true'=aceptado, 'false'=rechazado
- Facebook Pixel: solo se carga si `cookie_consent === 'true'` (compliance RGPD/ePrivacy)
- Funnel asignado: cookie `funnel_id` (httpOnly=false para legibilidad client-side), 30 dias

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
