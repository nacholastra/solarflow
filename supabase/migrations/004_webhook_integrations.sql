-- Webhooks: URL por empresa + notificación automática al crear leads
-- Requiere extensión pg_net (Supabase Dashboard → Database → Extensions → pg_net)

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS webhook_url text;

COMMENT ON COLUMN empresas.webhook_url IS
  'URL de webhook (Zapier, Make, etc.) para recibir nuevos leads vía POST JSON';

-- Envía POST asíncrono cuando se inserta un lead y la empresa tiene webhook_url
CREATE OR REPLACE FUNCTION notify_lead_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  target_url text;
  payload jsonb;
BEGIN
  SELECT webhook_url INTO target_url
  FROM empresas
  WHERE id = NEW.empresa_id;

  IF target_url IS NULL OR trim(target_url) = '' THEN
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'event', 'lead.created',
    'lead', to_jsonb(NEW)
  );

  PERFORM net.http_post(
    url := target_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'User-Agent', 'SolarFlow-Webhook/1.0'
    ),
    body := payload
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- No bloquear la inserción del lead si falla el webhook
    RAISE WARNING 'Lead webhook failed for empresa %: %', NEW.empresa_id, SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_webhook ON leads;

CREATE TRIGGER trg_leads_webhook
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_lead_webhook();
