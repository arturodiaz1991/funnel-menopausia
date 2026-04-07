# Funnel Menopausia

## Descripcion del Proyecto
Funnel de ventas para producto de bienestar en menopausia. Trafico desde Meta Ads.
Flujo: Landing captacion (nombre + email) -> VSL con reproductor restringido -> CTA hacia Comunidad de School.
Incluye dashboard de analiticas por lead y emails automaticos de abandono.

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Base de datos**: SQLite + Drizzle ORM
- **Emails**: Resend + React Email
- **Auth tokens**: jose (JWT)
- **Deploy**: Vercel

## Comandos
- `npm run dev` — Servidor de desarrollo en puerto 3000
- `npm run build` — Build de produccion
- `npm run db:generate` — Generar migraciones Drizzle
- `npm run db:migrate` — Aplicar migraciones
- `npm run db:studio` — Abrir Drizzle Studio (explorar DB)

## Estructura Clave
- `src/app/page.tsx` — Landing de captacion (formulario)
- `src/app/vsl/page.tsx` — Pagina VSL (reproductor + CTA)
- `src/app/admin/` — Dashboard de admin
- `src/app/api/` — API routes
- `src/components/video-player.tsx` — Reproductor restringido (NO adelantar)
- `src/db/schema.ts` — Esquema de BD (fuente de verdad)
- `src/lib/email-templates/` — Plantillas de email React

## Convenciones
- Tiempos en BD: Unix timestamps (segundos)
- Timestamps de video: en segundos (REAL), no milisegundos
- UTMs se capturan de query params en landing y se guardan con el lead
- CTA_TIMESTAMP_SECONDS: env var para configurar cuando aparece el boton CTA
- Admin auth: password unico via ADMIN_PASSWORD env var
- Todo el contenido de cara al usuario esta en espanol

## Variables de Entorno
Ver `.env.example`. Criticas:
- DATABASE_URL, RESEND_API_KEY, ADMIN_PASSWORD, CTA_TIMESTAMP_SECONDS
- SCHOOL_COMMUNITY_URL, CRON_SECRET, JWT_SECRET

## Reglas del Reproductor de Video
1. NUNCA permitir adelantar el video (forward seek prohibido)
2. Controles permitidos: play, pause, volumen, retroceder
3. Sin controles nativos del navegador (controls=false)
4. maxReachedTime rastrea el punto mas lejano visto
5. CTA aparece solo cuando currentTime >= CTA_TIMESTAMP_SECONDS
