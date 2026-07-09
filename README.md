# SolarFlow

SaaS B2B para instaladoras solares en España: simulador embebible + CRM.

## Stack

Next.js 15 · Supabase · PayPal Subscriptions · Tailwind

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar credenciales (ver .env.example)
npm run dev
```

## Base de datos

Ejecutar en Supabase SQL Editor (en orden, ver `SECURITY.md`):

1. `supabase/migrations/001_initial_schema.sql` (o `003_repair_partial_schema.sql`)
2. Migraciones `002`–`010` según `SECURITY.md`
3. `supabase/seed/localidades.sql`

## Desplegar en Vercel

1. Subir repo a GitHub (`.env.local` no se sube)
2. Importar en [vercel.com](https://vercel.com)
3. Variables de entorno: copiar todas las de `.env.example` con valores reales
4. `NEXT_PUBLIC_APP_URL` = URL de Vercel (ej. `https://solarflow.vercel.app`)
5. En Supabase → Auth → URL Configuration: añadir la URL de Vercel
6. PayPal webhook: `https://tu-dominio.vercel.app/api/paypal/webhook`

## Estructura

```
src/app/          # páginas y API routes
src/components/   # UI, dashboard, widget
src/lib/          # solar calculator, supabase, config
supabase/         # migraciones SQL y seed
```
