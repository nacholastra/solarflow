-- Webhooks solo para plan Pro

CREATE OR REPLACE FUNCTION notify_lead_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  target_url text;
  empresa_plan plan_suscripcion;
  payload jsonb;
BEGIN
  SELECT webhook_url, plan INTO target_url, empresa_plan
  FROM empresas
  WHERE id = NEW.empresa_id;

  IF empresa_plan IS DISTINCT FROM 'pro' THEN
    RETURN NEW;
  END IF;

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
    RAISE WARNING 'Lead webhook failed for empresa %: %', NEW.empresa_id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Limpiar integraciones Pro en empresas Basic existentes
UPDATE empresas
SET gtm_id = NULL, webhook_url = NULL
WHERE plan IS DISTINCT FROM 'pro'
  AND (gtm_id IS NOT NULL OR webhook_url IS NOT NULL);
