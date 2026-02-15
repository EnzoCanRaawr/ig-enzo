
-- Allow admins to update comments (for replying)
CREATE POLICY "Admins can update comments"
ON public.photo_comments
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));
