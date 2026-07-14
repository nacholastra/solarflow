-- Tarifas periódicas (mensuales) con borrador → activar → propagar a localidades

CREATE TABLE IF NOT EXISTS parametros_tarifa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo text NOT NULL UNIQUE,
  precio_energia_medio numeric NOT NULL DEFAULT 0.13,
  peaje_te_medio numeric NOT NULL DEFAULT 0.034,
  cargo_sistema_medio numeric NOT NULL DEFAULT 0.029,
  precio_potencia_kw_mes numeric NOT NULL DEFAULT 0.08,
  alquiler_contador_mes numeric NOT NULL DEFAULT 0.81,
  iee_pct numeric NOT NULL DEFAULT 0.05112696,
  iva_pct numeric NOT NULL DEFAULT 21,
  precio_vertido_factor numeric NOT NULL DEFAULT 0.5
    CHECK (precio_vertido_factor >= 0 AND precio_vertido_factor <= 1),
  estado text NOT NULL DEFAULT 'draft'
    CHECK (estado IN ('draft', 'active', 'archived')),
  fuente text,
  notas text,
  propuesta_automatica boolean NOT NULL DEFAULT false,
  activated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS parametros_tarifa_one_active
  ON parametros_tarifa (estado)
  WHERE estado = 'active';

ALTER TABLE localidades
  ADD COLUMN IF NOT EXISTS iee_pct numeric NOT NULL DEFAULT 0.05112696,
  ADD COLUMN IF NOT EXISTS precio_vertido_factor numeric NOT NULL DEFAULT 0.5;

COMMENT ON TABLE parametros_tarifa IS 'Periodos de tarifas del simulador. Solo uno active; al activar se propaga a localidades.';
COMMENT ON COLUMN localidades.iee_pct IS 'IEE aplicado en desglose de factura (propagado desde parametros_tarifa).';
COMMENT ON COLUMN localidades.precio_vertido_factor IS 'Fracción del precio de compra usada como compensación de excedentes.';

ALTER TABLE parametros_tarifa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parametros_tarifa_select_public" ON parametros_tarifa;
CREATE POLICY "parametros_tarifa_select_public" ON parametros_tarifa
  FOR SELECT USING (true);

-- Semilla inicial desde parametros_tarifa_anual activo (si existe) o valores por defecto
INSERT INTO parametros_tarifa (
  periodo,
  precio_energia_medio,
  peaje_te_medio,
  cargo_sistema_medio,
  precio_potencia_kw_mes,
  iee_pct,
  iva_pct,
  precio_vertido_factor,
  estado,
  fuente,
  notas,
  activated_at
)
SELECT
  COALESCE(anio::text || '-01', to_char(now(), 'YYYY-MM')),
  precio_energia_medio,
  peaje_te_medio,
  cargo_sistema_medio,
  precio_potencia_kw_mes,
  iee_pct,
  iva_pct,
  0.5,
  'active',
  'migración desde parametros_tarifa_anual',
  'Periodo inicial activo',
  now()
FROM parametros_tarifa_anual
WHERE activo = true
ORDER BY anio DESC
LIMIT 1
ON CONFLICT (periodo) DO NOTHING;

-- Si no había fila anual, crear periodo del mes actual
INSERT INTO parametros_tarifa (
  periodo, estado, fuente, notas, activated_at
)
SELECT
  to_char(now(), 'YYYY-MM'),
  'active',
  'migración 015',
  'Periodo inicial por defecto',
  now()
WHERE NOT EXISTS (SELECT 1 FROM parametros_tarifa WHERE estado = 'active')
ON CONFLICT (periodo) DO UPDATE
SET estado = 'active',
    activated_at = COALESCE(parametros_tarifa.activated_at, now()),
    updated_at = now()
WHERE parametros_tarifa.estado <> 'active';

-- Propagar el activo a todas las localidades
UPDATE localidades l
SET
  precio_energia_kwh = p.precio_energia_medio,
  peaje_te_kwh = p.peaje_te_medio,
  cargo_sistema_kwh = p.cargo_sistema_medio,
  precio_potencia_kw_mes = p.precio_potencia_kw_mes,
  alquiler_contador_mes = p.alquiler_contador_mes,
  iva_pct = CASE WHEN l.usa_igic THEN l.iva_pct ELSE p.iva_pct END,
  iee_pct = p.iee_pct,
  precio_vertido_factor = p.precio_vertido_factor,
  updated_at = now()
FROM parametros_tarifa p
WHERE p.estado = 'active';
