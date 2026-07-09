-- Seguridad premium: hosts webhook, integraciones solo vía API, idempotencia PayPal

-- 1. Validar host permitido en webhook_url (anti-SSRF)
CREATE OR REPLACE FUNCTION is_allowed_webhook_host(hostname text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN lower(hostname) IN (
      'hooks.zapier.com',
      'hook.eu1.make.com',
      'hook.eu2.make.com',
      'hook.us1.make.com',
      'hook.us2.make.com',
      'hook.integromat.com'
    ) THEN true
    WHEN lower(hostname) ~ '^hook[a-z0-9-]*\.make\.com$' THEN true
    ELSE false
  END;
$$;

CREATE OR REPLACE FUNCTION validate_webhook_url()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  host text;
BEGIN
  IF NEW.webhook_url IS NULL OR trim(NEW.webhook_url) = '' THEN
    RETURN NEW;
  END IF;

  IF NEW.webhook_url !~ '^https://' THEN
    RAISE EXCEPTION 'webhook_url debe usar HTTPS' USING ERRCODE = '22023';
  END IF;

  host := lower(substring(NEW.webhook_url from '^https://([^/:]+)'));

  IF host IS NULL OR host = '' THEN
    RAISE EXCEPTION 'webhook_url inválida' USING ERRCODE = '22023';
  END IF;

  IF host ~ '^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|metadata\.|169\.254\.)' THEN
    RAISE EXCEPTION 'webhook_url no permitida' USING ERRCODE = '22023';
  END IF;

  IF NOT is_allowed_webhook_host(host) THEN
    RAISE EXCEPTION 'webhook_url: host no permitido (usa Zapier o Make)' USING ERRCODE = '22023';
  END IF;

  RETURN NEW;
END;
$$;

-- 2. webhook_url y gtm_id solo modificables con service role (API servidor)
CREATE OR REPLACE FUNCTION protect_empresa_integration_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.jwt() ->> 'role', '') <> 'service_role' THEN
    IF NEW.webhook_url IS DISTINCT FROM OLD.webhook_url
      OR NEW.gtm_id IS DISTINCT FROM OLD.gtm_id THEN
      RAISE EXCEPTION 'Las integraciones solo se configuran desde el panel (API)'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_empresas_protect_integrations ON empresas;
CREATE TRIGGER trg_empresas_protect_integrations
  BEFORE UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION protect_empresa_integration_fields();

-- 3. Idempotencia de webhooks PayPal (evita doble procesamiento en reintentos)
CREATE TABLE IF NOT EXISTS paypal_webhook_events (
  transmission_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_paypal_webhook_events_processed_at
  ON paypal_webhook_events (processed_at DESC);

COMMENT ON TABLE paypal_webhook_events IS
  'Dedup de eventos PayPal por paypal-transmission-id';
