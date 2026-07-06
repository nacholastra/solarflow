-- Endurecimiento de seguridad: RLS, cuota atómica y protección de facturación

-- 1. Los leads solo se insertan vía API (service role), no desde el cliente anon
DROP POLICY IF EXISTS "leads_insert_public" ON leads;

-- 2. Quitar SELECT público completo de empresas (el widget usa service role en el servidor)
DROP POLICY IF EXISTS "empresas_select_widget" ON empresas;

-- 3. Bloquear que admins modifiquen campos de facturación desde el cliente Supabase
CREATE OR REPLACE FUNCTION protect_empresa_billing_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.jwt() ->> 'role', '') <> 'service_role' THEN
    IF NEW.plan IS DISTINCT FROM OLD.plan
      OR NEW.estado_suscripcion IS DISTINCT FROM OLD.estado_suscripcion
      OR NEW.leads_limite_mes IS DISTINCT FROM OLD.leads_limite_mes
      OR NEW.leads_usados_mes IS DISTINCT FROM OLD.leads_usados_mes
      OR NEW.paypal_subscription_id IS DISTINCT FROM OLD.paypal_subscription_id
      OR NEW.paypal_payer_id IS DISTINCT FROM OLD.paypal_payer_id
      OR NEW.periodo_reset IS DISTINCT FROM OLD.periodo_reset
      OR NEW.moneda_facturacion IS DISTINCT FROM OLD.moneda_facturacion
    THEN
      RAISE EXCEPTION 'No autorizado a modificar campos de facturación'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_empresas_protect_billing ON empresas;
CREATE TRIGGER trg_empresas_protect_billing
  BEFORE UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION protect_empresa_billing_fields();

-- 4. Verificación atómica de cuota al insertar leads (empresas activas)
CREATE OR REPLACE FUNCTION check_lead_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  emp RECORD;
BEGIN
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

DROP TRIGGER IF EXISTS trg_leads_quota_check ON leads;
CREATE TRIGGER trg_leads_quota_check
  BEFORE INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION check_lead_quota();

-- 5. Solo incrementar contador para empresas con suscripción activa
CREATE OR REPLACE FUNCTION increment_leads_usados()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE empresas
  SET leads_usados_mes = leads_usados_mes + 1,
      updated_at = now()
  WHERE id = NEW.empresa_id
    AND estado_suscripcion = 'active';
  RETURN NEW;
END;
$$;

-- 6. Validar webhook_url HTTPS en base de datos
CREATE OR REPLACE FUNCTION validate_webhook_url()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.webhook_url IS NOT NULL AND trim(NEW.webhook_url) <> '' THEN
    IF NEW.webhook_url !~ '^https://' THEN
      RAISE EXCEPTION 'webhook_url debe usar HTTPS' USING ERRCODE = '22023';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_empresas_webhook_url ON empresas;
CREATE TRIGGER trg_empresas_webhook_url
  BEFORE INSERT OR UPDATE OF webhook_url ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION validate_webhook_url();
