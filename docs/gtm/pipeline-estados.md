# Estados del pipeline

Usar en la columna `estado` de [`pipeline.csv`](./pipeline.csv):

| Estado | Significado | Cuenta para meta |
|--------|-------------|------------------|
| `prospecto` | Identificado, aún sin respuesta | No |
| `conversacion` | Respuesta humana cualificada | Sí → conversaciones |
| `demo_agendada` | Fecha de demo puesta | Sí (conversación) |
| `demo_hecha` | Demo ≥ 15 min realizada | Sí → demos |
| `trial` | Registrado en trial | Sí (conversación) |
| `pago` | PayPal activo | Sí → pagos |
| `churn` | Pagó y canceló | Anotar aparte |
| `descartado` | No ICP / no interesado | No |
| `nurture` | Más adelante (fecha en notas) | Conversación solo si respondió |

## Cómo contar rápido (Excel / Sheets)

1. Importar o abrir el CSV.
2. Conversaciones = filas con estado en `conversacion`, `demo_agendada`, `demo_hecha`, `trial`, `pago`, `nurture` (si hubo respuesta).
3. Demos = filas con `demo_hecha` o `pago` (si hubo demo) + las que tengan `demo_fecha` rellena.
4. Pagos = filas con `estado = pago`.

Meta día 90: **≥ 50 / ≥ 10 / ≥ 3**.
