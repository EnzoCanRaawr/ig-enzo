
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_bg_type text NOT NULL DEFAULT 'image' CHECK (hero_bg_type IN ('image', 'video')),
  hero_bg_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site_settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.site_settings (hero_bg_type) VALUES ('image');
