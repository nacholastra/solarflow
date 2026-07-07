-- Límite de usuarios por plan (Basic: 2, Pro: 5) en equipo e invitaciones

CREATE OR REPLACE FUNCTION get_team_limit_for_plan(p plan_suscripcion)
RETURNS int
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE WHEN p = 'pro' THEN 5 ELSE 2 END;
$$;

CREATE OR REPLACE FUNCTION check_team_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  empresa_plan plan_suscripcion;
  team_limit int;
  miembros_count int;
  invitaciones_count int;
BEGIN
  SELECT plan INTO empresa_plan FROM empresas WHERE id = NEW.empresa_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Empresa no encontrada' USING ERRCODE = '23503';
  END IF;

  team_limit := get_team_limit_for_plan(empresa_plan);

  SELECT COUNT(*)::int INTO miembros_count
  FROM equipo
  WHERE empresa_id = NEW.empresa_id;

  SELECT COUNT(*)::int INTO invitaciones_count
  FROM invitaciones_equipo
  WHERE empresa_id = NEW.empresa_id
    AND aceptada_at IS NULL
    AND expira_at > now();

  IF miembros_count + invitaciones_count >= team_limit THEN
    RAISE EXCEPTION 'Límite de equipo alcanzado para tu plan'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_equipo_team_quota ON equipo;
CREATE TRIGGER trg_equipo_team_quota
  BEFORE INSERT ON equipo
  FOR EACH ROW
  EXECUTE FUNCTION check_team_quota();

DROP TRIGGER IF EXISTS trg_invitaciones_team_quota ON invitaciones_equipo;
CREATE TRIGGER trg_invitaciones_team_quota
  BEFORE INSERT ON invitaciones_equipo
  FOR EACH ROW
  EXECUTE FUNCTION check_team_quota();
