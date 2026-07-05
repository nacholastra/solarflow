-- Reparación: aplicar solo lo que falta si 001 se ejecutó parcialmente en SQL Editor

DO $$ BEGIN
  CREATE TYPE lead_estado AS ENUM (
    'Nuevo', 'Contactado', 'Visita', 'Presupuesto', 'Cerrado', 'Descartado'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE rol_equipo AS ENUM ('admin', 'comercial');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE plan_suscripcion AS ENUM ('basic', 'pro');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE moneda_facturacion AS ENUM ('EUR', 'USD');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE estado_suscripcion AS ENUM ('pending', 'active', 'suspended', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tipo_inmueble AS ENUM ('residencial', 'comercial');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE campo_origen_consumo AS ENUM ('gasto', 'kwh');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS parametros_tarifa_anual (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anio int NOT NULL UNIQUE,
  precio_energia_medio numeric NOT NULL DEFAULT 0.13,
  peaje_te_medio numeric NOT NULL DEFAULT 0.034,
  cargo_sistema_medio numeric NOT NULL DEFAULT 0.029,
  precio_potencia_kw_mes numeric NOT NULL DEFAULT 0.08,
  iee_pct numeric NOT NULL DEFAULT 0.05112696,
  iva_pct numeric NOT NULL DEFAULT 21,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS localidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  slug text UNIQUE NOT NULL,
  provincia text NOT NULL,
  ccaa text NOT NULL,
  codigo_ine text,
  lat numeric NOT NULL,
  lon numeric NOT NULL,
  produccion_kwh_kwp_anual numeric NOT NULL,
  precio_energia_kwh numeric NOT NULL DEFAULT 0.13,
  peaje_te_kwh numeric NOT NULL DEFAULT 0.034,
  cargo_sistema_kwh numeric NOT NULL DEFAULT 0.029,
  precio_potencia_kw_mes numeric NOT NULL DEFAULT 0.08,
  alquiler_contador_mes numeric DEFAULT 0.81,
  potencia_tipica_residencial_kw numeric DEFAULT 3.45,
  potencia_tipica_comercial_kw numeric DEFAULT 10,
  usa_igic boolean DEFAULT false,
  iva_pct numeric DEFAULT 21,
  igic_energia_pct numeric DEFAULT 3,
  activo boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_localidades_ccaa ON localidades(ccaa);
CREATE INDEX IF NOT EXISTS idx_localidades_nombre ON localidades(nombre);

CREATE TABLE IF NOT EXISTS empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_empresa text NOT NULL,
  slug text UNIQUE NOT NULL,
  color_marca text NOT NULL DEFAULT '#F59E0B',
  logo_url text,
  privacy_url text,
  precio_eur_kwp numeric DEFAULT 1200,
  tarifa_kwh_override numeric,
  ratio_autoconsumo numeric DEFAULT 0.70,
  kwp_max numeric DEFAULT 10,
  gtm_id text,
  plan plan_suscripcion,
  moneda_facturacion moneda_facturacion DEFAULT 'EUR',
  paypal_subscription_id text,
  paypal_payer_id text,
  estado_suscripcion estado_suscripcion DEFAULT 'pending',
  leads_limite_mes int DEFAULT 0,
  leads_usados_mes int DEFAULT 0,
  periodo_reset date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS equipo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rol rol_equipo NOT NULL DEFAULT 'comercial',
  created_at timestamptz DEFAULT now(),
  UNIQUE(empresa_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS invitaciones_equipo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  email text NOT NULL,
  rol rol_equipo NOT NULL DEFAULT 'comercial',
  token text UNIQUE NOT NULL,
  expira_at timestamptz NOT NULL,
  aceptada_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  localidad_id uuid REFERENCES localidades(id),
  fecha timestamptz DEFAULT now(),
  nombre text NOT NULL,
  telefono text NOT NULL,
  email text NOT NULL,
  tipo_inmueble tipo_inmueble NOT NULL,
  comunidad text,
  ciudad text,
  gasto_luz numeric,
  consumo_kwh numeric,
  gasto_mensual_eur numeric,
  consumo_kwh_mensual numeric,
  campo_origen_consumo campo_origen_consumo,
  precio_efectivo_kwh numeric,
  desglose_factura jsonb,
  kwp_estimado numeric,
  ahorro_anual_eur numeric,
  payback_anos numeric,
  produccion_anual_kwh numeric,
  estado lead_estado NOT NULL DEFAULT 'Nuevo',
  assigned_to uuid REFERENCES auth.users(id),
  notas text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  consentimiento_rgpd boolean NOT NULL DEFAULT false,
  ip_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_empresa ON leads(empresa_id);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads(estado);

CREATE TABLE IF NOT EXISTS lead_actividad (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES auth.users(id),
  estado_anterior lead_estado,
  estado_nuevo lead_estado,
  nota text,
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION user_belongs_to_empresa(empresa uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM equipo e
    WHERE e.empresa_id = empresa
      AND e.usuario_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

ALTER TABLE localidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametros_tarifa_anual ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipo ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitaciones_equipo ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_actividad ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "localidades_select_public" ON localidades
    FOR SELECT USING (activo = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "parametros_select_public" ON parametros_tarifa_anual
    FOR SELECT USING (activo = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "empresas_select_member" ON empresas
    FOR SELECT USING (user_belongs_to_empresa(id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "empresas_update_admin" ON empresas
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM equipo e
        WHERE e.empresa_id = empresas.id
          AND e.usuario_id = auth.uid()
          AND e.rol = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "empresas_insert_owner" ON empresas
    FOR INSERT WITH CHECK (owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "empresas_select_owner" ON empresas
    FOR SELECT USING (owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "empresas_select_widget" ON empresas
    FOR SELECT USING (
      estado_suscripcion = 'active'
      AND slug IS NOT NULL
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "equipo_select_member" ON equipo
    FOR SELECT USING (user_belongs_to_empresa(empresa_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "equipo_insert_admin" ON equipo
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM equipo e
        WHERE e.empresa_id = equipo.empresa_id
          AND e.usuario_id = auth.uid()
          AND e.rol = 'admin'
      )
      OR EXISTS (
        SELECT 1 FROM empresas emp
        WHERE emp.id = equipo.empresa_id
          AND emp.owner_id = auth.uid()
          AND equipo.usuario_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "equipo_delete_admin" ON equipo
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM equipo e
        WHERE e.empresa_id = equipo.empresa_id
          AND e.usuario_id = auth.uid()
          AND e.rol = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "invitaciones_select_admin" ON invitaciones_equipo
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM equipo e
        WHERE e.empresa_id = invitaciones_equipo.empresa_id
          AND e.usuario_id = auth.uid()
          AND e.rol = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "invitaciones_insert_admin" ON invitaciones_equipo
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM equipo e
        WHERE e.empresa_id = invitaciones_equipo.empresa_id
          AND e.usuario_id = auth.uid()
          AND e.rol = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "leads_select_member" ON leads
    FOR SELECT USING (user_belongs_to_empresa(empresa_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "leads_update_member" ON leads
    FOR UPDATE USING (user_belongs_to_empresa(empresa_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "leads_insert_public" ON leads
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM empresas emp
        WHERE emp.id = leads.empresa_id
          AND emp.estado_suscripcion = 'active'
          AND emp.leads_usados_mes < emp.leads_limite_mes
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "actividad_select_member" ON lead_actividad
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM leads l
        WHERE l.id = lead_actividad.lead_id
          AND user_belongs_to_empresa(l.empresa_id)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "actividad_insert_member" ON lead_actividad
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM leads l
        WHERE l.id = lead_actividad.lead_id
          AND user_belongs_to_empresa(l.empresa_id)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION increment_leads_usados()
RETURNS trigger AS $$
BEGIN
  UPDATE empresas
  SET leads_usados_mes = leads_usados_mes + 1,
      updated_at = now()
  WHERE id = NEW.empresa_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_leads_increment ON leads;
CREATE TRIGGER trg_leads_increment
  AFTER INSERT ON leads
  FOR EACH ROW EXECUTE FUNCTION increment_leads_usados();

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_empresas_updated ON empresas;
CREATE TRIGGER trg_empresas_updated BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_leads_updated ON leads;
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO parametros_tarifa_anual (anio, activo)
VALUES (2025, true)
ON CONFLICT (anio) DO NOTHING;
