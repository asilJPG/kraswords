-- Add unique constraint to prevent duplicate game results for same user+crossword
ALTER TABLE public.game_results ADD CONSTRAINT game_results_user_crossword_uniq UNIQUE (user_id, crossword_id);
