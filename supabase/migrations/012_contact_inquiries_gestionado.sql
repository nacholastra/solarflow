-- Marcar consultas de contacto como gestionadas desde el panel admin.

ALTER TABLE public.contact_inquiries
  ADD COLUMN IF NOT EXISTS gestionado boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS contact_inquiries_gestionado_created_at_idx
  ON public.contact_inquiries (gestionado, created_at DESC);
