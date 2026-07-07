# Seguridad — SolarFlow

## Modelo de datos

- **Multi-tenant** con Row Level Security (RLS) en Supabase.
- **Leads** solo insertables vía API con service role (no desde el cliente anon).
- **Campos de facturación** (`plan`, `estado_suscripcion`, límites, PayPal) solo modificables con service role.
- **Widget público** carga datos de empresa solo en el servidor (service role), sin exponer filas completas al anon key.
- **Límite de equipo** aplicado en API y en base de datos (trigger).
- **Invitaciones** gestionadas por API; aceptación verifica email y sesión.

## Migraciones de seguridad

Ejecutar en Supabase SQL Editor, en orden:

1. `001_initial_schema.sql`
2. `002_empresas_select_owner.sql`
3. `004_webhook_integrations.sql` (+ extensión **pg_net**)
4. **`005_security_hardening.sql`** — endurecimiento RLS, cuota atómica, protección de facturación
5. **`006_plan_feature_gating.sql`** — webhooks salientes solo en plan Pro
6. **`007_team_limit_enforcement.sql`** — límite de usuarios por plan en `equipo` e `invitaciones_equipo`

> Si el proyecto se creó con `003_repair_partial_schema.sql`, omitir 001 y usar 003 en su lugar.

## Autenticación

- Registro con **confirmación de email** (`signUp` + enlace de verificación).
- Callback: `/auth/callback` — configurar en Supabase Auth redirect URLs.
- Middleware usa `getUser()` y bloquea el dashboard sin email confirmado.
- Página `/verify-email` con reenvío de confirmación.

## Invitaciones de equipo

- Crear: `POST /api/empresa/team/invite` (admin, rate limit).
- Aceptar: `/invite/[token]` + `POST /api/invite/[token]/accept`.
- Registro con invitación: `/register?invite=[token]`.

## PayPal

- Webhooks verificados con `PAYPAL_WEBHOOK_ID` y firma PayPal (rechazo fail-secure si falta configuración).
- Activación/upgrade/downgrade verifica la suscripción en la API de PayPal antes de actualizar la BD.
- Rate limit: 15 req/min por IP en rutas PayPal.

## Webhooks salientes (Zapier/Make)

- URLs validadas por host permitido (HTTPS, sin credenciales embebidas).
- En desarrollo se permite `webhook.site` para pruebas.
- Plan Pro obligatorio (API + trigger en BD).

## Rate limiting

| Ruta | Límite |
|------|--------|
| `/api/leads` | 20/min por IP |
| `/api/auth/register` | 5/hora por IP |
| `/api/auth/resend-confirmation` | 3/hora por IP |
| `/api/empresa/team/invite` | 20/hora por usuario |
| `/api/empresa/*` (mutaciones) | 10–30/min por IP |
| `/api/paypal/*` (excepto webhook) | 15/min por IP |
| `/api/invite/*` | 10–30/min por IP/token |

Para producción a escala, usar **Vercel Firewall** o **Upstash Redis**.

## CSRF

- Mutaciones API verifican `Origin`/`Referer` contra `NEXT_PUBLIC_APP_URL`.
- Cookies Supabase con SameSite=Lax.

## Variables sensibles

Copiar `.env.example` a `.env.local`. Obligatorias en producción:

- `SUPABASE_SERVICE_ROLE_KEY` — solo servidor
- `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`
- `NEXT_PUBLIC_APP_URL` — URL canónica HTTPS

## Plan de prueba

- `/api/empresa/activate-test` bloqueado en producción salvo `ALLOW_TEST_PLAN=true`.

## Checklist de despliegue

- [ ] Migraciones 005, 006 y 007 aplicadas en Supabase
- [ ] Supabase Auth: confirmación de email activada
- [ ] Redirect URL `https://tu-dominio/auth/callback` en Supabase
- [ ] `PAYPAL_WEBHOOK_ID` configurado en Vercel
- [ ] `NEXT_PUBLIC_APP_URL` apunta a producción (no localhost)
- [ ] `ALLOW_TEST_PLAN` no activo en producción

## Pendiente recomendado

- [ ] Rate limiting distribuido (Upstash)
- [ ] Auditoría de logs de acceso a leads (RGPD)
- [ ] Rotación periódica de claves API
