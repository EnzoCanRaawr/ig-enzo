
-- Add enabled flag and comments toggle to visual_photos
ALTER TABLE public.visual_photos ADD COLUMN is_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.visual_photos ADD COLUMN comments_enabled BOOLEAN NOT NULL DEFAULT false;

-- Photo comments table
CREATE TABLE public.photo_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID REFERENCES public.visual_photos(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.photo_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.photo_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can add comments" ON public.photo_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can delete comments" ON public.photo_comments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Photo reactions table
CREATE TABLE public.photo_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID REFERENCES public.visual_photos(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (photo_id, session_id, reaction_type)
);
ALTER TABLE public.photo_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions" ON public.photo_reactions FOR SELECT USING (true);
CREATE POLICY "Anyone can add reactions" ON public.photo_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can remove their reaction" ON public.photo_reactions FOR DELETE USING (true);
