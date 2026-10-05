-- ============================================================
-- Migration 002: services, service_areas, portfolio_items
-- ============================================================

-- ── Pricing type ──────────────────────────────────────────────
create type pricing_type as enum (
  'fixed',
  'starting_from',
  'negotiable',
  'inspection_required'
);

-- ────────────────────────────────────────────────────────────
-- TABLE: services
-- Individual services an artisan offers, each linked to a category.
-- ────────────────────────────────────────────────────────────
create table services (
  id          uuid primary key default gen_random_uuid(),
  artisan_id  uuid not null references artisan_profiles(id) on delete cascade,
  category_id uuid not null references service_categories(id) on delete restrict,
  name        text not null,
  description text,
  price_from  numeric(12, 2) check (price_from >= 0),
  price_to    numeric(12, 2) check (price_to >= 0),
  pricing_type pricing_type not null default 'negotiable',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- price_to must be >= price_from when both are provided
  constraint services_price_range_valid
    check (price_to is null or price_from is null or price_to >= price_from)
);

create index services_artisan_id_idx   on services(artisan_id);
create index services_category_id_idx  on services(category_id);
create index services_is_active_idx    on services(is_active);

create trigger services_updated_at
  before update on services
  for each row execute function set_updated_at();

-- ────────────────────────────────────────────────────────────
-- TABLE: service_areas
-- Geographic coverage areas declared by an artisan.
-- ────────────────────────────────────────────────────────────
create table service_areas (
  id          uuid primary key default gen_random_uuid(),
  artisan_id  uuid not null references artisan_profiles(id) on delete cascade,
  city        text not null,
  state       text not null,
  area        text,              -- neighbourhood / local area name
  latitude    numeric(9, 6),
  longitude   numeric(9, 6),
  radius_km   integer check (radius_km > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index service_areas_artisan_id_idx on service_areas(artisan_id);
create index service_areas_state_city_idx on service_areas(state, city);

create trigger service_areas_updated_at
  before update on service_areas
  for each row execute function set_updated_at();

-- ────────────────────────────────────────────────────────────
-- TABLE: portfolio_items
-- Work samples uploaded by an artisan.
-- Images are stored in Supabase Storage; only the URL is here.
-- ────────────────────────────────────────────────────────────
create table portfolio_items (
  id          uuid primary key default gen_random_uuid(),
  artisan_id  uuid not null references artisan_profiles(id) on delete cascade,
  title       text not null,
  description text,
  image_url   text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index portfolio_items_artisan_id_idx on portfolio_items(artisan_id);

create trigger portfolio_items_updated_at
  before update on portfolio_items
  for each row execute function set_updated_at();
