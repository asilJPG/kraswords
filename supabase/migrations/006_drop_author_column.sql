-- Drop unused author column from crosswords
ALTER TABLE public.crosswords DROP COLUMN IF EXISTS author;
