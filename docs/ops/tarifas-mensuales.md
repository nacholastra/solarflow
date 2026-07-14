# Actualización mensual de tarifas (simulador)

Flujo **semi-automático**: el sistema propone; vos publicás.

## Qué hace el sistema

1. Día **1 de cada mes** (cron Vercel `0 7 1 * *`) → `GET /api/cron/propose-tariffs`
2. Crea un **borrador** `YYYY-MM` copiando el periodo activo (no cambia el simulador).
3. En **Admin → Tarifas** revisás números y pulsás **Activar y propagar**.
4. Se actualizan todas las `localidades` (energía, peajes, IEE, factor de vertido, etc.). Canarias conserva IGIC.

## Qué tenés que hacer vos

1. Ejecutar migración `015_tarifas_periodicas.sql` en Supabase.
2. Configurar `CRON_SECRET` en Vercel (mismo que expire-trials).
3. Opcional: `TARIFF_ENERGY_PRICE_EUR_KWH` — si está, la propuesta automática usa ese precio de energía.
4. Cada mes (~día 1–5): entrar a `/admin/tarifas`, ajustar si hace falta, activar.

## Fuentes sugeridas (manual)

- Precio energía: media retail / referencias ESIOS-OMIE (aprox.)
- Peajes/cargos: cambios CNMC (suele ser anual)
- IEE / IVA: solo si hay reforma legal

## No se actualiza mes a mes

- `produccion_kwh_kwp_anual` (PVGIS): revisar cada 1–3 años
- `precio_eur_kwp` por empresa: lo configura el cliente

## Smoke test tras activar

1. Abrir widget de una empresa de prueba
2. Simular Valencia / Canarias
3. Crear lead de prueba y revisar ROI en CRM
