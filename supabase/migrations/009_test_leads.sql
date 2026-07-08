-- Leads de prueba: no consumen cuota y se pueden borrar del CRM

-- 1. Marca de lead de prueba (simulaciones internas desde el Dashboard)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS es_prueba boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN leads.es_prueba IS
  'true = simulación de prueba hecha por la empresa; no consume cuota mensual';

-- 2. La verificación de cuota ignora los leads de prueba
CREATE OR REPLACE FUNCTION check_lead_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  emp RECORD;
BEGIN
  -- Los leads de prueba nunca se bloquean por cuota
  IF NEW.es_prueba THEN
    RETURN NEW;
  END IF;

  SELECT estado_suscripcion, leads_usados_mes, leads_limite_mes
  INTO emp
  FROM empresas
  WHERE id = NEW.empresa_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Empresa no encontrada' USING ERRCODE = '23503';
  END IF;

  -- Modo preview / prueba: permitir sin cuota si la empresa no está activa
  IF emp.estado_suscripcion <> 'active' THEN
    RETURN NEW;
  END IF;

  IF emp.leads_usados_mes >= emp.leads_limite_mes THEN
    RAISE EXCEPTION 'Límite de leads alcanzado' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

-- 3. El contador mensual no aumenta con leads de prueba
CREATE OR REPLACE FUNCTION increment_leads_usados()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.es_prueba THEN
    RETURN NEW;
  END IF;

  UPDATE empresas
  SET leads_usados_mes = leads_usados_mes + 1,
      updated_at = now()
  WHERE id = NEW.empresa_id
    AND estado_suscripcion = 'active';
  RETURN NEW;
END;
$$;

-- 4. Los leads de prueba no disparan el webhook de integraciones (no son reales)
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
  IF NEW.es_prueba THEN
    RETURN NEW;
  END IF;

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
    RAISE WARNING 'Lead webhook failed for empresa %: %', NEW.empresa_id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 5. Permitir a los miembros de la empresa borrar sus leads (p. ej. los de prueba)
DROP POLICY IF EXISTS "leads_delete_member" ON leads;
CREATE POLICY "leads_delete_member" ON leads
  FOR DELETE USING (user_belongs_to_empresa(empresa_id));

-- Índice para filtrar/borrar leads de prueba rápidamente
CREATE INDEX IF NOT EXISTS idx_leads_es_prueba ON leads(empresa_id, es_prueba);
