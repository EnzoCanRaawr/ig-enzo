ALTER TABLE public.about_content
  ADD COLUMN IF NOT EXISTS note_style TEXT NOT NULL DEFAULT 'plain',
  ADD COLUMN IF NOT EXISTS note_color TEXT,
  ADD COLUMN IF NOT EXISTS note_image_url TEXT,
  ADD COLUMN IF NOT EXISTS note_music_url TEXT,
  ADD COLUMN IF NOT EXISTS note_music_title TEXT;