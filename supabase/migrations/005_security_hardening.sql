-- ============================================================
-- Migration 005: Security hardening
-- Fixes all Supabase database linter warnings:
--
-- 1. function_search_path_mutable  — add SET search_path to all functions
-- 2. anon_security_definer_function_executable — revoke EXECUTE from
--    anon and authenticated roles on internal helper functions
-- ============================================================

-- ── 1. Fix mutable search_path on set_updated_at ─────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 2. Fix mutable search_path on create_artisan_profile_on_register

create or replace function public.create_artisan_profile_on_register()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if new.role = 'artisan' then
    insert into public.artisan_profiles (user_id)
    values (new.user_id)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

-- ── 3. Fix mutable search_path on update_artisan_rating ──────

create or replace function public.update_artisan_rating()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_artisan_id uuid;
begin
  v_artisan_id := coalesce(new.artisan_id, old.artisan_id);

  update public.artisan_profiles
  set
    average_rating = (
      select coalesce(round(avg(rating)::numeric, 2), 0)
      from public.reviews
      where artisan_id = v_artisan_id
    ),
    total_reviews = (
      select count(*)
      from public.reviews
      where artisan_id = v_artisan_id
    )
  where id = v_artisan_id;

  return coalesce(new, old);
end;
$$;

-- ── 4. Fix mutable search_path on get_my_role ────────────────

create or replace function public.get_my_role()
returns user_role
language sql
security definer
stable
set search_path = public, pg_catalog
as $$
  select role from public.profiles where user_id = auth.uid();
$$;

-- ── 5. Fix mutable search_path on is_admin ───────────────────

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public, pg_catalog
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- ── 6. Fix mutable search_path on is_artisan_owner ───────────

create or replace function public.is_artisan_owner(p_artisan_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_catalog
as $$
  select exists (
    select 1 from public.artisan_profiles
    where id = p_artisan_id and user_id = auth.uid()
  );
$$;

-- ── 7. Revoke EXECUTE from anon and authenticated roles ───────
-- These are internal helper functions used by triggers and RLS policies.
-- They must NOT be callable via the REST API by any external client.

revoke execute on function public.get_my_role() from anon, authenticated;
revoke execute on function public.is_admin() from anon, authenticated;
revoke execute on function public.is_artisan_owner(uuid) from anon, authenticated;
revoke execute on function public.create_artisan_profile_on_register() from anon, authenticated;
revoke execute on function public.update_artisan_rating() from anon, authenticated;
revoke execute on function public.set_updated_at() from anon, authenticated;
