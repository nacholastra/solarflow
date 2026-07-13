-- Periodo de prueba y aceptación de términos

ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

COMMENT ON COLUMN empresas.trial_ends_at IS 'Fin del periodo de prueba gratuito (14 días). NULL si tiene suscripción PayPal activa.';
COMMENT ON COLUMN empresas.terms_accepted_at IS 'Fecha en que el titular aceptó los términos de servicio al registrarse.';
