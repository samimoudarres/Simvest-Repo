-- Create functions for atomic counter updates

-- Function to increment likes count
CREATE OR REPLACE FUNCTION increment_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE activity_posts 
  SET likes_count = likes_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement likes count
CREATE OR REPLACE FUNCTION decrement_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE activity_posts 
  SET likes_count = GREATEST(0, likes_count - 1) 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment comments count
CREATE OR REPLACE FUNCTION increment_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE activity_posts 
  SET comments_count = comments_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement comments count
CREATE OR REPLACE FUNCTION decrement_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE activity_posts 
  SET comments_count = GREATEST(0, comments_count - 1) 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update user cash balance
CREATE OR REPLACE FUNCTION update_user_cash_balance(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  INSERT INTO user_profiles (id, cash_balance, updated_at)
  VALUES (user_id, amount, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    cash_balance = user_profiles.cash_balance + amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Add cash_balance column to user_profiles if it doesn't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS cash_balance DECIMAL(15,2) DEFAULT 100000.00;
