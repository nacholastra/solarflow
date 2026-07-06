# Seguridad — SolarFlow

## Modelo de datos

- **Multi-tenant** con Row Level Security (RLS) en Supabase.
- **Leads** solo insertables vía API con service role (no desde el cliente anon).
- **Campos de facturación** (`plan`, `estado_suscripcion`, límites, PayPal) solo modificables con service role.
- **Widget público** carga datos de empresa solo en el servidor (service role), sin exponer filas completas al anon key.

## Migraciones de seguridad

Ejecutar en Supabase SQL Editor, en orden:

1. `001_initial_schema.sql`
2. `002_empresas_select_owner.sql`
3. `004_webhook_integrations.sql` (+ extensión **pg_net**)
4. **`005_security_hardening.sql`** — endurecimiento RLS, cuota atómica, protección de facturación

## PayPal

- Webhooks verificados con `PAYPAL_WEBHOOK_ID` y firma PayPal.
- Activación/upgrade de plan verifica la suscripción en la API de PayPal antes de actualizar la BD.

## Webhooks salientes (Zapier/Make)

- URLs validadas por host permitido (HTTPS).
- En desarrollo se permite `webhook.site` para pruebas.

## Rate limiting

- `/api/leads`: 20 req/min por IP (en memoria, best-effort en serverless).
- `/api/auth/register`: 5 req/hora por IP.

Para producción a escala, usar **Vercel Firewall** o **Upstash Redis**.

## Variables sensibles

Nunca commitear `.env.local`. Obligatorias en producción:

- `SUPABASE_SERVICE_ROLE_KEY` — solo servidor
- `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`
- `NEXT_PUBLIC_APP_URL` — URL canónica

## Plan de prueba

- `/api/empresa/activate-test` bloqueado en producción salvo `ALLOW_TEST_PLAN=true`.

## Pendiente recomendado

- [ ] Verificación de email en registro (Supabase Auth)
- [ ] Rate limiting distribuido (Upstash)
- [ ] Auditoría de logs de acceso a leads (RGPD)
- [ ] Rotación periódica de claves API
