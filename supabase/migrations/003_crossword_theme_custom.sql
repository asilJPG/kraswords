-- Add theme_custom JSONB column to crosswords table
alter table public.crosswords
  add column if not exists theme_custom jsonb;
