-- Early bird: descuento de lanzamiento para los primeros clientes

ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS early_bird boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS early_bird_discount_pct int;

COMMENT ON COLUMN empresas.early_bird IS 'True si la empresa entró en la oferta de los primeros N clientes.';
COMMENT ON COLUMN empresas.early_bird_discount_pct IS 'Porcentaje de descuento early bird bloqueado al registrarse (ej. 30).';
