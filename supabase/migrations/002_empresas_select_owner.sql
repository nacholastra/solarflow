-- Parche: permitir SELECT de empresa propia al owner (onboarding post-registro)
-- Ejecutar en SQL Editor si el registro falla al leer empresa tras crear cuenta

CREATE POLICY "empresas_select_owner" ON empresas
  FOR SELECT USING (owner_id = auth.uid());
