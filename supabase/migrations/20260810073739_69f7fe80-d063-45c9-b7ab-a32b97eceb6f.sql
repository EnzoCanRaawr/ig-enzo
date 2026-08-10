ALTER TABLE public.visual_photos
  ADD COLUMN IF NOT EXISTS media_urls text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS music_url text,
  ADD COLUMN IF NOT EXISTS music_title text,
  ADD COLUMN IF NOT EXISTS music_platform text,
  ADD COLUMN IF NOT EXISTS post_kind text NOT NULL DEFAULT 'photo';

ALTER TABLE public.about_content
  ADD COLUMN IF NOT EXISTS username text NOT NULL DEFAULT 'enzo',
  ADD COLUMN IF NOT EXISTS display_name text NOT NULL DEFAULT 'Shawn Enzo J. Gimena',
  ADD COLUMN IF NOT EXISTS website_url text;