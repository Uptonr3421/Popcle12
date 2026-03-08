-- =============================================================================
-- Row Level Security (RLS) Policies — Pop Culture CLE Loyalty App
-- Run this in Supabase SQL Editor after tables exist.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper: get_user_role()
-- Returns the user_type ('customer', 'employee', 'admin') for the currently
-- authenticated user, or NULL if not found.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_type FROM public.users WHERE id = auth.uid();
$$;

-- Grant execute so RLS policies can call it
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;


-- =============================================================================
-- TABLE: users
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Customers can read their own row
CREATE POLICY "users: customers read own row"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() AND get_user_role() = 'customer');

-- Employees can read any customer row (needed for scanner lookups)
CREATE POLICY "users: employees read customer rows"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    get_user_role() = 'employee'
    AND user_type = 'customer'
  );

-- Admins can read all rows
CREATE POLICY "users: admins read all"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (get_user_role() = 'admin');

-- Admins can insert new rows
CREATE POLICY "users: admins insert"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'admin');

-- Admins can update any row
CREATE POLICY "users: admins update all"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Admins can delete any row
CREATE POLICY "users: admins delete all"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- Allow users to insert their own row on signup (before role exists)
CREATE POLICY "users: self insert on signup"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Allow users to update their own push token and name
CREATE POLICY "users: self update own row"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- =============================================================================
-- TABLE: loyalty_records
-- =============================================================================
ALTER TABLE public.loyalty_records ENABLE ROW LEVEL SECURITY;

-- Customers can read their own loyalty records
CREATE POLICY "loyalty_records: customers read own"
  ON public.loyalty_records
  FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid()
    AND get_user_role() = 'customer'
  );

-- Employees can insert loyalty records (adding stamps for customers)
CREATE POLICY "loyalty_records: employees insert"
  ON public.loyalty_records
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'employee' OR get_user_role() = 'admin');

-- Employees can read loyalty records they created
CREATE POLICY "loyalty_records: employees read own stamps"
  ON public.loyalty_records
  FOR SELECT
  TO authenticated
  USING (
    employee_id = auth.uid()
    AND get_user_role() = 'employee'
  );

-- Admins can read all loyalty records
CREATE POLICY "loyalty_records: admins read all"
  ON public.loyalty_records
  FOR SELECT
  TO authenticated
  USING (get_user_role() = 'admin');

-- Admins can update/delete loyalty records
CREATE POLICY "loyalty_records: admins update"
  ON public.loyalty_records
  FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'admin');

CREATE POLICY "loyalty_records: admins delete"
  ON public.loyalty_records
  FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');


-- =============================================================================
-- TABLE: offers
-- =============================================================================
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Everyone (all authenticated users) can read active offers
CREATE POLICY "offers: all authenticated read active"
  ON public.offers
  FOR SELECT
  TO authenticated
  USING (active = true);

-- Admins can read ALL offers (including inactive/expired)
CREATE POLICY "offers: admins read all"
  ON public.offers
  FOR SELECT
  TO authenticated
  USING (get_user_role() = 'admin');

-- Only admins can create offers
CREATE POLICY "offers: admins insert"
  ON public.offers
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'admin');

-- Only admins can update offers
CREATE POLICY "offers: admins update"
  ON public.offers
  FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Only admins can delete offers
CREATE POLICY "offers: admins delete"
  ON public.offers
  FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');


-- =============================================================================
-- TABLE: scheduled_pushes
-- =============================================================================
ALTER TABLE public.scheduled_pushes ENABLE ROW LEVEL SECURITY;

-- Only admins can read scheduled pushes
CREATE POLICY "scheduled_pushes: admins read"
  ON public.scheduled_pushes
  FOR SELECT
  TO authenticated
  USING (get_user_role() = 'admin');

-- Only admins can create scheduled pushes
CREATE POLICY "scheduled_pushes: admins insert"
  ON public.scheduled_pushes
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'admin');

-- Only admins can update scheduled pushes
CREATE POLICY "scheduled_pushes: admins update"
  ON public.scheduled_pushes
  FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Only admins can delete scheduled pushes
CREATE POLICY "scheduled_pushes: admins delete"
  ON public.scheduled_pushes
  FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');


-- =============================================================================
-- SERVICE ROLE BYPASS
-- =============================================================================
-- Note: The Supabase service_role key bypasses RLS automatically.
-- Edge Functions (e.g., send-push) that use the service role key are unaffected.
-- The Vercel cron for scheduled push delivery also uses service role and is fine.
--
-- To verify RLS is active after running this script:
--   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- =============================================================================
