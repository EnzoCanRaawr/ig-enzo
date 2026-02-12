
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Visual photos table
CREATE TABLE public.visual_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.visual_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos" ON public.visual_photos FOR SELECT USING (true);
CREATE POLICY "Admins can insert photos" ON public.visual_photos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update photos" ON public.visual_photos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete photos" ON public.visual_photos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Works/projects table
CREATE TABLE public.works_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  link TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.works_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projects" ON public.works_projects FOR SELECT USING (true);
CREATE POLICY "Admins can insert projects" ON public.works_projects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update projects" ON public.works_projects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete projects" ON public.works_projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- About content table (single row)
CREATE TABLE public.about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_paragraphs TEXT[] DEFAULT '{}',
  skills JSONB DEFAULT '[]',
  profile_image_url TEXT DEFAULT '',
  email TEXT DEFAULT '',
  tagline TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view about" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "Admins can insert about" ON public.about_content FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update about" ON public.about_content FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete about" ON public.about_content FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_visual_photos_updated_at BEFORE UPDATE ON public.visual_photos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_works_projects_updated_at BEFORE UPDATE ON public.works_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_about_content_updated_at BEFORE UPDATE ON public.about_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS on user_roles
CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for portfolio media
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-media', 'portfolio-media', true);

CREATE POLICY "Anyone can view portfolio media" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-media');
CREATE POLICY "Admins can upload portfolio media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update portfolio media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete portfolio media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'));
