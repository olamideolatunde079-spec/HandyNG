-- ============================================================
-- Migration 001: profiles, artisan_profiles, service_categories
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── User roles ────────────────────────────────────────────────
create type user_role as enum ('customer', 'artisan', 'admin');

-- ── Verification status ───────────────────────────────────────
create type verification_status as enum ('pending', 'verified', 'rejected');

-- ────────────────────────────────────────────────────────────
-- TABLE: profiles
-- One row per auth.users entry. Created automatically via
-- trigger when a new user registers.
-- ────────────────────────────────────────────────────────────
create table profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  first_name  text not null,
  last_name   text not null,
  phone       text,
  avatar_url  text,
  role        user_role not null default 'customer',
  city        text,
  state       text,
  address     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint profiles_user_id_unique unique (user_id)
);

-- Index for fast user_id lookups (used on every authenticated request)
create index profiles_user_id_idx on profiles(user_id);

-- ── Auto-update updated_at ────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ────────────────────────────────────────────────────────────
-- TABLE: artisan_profiles
-- Extended profile for users with role = 'artisan'.
-- ────────────────────────────────────────────────────────────
create table artisan_profiles (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references auth.users(id) on delete cascade,
  business_name             text,
  bio                       text,
  years_experience          integer check (years_experience >= 0),
  verification_status       verification_status not null default 'pending',
  verification_submitted_at timestamptz,
  verified_at               timestamptz,
  service_radius            integer check (service_radius > 0),  -- km
  average_rating            numeric(3, 2) not null default 0
                              check (average_rating >= 0 and average_rating <= 5),
  total_reviews             integer not null default 0 check (total_reviews >= 0),
  completed_jobs            integer not null default 0 check (completed_jobs >= 0),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),

  constraint artisan_profiles_user_id_unique unique (user_id)
);

create index artisan_profiles_user_id_idx      on artisan_profiles(user_id);
create index artisan_profiles_verification_idx on artisan_profiles(verification_status);
create index artisan_profiles_rating_idx       on artisan_profiles(average_rating desc);

create trigger artisan_profiles_updated_at
  before update on artisan_profiles
  for each row execute function set_updated_at();

-- ────────────────────────────────────────────────────────────
-- TABLE: service_categories
-- Platform-managed list of service categories.
-- Only admins can mutate; all authenticated users can read.
-- ────────────────────────────────────────────────────────────
create table service_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null,
  description text,
  icon        text,           -- Font Awesome icon name, e.g. "fa-wrench"
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint service_categories_name_unique unique (name),
  constraint service_categories_slug_unique unique (slug)
);

create index service_categories_slug_idx      on service_categories(slug);
create index service_categories_is_active_idx on service_categories(is_active);

create trigger service_categories_updated_at
  before update on service_categories
  for each row execute function set_updated_at();

-- ── Auto-create artisan_profile on registration ───────────────
-- When a user with role='artisan' is inserted into profiles,
-- automatically create their artisan_profiles row.
create or replace function create_artisan_profile_on_register()
returns trigger language plpgsql security definer as $$
begin
  if new.role = 'artisan' then
    insert into artisan_profiles (user_id)
    values (new.user_id)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger auto_create_artisan_profile
  after insert on profiles
  for each row execute function create_artisan_profile_on_register();
