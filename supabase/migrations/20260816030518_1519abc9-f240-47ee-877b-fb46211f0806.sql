CREATE TABLE public.story_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  reaction text NOT NULL DEFAULT '❤️',
  session_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (story_id, session_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_reactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_reactions TO authenticated;
GRANT ALL ON public.story_reactions TO service_role;

ALTER TABLE public.story_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view story reactions" ON public.story_reactions FOR SELECT USING (true);
CREATE POLICY "Anyone can add story reactions" ON public.story_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update their story reaction" ON public.story_reactions FOR UPDATE USING (true);
CREATE POLICY "Anyone can remove their story reaction" ON public.story_reactions FOR DELETE USING (true);