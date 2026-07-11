-- Consultas de contacto desde la landing (solo acceso vía service role / admin API).

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL CHECK (char_length(trim(nombre)) >= 2),
  email text NOT NULL CHECK (char_length(trim(email)) >= 5),
  empresa text,
  telefono text,
  mensaje text NOT NULL CHECK (char_length(trim(mensaje)) >= 10 AND char_length(mensaje) <= 2000),
  consentimiento_rgpd boolean NOT NULL DEFAULT false CHECK (consentimiento_rgpd = true),
  ip_hash text,
  user_agent text CHECK (user_agent IS NULL OR char_length(user_agent) <= 512),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_inquiries_created_at_idx
  ON public.contact_inquiries (created_at DESC);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.contact_inquiries IS
  'Solicitudes de contacto desde la landing. Sin políticas RLS públicas; insert/select vía service role.';
