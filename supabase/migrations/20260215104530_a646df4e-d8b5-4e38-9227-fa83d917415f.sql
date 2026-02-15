
-- Add admin reply fields to photo_comments
ALTER TABLE public.photo_comments
ADD COLUMN admin_reply text,
ADD COLUMN admin_reply_at timestamp with time zone;

-- Add image_url to works_projects
ALTER TABLE public.works_projects
ADD COLUMN image_url text;
