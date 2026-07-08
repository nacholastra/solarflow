-- Aviso de próximo cobro + modo solo lectura al cancelar/suspender la suscripción

-- 1. Fecha del próximo cobro recurrente (se sincroniza desde PayPal vía webhook)
ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS proximo_cobro timestamptz;

-- 2. Proteger proximo_cobro: solo el service role (webhooks/API) puede tocar facturación
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
      OR NEW.proximo_cobro IS DISTINCT FROM OLD.proximo_cobro
      OR NEW.moneda_facturacion IS DISTINCT FROM OLD.moneda_facturacion
    THEN
      RAISE EXCEPTION 'No autorizado a modificar campos de facturación'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Solo lectura cuando la suscripción no está activa:
--    bloquea cualquier UPDATE desde el cliente (no service_role) sobre una
--    empresa cuya suscripción esté suspendida/cancelada/pendiente.
CREATE OR REPLACE FUNCTION enforce_empresa_readonly_when_inactive()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.jwt() ->> 'role', '') <> 'service_role'
     AND OLD.estado_suscripcion <> 'active' THEN
    RAISE EXCEPTION 'Cuenta en solo lectura: reactiva tu suscripción para editar'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_empresas_readonly_inactive ON empresas;
CREATE TRIGGER trg_empresas_readonly_inactive
  BEFORE UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION enforce_empresa_readonly_when_inactive();

-- 4. Solo lectura de leads (CRM) cuando la suscripción no está activa:
--    bloquea UPDATE/DELETE de leads desde el cliente si la empresa no está activa.
--    (El INSERT del widget sigue permitido en modo preview según 005.)
CREATE OR REPLACE FUNCTION enforce_leads_readonly_when_inactive()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  emp_estado text;
BEGIN
  IF COALESCE(auth.jwt() ->> 'role', '') = 'service_role' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT estado_suscripcion INTO emp_estado
  FROM empresas
  WHERE id = COALESCE(NEW.empresa_id, OLD.empresa_id);

  IF emp_estado IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'Cuenta en solo lectura: reactiva tu suscripción para editar'
      USING ERRCODE = '42501';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_readonly_inactive ON leads;
CREATE TRIGGER trg_leads_readonly_inactive
  BEFORE UPDATE OR DELETE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION enforce_leads_readonly_when_inactive();
