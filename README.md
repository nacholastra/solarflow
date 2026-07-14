# SolarFlow

SaaS B2B para instaladoras solares en España: simulador embebible + CRM.

**Versión 1.0** — listo para producción con periodo de prueba, legal, emails y CI.

## Stack

Next.js 15 · Supabase · PayPal Subscriptions · Resend · Tailwind

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar credenciales
npm run dev
```

## Base de datos

Ejecutar en Supabase SQL Editor (en orden, ver `SECURITY.md`):

1. `supabase/migrations/001_initial_schema.sql` (o `003_repair_partial_schema.sql`)
2. Migraciones `002`–`014` según `SECURITY.md`
3. `supabase/seed/localidades.sql`

## Desplegar en Vercel

1. Subir repo a GitHub
2. Importar en [vercel.com](https://vercel.com)
3. Variables de entorno: copiar todas las de `.env.example` con valores reales
4. `NEXT_PUBLIC_APP_URL` = URL de producción
5. Supabase → Auth → redirect URL: `https://tu-dominio/auth/callback`
6. PayPal webhook: `https://tu-dominio/api/paypal/webhook`
7. Resend: configurar dominio y `RESEND_API_KEY` para emails

## CI

GitHub Actions ejecuta `lint`, `typecheck` y `build` en cada push/PR (`.github/workflows/ci.yml`).

## Estructura

```
src/app/          # páginas y API routes
src/components/   # UI, dashboard, widget, legal
src/lib/          # solar calculator, supabase, email, config
supabase/         # migraciones SQL y seed
```

## Lanzamiento

Checklist completo en `SECURITY.md`. Páginas legales: `/terminos`, `/privacidad`, `/aviso-legal`, `/cookies`, `/dpa`. Centro de ayuda: `/ayuda`.

## Validación comercial (90 días)

Kit go-to-market España (outreach, demo, pipeline, kill/expand): ver [`docs/gtm/README.md`](docs/gtm/README.md).

Objetivo: ≥ 50 conversaciones → ≥ 10 demos → ≥ 3 pagos antes de pivotar país o producto.

## Tarifas del simulador

Actualización mensual semi-automática: [`docs/ops/tarifas-mensuales.md`](docs/ops/tarifas-mensuales.md). Admin: `/admin/tarifas`.
