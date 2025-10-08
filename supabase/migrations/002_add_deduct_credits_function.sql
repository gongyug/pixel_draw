-- supabase/migrations/002_add_deduct_credits_function.sql

CREATE OR REPLACE FUNCTION deduct_user_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET credits_remaining = credits_remaining - p_amount
  WHERE id = p_user_id AND credits_remaining >= p_amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits for user %', p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
