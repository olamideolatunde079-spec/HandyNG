-- ============================================================
-- Migration 004: Row Level Security policies
-- ============================================================
-- Conventions:
--   auth.uid()   = the currently authenticated user's UUID
--   auth.role()  = 'authenticated' | 'anon' | 'service_role'
--
-- The service_role key (backend-only) bypasses RLS entirely,
-- so all policies below apply to anon and authenticated users.
-- ============================================================

-- ── Helper: get current user's role from profiles ────────────
create or replace function get_my_role()
returns user_role language sql security definer stable as $$
  select role from profiles where user_id = auth.uid();
$$;

-- ── Helper: check if current user is admin ───────────────────
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- ── Helper: check if current user is a specific artisan ──────
create or replace function is_artisan_owner(p_artisan_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from artisan_profiles
    where id = p_artisan_id and user_id = auth.uid()
  );
$$;

-- ============================================================
-- profiles
-- ============================================================
alter table profiles enable row level security;

-- Anyone authenticated can read any profile (public info)
create policy "profiles: authenticated users can read all"
  on profiles for select
  to authenticated
  using (true);

-- Users can only insert their own profile
create policy "profiles: users can insert own profile"
  on profiles for insert
  to authenticated
  with check (user_id = auth.uid());

-- Users can only update their own profile
create policy "profiles: users can update own profile"
  on profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Admins can update any profile (e.g. suspending accounts)
create policy "profiles: admins can update any profile"
  on profiles for update
  to authenticated
  using (is_admin());

-- ============================================================
-- artisan_profiles
-- ============================================================
alter table artisan_profiles enable row level security;

-- Anyone authenticated can read artisan profiles (for discovery)
create policy "artisan_profiles: authenticated users can read all"
  on artisan_profiles for select
  to authenticated
  using (true);

-- Artisans can only update their own profile
create policy "artisan_profiles: artisans can update own profile"
  on artisan_profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Admins can update any artisan profile (e.g. verification)
create policy "artisan_profiles: admins can update any"
  on artisan_profiles for update
  to authenticated
  using (is_admin());

-- ============================================================
-- service_categories
-- ============================================================
alter table service_categories enable row level security;

-- Anyone (including anon) can read active categories
create policy "service_categories: anyone can read active"
  on service_categories for select
  using (is_active = true);

-- Admins can read all (including inactive)
create policy "service_categories: admins can read all"
  on service_categories for select
  to authenticated
  using (is_admin());

-- Only admins can insert / update / delete categories
create policy "service_categories: admins can insert"
  on service_categories for insert
  to authenticated
  with check (is_admin());

create policy "service_categories: admins can update"
  on service_categories for update
  to authenticated
  using (is_admin());

create policy "service_categories: admins can delete"
  on service_categories for delete
  to authenticated
  using (is_admin());

-- ============================================================
-- services
-- ============================================================
alter table services enable row level security;

-- Anyone authenticated can read active services
create policy "services: authenticated users can read active"
  on services for select
  to authenticated
  using (is_active = true);

-- Artisans can read all their own services (incl. inactive)
create policy "services: artisans can read own"
  on services for select
  to authenticated
  using (is_artisan_owner(artisan_id));

-- Artisans can insert their own services
create policy "services: artisans can insert own"
  on services for insert
  to authenticated
  with check (is_artisan_owner(artisan_id));

-- Artisans can update their own services
create policy "services: artisans can update own"
  on services for update
  to authenticated
  using (is_artisan_owner(artisan_id));

-- Artisans can delete their own services
create policy "services: artisans can delete own"
  on services for delete
  to authenticated
  using (is_artisan_owner(artisan_id));

-- ============================================================
-- service_areas
-- ============================================================
alter table service_areas enable row level security;

-- Anyone authenticated can read service areas (for discovery)
create policy "service_areas: authenticated users can read all"
  on service_areas for select
  to authenticated
  using (true);

create policy "service_areas: artisans can insert own"
  on service_areas for insert
  to authenticated
  with check (is_artisan_owner(artisan_id));

create policy "service_areas: artisans can update own"
  on service_areas for update
  to authenticated
  using (is_artisan_owner(artisan_id));

create policy "service_areas: artisans can delete own"
  on service_areas for delete
  to authenticated
  using (is_artisan_owner(artisan_id));

-- ============================================================
-- portfolio_items
-- ============================================================
alter table portfolio_items enable row level security;

-- Anyone authenticated can read portfolio items
create policy "portfolio_items: authenticated users can read all"
  on portfolio_items for select
  to authenticated
  using (true);

create policy "portfolio_items: artisans can insert own"
  on portfolio_items for insert
  to authenticated
  with check (is_artisan_owner(artisan_id));

create policy "portfolio_items: artisans can update own"
  on portfolio_items for update
  to authenticated
  using (is_artisan_owner(artisan_id));

create policy "portfolio_items: artisans can delete own"
  on portfolio_items for delete
  to authenticated
  using (is_artisan_owner(artisan_id));

-- ============================================================
-- service_requests
-- ============================================================
alter table service_requests enable row level security;

-- Customers can read their own requests
create policy "service_requests: customers can read own"
  on service_requests for select
  to authenticated
  using (customer_id = auth.uid());

-- Artisans can read requests assigned to them
create policy "service_requests: artisans can read assigned"
  on service_requests for select
  to authenticated
  using (
    exists (
      select 1 from artisan_profiles
      where id = artisan_id and user_id = auth.uid()
    )
  );

-- Admins can read all requests
create policy "service_requests: admins can read all"
  on service_requests for select
  to authenticated
  using (is_admin());

-- Only customers can create requests
create policy "service_requests: customers can insert"
  on service_requests for insert
  to authenticated
  with check (
    customer_id = auth.uid()
    and get_my_role() = 'customer'
  );

-- Artisans can update status of their assigned requests
create policy "service_requests: artisans can update assigned"
  on service_requests for update
  to authenticated
  using (
    exists (
      select 1 from artisan_profiles
      where id = artisan_id and user_id = auth.uid()
    )
  );

-- Customers can cancel their own pending requests
create policy "service_requests: customers can cancel own"
  on service_requests for update
  to authenticated
  using (customer_id = auth.uid() and status = 'pending');

-- ============================================================
-- reviews
-- ============================================================
alter table reviews enable row level security;

-- Anyone authenticated can read reviews
create policy "reviews: authenticated users can read all"
  on reviews for select
  to authenticated
  using (true);

-- Only customers who own the completed request can insert a review
create policy "reviews: customers can insert for completed requests"
  on reviews for insert
  to authenticated
  with check (
    customer_id = auth.uid()
    and exists (
      select 1 from service_requests
      where id = service_request_id
        and customer_id = auth.uid()
        and status = 'completed'
    )
  );

-- Admins can delete reviews (moderation)
create policy "reviews: admins can delete"
  on reviews for delete
  to authenticated
  using (is_admin());

-- ============================================================
-- reports
-- ============================================================
alter table reports enable row level security;

-- Reporters can read their own reports
create policy "reports: reporters can read own"
  on reports for select
  to authenticated
  using (reporter_id = auth.uid());

-- Admins can read all reports
create policy "reports: admins can read all"
  on reports for select
  to authenticated
  using (is_admin());

-- Any authenticated user can file a report
create policy "reports: authenticated users can insert"
  on reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

-- Only admins can update report status
create policy "reports: admins can update"
  on reports for update
  to authenticated
  using (is_admin());

-- ============================================================
-- verification_requests
-- ============================================================
alter table verification_requests enable row level security;

-- Artisans can read their own verification requests
create policy "verification_requests: artisans can read own"
  on verification_requests for select
  to authenticated
  using (
    exists (
      select 1 from artisan_profiles
      where id = artisan_id and user_id = auth.uid()
    )
  );

-- Admins can read all verification requests
create policy "verification_requests: admins can read all"
  on verification_requests for select
  to authenticated
  using (is_admin());

-- Artisans can submit verification requests
create policy "verification_requests: artisans can insert"
  on verification_requests for insert
  to authenticated
  with check (
    exists (
      select 1 from artisan_profiles
      where id = artisan_id and user_id = auth.uid()
    )
  );

-- Only admins can update verification status
create policy "verification_requests: admins can update"
  on verification_requests for update
  to authenticated
  using (is_admin());
