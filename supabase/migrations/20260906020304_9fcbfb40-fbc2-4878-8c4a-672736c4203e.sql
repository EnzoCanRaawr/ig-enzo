ALTER TABLE public.about_content
  ADD COLUMN IF NOT EXISTS note_text text,
  ADD COLUMN IF NOT EXISTS note_created_at timestamp with time zone;