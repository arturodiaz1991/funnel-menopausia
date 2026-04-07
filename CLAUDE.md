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
- `src/app/page.tsx` — Landing de captacion (formulario)
- `src/app/vsl/page.tsx` — Pagina VSL (reproductor + CTA)
- `src/app/admin/` — Dashboard de admin (acceso en /admin, contrasena en ADMIN_PASSWORD)
- `src/app/api/` — API routes
- `src/components/video-player.tsx` — Reproductor restringido (NO adelantar)
- `src/components/facebook-pixel.tsx` — Pixel de Facebook (se inyecta en layout global)
- `src/db/schema.ts` — Esquema de BD (fuente de verdad)
- `src/db/index.ts` — Conexion DB: usa TURSO_DATABASE_URL si existe, sino DATABASE_URL (local)
- `src/lib/email-templates/` — Plantillas de email (6 segmentos de abandono)
- `src/lib/config.ts` — Config centralizada desde env vars
- `vercel.json` — Cron de abandono configurado (1x/dia a las 8am — free tier Vercel)
- `scripts/migrate-turso.ts` — Script de migracion para Turso

## Convenciones
- Tiempos en BD: Unix timestamps (segundos)
- Timestamps de video: en segundos (REAL), no milisegundos
- UTMs se capturan de query params en landing y se guardan con el lead
- CTA_TIMESTAMP_SECONDS: env var para configurar cuando aparece el boton CTA
- Admin auth: password unico via ADMIN_PASSWORD env var (acceder en /admin)
- Todo el contenido de cara al usuario esta en espanol
- Facebook Pixel: se activa poniendo NEXT_PUBLIC_FB_PIXEL_ID en env vars; si esta vacio no carga

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
- `SCHOOL_COMMUNITY_URL=https://...` — URL de la comunidad de School
- `NEXT_PUBLIC_SCHOOL_COMMUNITY_URL=https://...` — Idem (publico)
- `NEXT_PUBLIC_BASE_URL=https://funnel-menopausia-app.vercel.app`
- `NEXT_PUBLIC_FB_PIXEL_ID=` — ID del Pixel de Facebook (opcional)

## Reglas del Reproductor de Video
1. NUNCA permitir adelantar el video (forward seek prohibido)
2. Controles permitidos: play, pause, volumen, retroceder
3. Sin controles nativos del navegador (controls=false)
4. maxReachedTime rastrea el punto mas lejano visto (se guarda en localStorage)
5. CTA aparece solo cuando currentTime >= CTA_TIMESTAMP_SECONDS (no por tiempo en pagina)

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
