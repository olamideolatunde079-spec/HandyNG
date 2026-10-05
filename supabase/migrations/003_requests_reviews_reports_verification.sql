-- ============================================================
-- Migration 003: service_requests, reviews, reports,
--                verification_requests
-- ============================================================

-- ── Request status ────────────────────────────────────────────
create type request_status as enum (
  'pending',
  'accepted',
  'rejected',
  'in_progress',
  'completed',
  'cancelled'
);

-- ── Report status ─────────────────────────────────────────────
create type report_status as enum (
  'open',
  'investigating',
  'resolved',
  'dismissed'
);

-- ────────────────────────────────────────────────────────────
-- TABLE: service_requests
-- A customer requests a service from a specific artisan.
-- ────────────────────────────────────────────────────────────
create table service_requests (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references auth.users(id) on delete restrict,
  artisan_id      uuid not null references artisan_profiles(id) on delete restrict,
  service_id      uuid references services(id) on delete set null,
  title           text not null,
  description     text not null,
  location        text not null,
  preferred_date  date,
  preferred_time  time,
  status          request_status not null default 'pending',
  estimated_price numeric(12, 2) check (estimated_price >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index service_requests_customer_id_idx on service_requests(customer_id);
create index service_requests_artisan_id_idx  on service_requests(artisan_id);
create index service_requests_status_idx      on service_requests(status);
create index service_requests_created_at_idx  on service_requests(created_at desc);

create trigger service_requests_updated_at
  before update on service_requests
  for each row execute function set_updated_at();

-- ────────────────────────────────────────────────────────────
-- TABLE: reviews
-- A customer reviews an artisan after a completed service request.
-- One review per completed service request — enforced by unique index.
-- ────────────────────────────────────────────────────────────
create table reviews (
  id                 uuid primary key default gen_random_uuid(),
  customer_id        uuid not null references auth.users(id) on delete restrict,
  artisan_id         uuid not null references artisan_profiles(id) on delete cascade,
  service_request_id uuid not null references service_requests(id) on delete restrict,
  rating             smallint not null check (rating between 1 and 5),
  comment            text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- One review per completed service request
  constraint reviews_service_request_unique unique (service_request_id)
);

create index reviews_artisan_id_idx  on reviews(artisan_id);
create index reviews_customer_id_idx on reviews(customer_id);

create trigger reviews_updated_at
  before update on reviews
  for each row execute function set_updated_at();

-- ── Recompute artisan average_rating after every review change ─
create or replace function update_artisan_rating()
returns trigger language plpgsql security definer as $$
declare
  v_artisan_id uuid;
begin
  -- Use new row on insert/update, old row on delete
  v_artisan_id := coalesce(new.artisan_id, old.artisan_id);

  update artisan_profiles
  set
    average_rating = (
      select coalesce(round(avg(rating)::numeric, 2), 0)
      from reviews
      where artisan_id = v_artisan_id
    ),
    total_reviews = (
      select count(*)
      from reviews
      where artisan_id = v_artisan_id
    )
  where id = v_artisan_id;

  return coalesce(new, old);
end;
$$;

create trigger reviews_update_artisan_rating
  after insert or update or delete on reviews
  for each row execute function update_artisan_rating();

-- ────────────────────────────────────────────────────────────
-- TABLE: reports
-- Users can report other users or artisans for problematic behaviour.
-- ────────────────────────────────────────────────────────────
create table reports (
  id                 uuid primary key default gen_random_uuid(),
  reporter_id        uuid not null references auth.users(id) on delete restrict,
  reported_user_id   uuid not null references auth.users(id) on delete restrict,
  service_request_id uuid references service_requests(id) on delete set null,
  reason             text not null,
  description        text,
  status             report_status not null default 'open',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index reports_reporter_id_idx      on reports(reporter_id);
create index reports_reported_user_id_idx on reports(reported_user_id);
create index reports_status_idx           on reports(status);

create trigger reports_updated_at
  before update on reports
  for each row execute function set_updated_at();

-- ────────────────────────────────────────────────────────────
-- TABLE: verification_requests
-- Artisans submit documents for admin review.
-- Documents are stored in private Supabase Storage buckets.
-- ────────────────────────────────────────────────────────────
create table verification_requests (
  id            uuid primary key default gen_random_uuid(),
  artisan_id    uuid not null references artisan_profiles(id) on delete cascade,
  document_type text not null,
  document_url  text not null,    -- private storage path, not a public URL
  status        verification_status not null default 'pending',
  admin_notes   text,
  submitted_at  timestamptz not null default now(),
  reviewed_at   timestamptz,
  reviewed_by   uuid references auth.users(id) on delete set null,
  updated_at    timestamptz not null default now()
);

create index verification_requests_artisan_id_idx on verification_requests(artisan_id);
create index verification_requests_status_idx     on verification_requests(status);

create trigger verification_requests_updated_at
  before update on verification_requests
  for each row execute function set_updated_at();
