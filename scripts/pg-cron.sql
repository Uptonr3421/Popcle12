-- pg_cron setup for Pop Culture CLE Loyalty App
-- Replaces the Vercel cron for scheduled push notifications
--
-- REQUIREMENT: pg_cron requires Supabase Pro plan ($25/mo+).
-- On the FREE plan, use a Supabase Edge Function with a cron trigger instead:
--   1. Create an Edge Function (e.g. supabase/functions/cron-pushes/index.ts)
--   2. In the Supabase Dashboard > Edge Functions, set a cron schedule on it
--   3. The Edge Function would query scheduled_pushes and call the send-push function
--
-- Run this entire file in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================================================
-- 1. Enable pg_cron extension (available on Supabase Pro plans)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grant usage so our functions can interact with cron schema
GRANT USAGE ON SCHEMA cron TO postgres;

-- ============================================================================
-- 2. Process scheduled pushes — runs every minute
-- ============================================================================
-- Finds unsent pushes whose scheduled_for time has passed, marks them as sent.
-- Actual push delivery is handled by the send-push Edge Function, which should
-- poll for pushes where sent = true AND sent_at within the last 2 minutes,
-- or be triggered directly by this function via pg_net (if available).

CREATE OR REPLACE FUNCTION public.process_scheduled_pushes()
RETURNS void AS $$
DECLARE
  v_push RECORD;
BEGIN
  -- Find all unsent pushes that are due
  FOR v_push IN
    SELECT id, title, body, recipient_type
    FROM public.scheduled_pushes
    WHERE sent = false
      AND scheduled_for <= NOW()
    ORDER BY scheduled_for ASC
    LIMIT 50
  LOOP
    -- Mark as sent immediately to prevent double-processing
    UPDATE public.scheduled_pushes
    SET sent = true, sent_at = NOW()
    WHERE id = v_push.id;

    -- Note: Actual push delivery happens via the send-push Edge Function.
    -- Option A: Edge Function polls for recently-marked pushes.
    -- Option B: Use pg_net extension to HTTP POST to the Edge Function here:
    --
    --   PERFORM net.http_post(
    --     url := current_setting('app.settings.supabase_url') || '/functions/v1/send-push',
    --     headers := jsonb_build_object(
    --       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
    --       'Content-Type', 'application/json'
    --     ),
    --     body := jsonb_build_object(
    --       'push_id', v_push.id,
    --       'title', v_push.title,
    --       'body', v_push.body,
    --       'recipient_type', v_push.recipient_type
    --     )
    --   );
    --
    -- To use pg_net, first enable it: CREATE EXTENSION IF NOT EXISTS pg_net;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule: every minute
SELECT cron.schedule(
  'process-scheduled-pushes',
  '* * * * *',
  $$SELECT public.process_scheduled_pushes()$$
);

-- ============================================================================
-- 3. Auto-deactivate expired offers — runs every 5 minutes
-- ============================================================================

CREATE OR REPLACE FUNCTION public.deactivate_expired_offers()
RETURNS void AS $$
BEGIN
  UPDATE public.offers
  SET active = false
  WHERE active = true
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule: every 5 minutes
SELECT cron.schedule(
  'deactivate-expired-offers',
  '*/5 * * * *',
  $$SELECT public.deactivate_expired_offers()$$
);

-- ============================================================================
-- 4. Verify cron jobs are scheduled
-- ============================================================================
SELECT jobid, schedule, command, nodename, active
FROM cron.job
ORDER BY jobid;

-- ============================================================================
-- MANAGEMENT COMMANDS (run manually as needed)
-- ============================================================================
-- View job run history:
--   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
--
-- Unschedule a job:
--   SELECT cron.unschedule('process-scheduled-pushes');
--   SELECT cron.unschedule('deactivate-expired-offers');
--
-- Update schedule (e.g., change pushes to every 2 minutes):
--   SELECT cron.unschedule('process-scheduled-pushes');
--   SELECT cron.schedule('process-scheduled-pushes', '*/2 * * * *',
--     $$SELECT public.process_scheduled_pushes()$$);
