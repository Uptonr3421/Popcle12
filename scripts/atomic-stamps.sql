-- Atomic stamp increment - prevents race conditions
CREATE OR REPLACE FUNCTION public.add_stamp(
  p_customer_id UUID,
  p_employee_id UUID
) RETURNS JSON AS $$
DECLARE
  v_current_count INT;
  v_new_count INT;
  v_last_stamp TIMESTAMPTZ;
BEGIN
  -- Check for duplicate stamp within 60 seconds
  SELECT stamp_added_at INTO v_last_stamp
  FROM loyalty_records
  WHERE customer_id = p_customer_id
    AND employee_id = p_employee_id
    AND action = 'stamp_added'
  ORDER BY stamp_added_at DESC
  LIMIT 1;

  IF v_last_stamp IS NOT NULL AND v_last_stamp > NOW() - INTERVAL '60 seconds' THEN
    RETURN json_build_object('success', false, 'error', 'Duplicate scan - wait 60 seconds', 'cooldown', true);
  END IF;

  -- Lock the row and increment atomically
  SELECT stamp_count INTO v_current_count
  FROM users
  WHERE id = p_customer_id
  FOR UPDATE;

  IF v_current_count IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Customer not found');
  END IF;

  v_new_count := LEAST(COALESCE(v_current_count, 0) + 1, 10);

  UPDATE users SET stamp_count = v_new_count WHERE id = p_customer_id;

  INSERT INTO loyalty_records (user_id, customer_id, employee_id, action, stamp_added_at)
  VALUES (p_customer_id, p_customer_id, p_employee_id, 'stamp_added', NOW());

  RETURN json_build_object('success', true, 'new_count', v_new_count, 'celebration', v_new_count = 10);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic redemption - prevents double redeem
CREATE OR REPLACE FUNCTION public.redeem_reward(
  p_user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_count INT;
  v_last_redeem TIMESTAMPTZ;
BEGIN
  -- Check for duplicate redemption within 5 minutes
  SELECT stamp_added_at INTO v_last_redeem
  FROM loyalty_records
  WHERE customer_id = p_user_id
    AND action = 'reward_claimed'
  ORDER BY stamp_added_at DESC
  LIMIT 1;

  IF v_last_redeem IS NOT NULL AND v_last_redeem > NOW() - INTERVAL '5 minutes' THEN
    RETURN json_build_object('success', false, 'error', 'Reward already claimed recently');
  END IF;

  -- Lock and check
  SELECT stamp_count INTO v_count
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_count IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  IF v_count < 10 THEN
    RETURN json_build_object('success', false, 'error', 'Not enough stamps', 'current', v_count);
  END IF;

  UPDATE users SET stamp_count = 0 WHERE id = p_user_id;

  INSERT INTO loyalty_records (user_id, customer_id, action, stamp_added_at)
  VALUES (p_user_id, p_user_id, 'reward_claimed', NOW());

  RETURN json_build_object('success', true, 'message', 'Reward claimed!');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for fast phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Index for fast loyalty record lookups (duplicate check)
CREATE INDEX IF NOT EXISTS idx_loyalty_records_customer_employee
  ON loyalty_records(customer_id, employee_id, stamp_added_at DESC);
