-- =============================================================================
-- Dukaan — core schema
-- Postgres 15+ / Supabase. Run with `supabase db push` or paste in SQL editor.
--
-- Security model (read this first):
--   * Every table has RLS enabled. Clients talk to Postgres directly with the
--     anon key + user JWT, so RLS *is* the API authorisation layer.
--   * Writes that need validation (bookings, orders, status changes, review
--     replies) are NOT granted on the table. They go through SECURITY DEFINER
--     RPCs below, which validate input, lock, and enforce state machines.
--   * Column-level GRANTs stop users from writing server-owned columns
--     (rating_avg, status, slug, owner_id, report counters, ...).
-- =============================================================================

create extension if not exists postgis  with schema extensions;
create extension if not exists pg_trgm  with schema extensions;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.shop_status          as enum ('active', 'suspended');
create type public.item_kind            as enum ('service', 'product');
create type public.booking_status       as enum ('pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'no_show');
create type public.order_status         as enum ('placed', 'accepted', 'packing', 'ready', 'out_for_delivery', 'completed', 'cancelled', 'rejected');
create type public.fulfillment_type     as enum ('pickup', 'delivery');
create type public.payment_method_type  as enum ('jazzcash', 'easypaisa', 'sadapay', 'nayapay', 'raast', 'bank_account', 'upi', 'paypal', 'wise', 'other');
create type public.report_target        as enum ('review', 'shop', 'post');
create type public.report_status        as enum ('open', 'actioned', 'dismissed');

-- -----------------------------------------------------------------------------
-- Generic helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create or replace function public.slugify(p text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(coalesce(p, '')), '[^a-z0-9]+', '-', 'g'))
$$;

create or replace function public.short_code(p_prefix text)
returns text language sql volatile as $$
  select p_prefix || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 6))
$$;

-- -----------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id                   uuid primary key references auth.users (id) on delete cascade,
  full_name            text check (char_length(full_name) <= 80),
  phone                text check (char_length(phone) <= 20),
  avatar_url           text,
  locale               text not null default 'en' check (locale in ('en', 'ur')),
  shop_updates_opt_in  boolean not null default true,   -- offers/posts from followed shops
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 80),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Categories (reference data)
-- -----------------------------------------------------------------------------
create table public.categories (
  slug               text primary key check (slug ~ '^[a-z0-9-]+$'),
  name_en            text not null,
  name_ur            text not null,
  icon               text not null,              -- Material Symbols name
  supports_booking   boolean not null default false,
  supports_ordering  boolean not null default false,
  sort               smallint not null default 100
);

insert into public.categories (slug, name_en, name_ur, icon, supports_booking, supports_ordering, sort) values
  ('barber',        'Barber',              'حجام',            'content_cut',              true,  false, 10),
  ('salon',         'Beauty Salon',        'بیوٹی سیلون',     'spa',         true,  false, 20),
  ('grocery',       'Grocery & Kiryana',   'کریانہ',          'shopping_basket',           false, true,  30),
  ('pharmacy',      'Pharmacy',            'فارمیسی',         'medication',           false, true,  40),
  ('bakery',        'Bakery & Sweets',     'بیکری',           'bakery_dining',             false, true,  50),
  ('restaurant',    'Restaurant & Food',   'ریسٹورنٹ',        'restaurant',       true,  true,  60),
  ('tailor',        'Tailor',              'درزی',            'styler',            true,  false, 70),
  ('mobile-repair', 'Mobile & Repair',     'موبائل ریپئر',    'phonelink_setup',   true,  true,  80),
  ('laundry',       'Laundry',             'لانڈری',          'local_laundry_service',            true,  true,  90),
  ('clinic',        'Clinic',              'کلینک',           'medical_services',          true,  false, 100),
  ('electronics',   'Electronics',         'الیکٹرانکس',      'devices',    false, true,  110),
  ('fitness',       'Gym & Fitness',       'جم',              'fitness_center',          true,  false, 120),
  ('other',         'Other',               'دیگر',            'storefront',       true,  true,  999);

-- -----------------------------------------------------------------------------
-- Shops
-- -----------------------------------------------------------------------------
create table public.shops (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  slug                text not null unique check (slug ~ '^[a-z0-9-]{3,64}$'),
  name                text not null check (char_length(name) between 2 and 80),
  tagline             text check (char_length(tagline) <= 120),
  description         text check (char_length(description) <= 2000),
  category_slug       text not null references public.categories (slug),
  phone               text check (char_length(phone) <= 20),
  whatsapp            text check (char_length(whatsapp) <= 20),
  email               text check (char_length(email) <= 120),
  address             text check (char_length(address) <= 240),
  area                text check (char_length(area) <= 80),
  city                text check (char_length(city) <= 80),
  country_code        text not null default 'PK' check (country_code ~ '^[A-Z]{2}$'),
  location            extensions.geography (point, 4326),
  lat                 double precision generated always as (extensions.st_y(location::extensions.geometry)) stored,
  lng                 double precision generated always as (extensions.st_x(location::extensions.geometry)) stored,
  logo_url            text,
  cover_url           text,
  timezone            text not null default 'Asia/Karachi',
  currency            text not null default 'PKR' check (currency ~ '^[A-Z]{3}$'),
  -- {"mon":[{"open":"09:00","close":"21:00"}], "tue":[...], ...}; missing/empty day = closed
  opening_hours       jsonb not null default '{}'::jsonb check (jsonb_typeof(opening_hours) = 'object'),
  accepts_bookings    boolean not null default false,
  accepts_orders      boolean not null default false,
  offers_delivery     boolean not null default false,
  booking_capacity    smallint not null default 1 check (booking_capacity between 1 and 50), -- chairs/seats in parallel
  slot_minutes        smallint not null default 30 check (slot_minutes between 5 and 240),
  booking_days_ahead  smallint not null default 7 check (booking_days_ahead between 1 and 60),
  min_order_amount    numeric(12, 2) not null default 0 check (min_order_amount >= 0),
  is_published        boolean not null default true,
  status              public.shop_status not null default 'active',   -- moderation, server-owned
  rating_avg          numeric(3, 2) not null default 0,               -- server-owned
  rating_count        integer not null default 0,                     -- server-owned
  favorites_count     integer not null default 0,                     -- server-owned
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index shops_location_gix   on public.shops using gist (location);
create index shops_name_trgm      on public.shops using gin (name extensions.gin_trgm_ops);
create index shops_category_idx   on public.shops (category_slug);
create index shops_owner_idx      on public.shops (owner_id);
create trigger shops_updated_at before update on public.shops
  for each row execute function public.set_updated_at();

-- Slug is generated once and never changes: it's printed on QR posters.
create or replace function public.shops_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_base text;
  v_count int;
begin
  select count(*) into v_count from public.shops where owner_id = new.owner_id;
  if v_count >= 5 then
    raise exception 'shop_limit_reached' using errcode = 'P0001', hint = 'An account can register up to 5 shops.';
  end if;

  v_base := left(nullif(public.slugify(new.name), ''), 48);
  if v_base is null or char_length(v_base) < 3 then v_base := 'shop'; end if;
  loop
    new.slug := v_base || '-' || substr(md5(gen_random_uuid()::text), 1, 4);
    exit when not exists (select 1 from public.shops where slug = new.slug);
  end loop;
  return new;
end $$;
create trigger shops_before_insert before insert on public.shops
  for each row execute function public.shops_before_insert();

create or replace function public.is_shop_owner(p_shop uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.shops where id = p_shop and owner_id = auth.uid())
$$;

create or replace function public.shop_is_visible(p_shop uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.shops where id = p_shop and is_published and status = 'active')
$$;

-- -----------------------------------------------------------------------------
-- Payment methods shown on the shop's public QR / pay page
-- -----------------------------------------------------------------------------
create table public.shop_payment_methods (
  id              uuid primary key default gen_random_uuid(),
  shop_id         uuid not null references public.shops (id) on delete cascade,
  type            public.payment_method_type not null,
  account_title   text not null check (char_length(account_title) <= 80),
  account_number  text check (char_length(account_number) <= 64),   -- wallet mobile no / account no / UPI id / email
  iban            text check (char_length(iban) <= 34),
  bank_name       text check (char_length(bank_name) <= 80),
  qr_image_url    text,                                             -- e.g. Raast / bank QR image uploaded by the owner
  note            text check (char_length(note) <= 200),
  is_primary      boolean not null default false,
  is_active       boolean not null default true,   -- owner can hide a method without deleting it
  sort            smallint not null default 0,
  created_at      timestamptz not null default now()
);
create index spm_shop_idx on public.shop_payment_methods (shop_id, sort);

-- Only one primary method per shop.
create or replace function public.spm_single_primary()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_primary then
    update public.shop_payment_methods set is_primary = false
     where shop_id = new.shop_id and id <> new.id and is_primary;
  end if;
  return new;
end $$;
create trigger spm_single_primary after insert or update of is_primary on public.shop_payment_methods
  for each row when (new.is_primary) execute function public.spm_single_primary();

-- Payment-method limit keeps the public pay page tidy.
create or replace function public.spm_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.shop_payment_methods where shop_id = new.shop_id) >= 10 then
    raise exception 'payment_limit_reached' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger spm_limit before insert on public.shop_payment_methods
  for each row execute function public.spm_limit();

-- -----------------------------------------------------------------------------
-- Catalog: services (haircut, 30 min) and products (atta 10kg)
-- -----------------------------------------------------------------------------
create table public.catalog_items (
  id                uuid primary key default gen_random_uuid(),
  shop_id           uuid not null references public.shops (id) on delete cascade,
  kind              public.item_kind not null,
  name              text not null check (char_length(name) between 1 and 100),
  description       text check (char_length(description) <= 500),
  price             numeric(12, 2) not null check (price >= 0),
  unit              text check (char_length(unit) <= 20),                        -- products: kg, pack, dozen
  duration_minutes  smallint check (duration_minutes between 5 and 480),        -- services
  image_url         text,
  is_available      boolean not null default true,
  sort              integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index catalog_shop_idx on public.catalog_items (shop_id, kind, sort);
create trigger catalog_updated_at before update on public.catalog_items
  for each row execute function public.set_updated_at();

create or replace function public.catalog_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.catalog_items where shop_id = new.shop_id) >= 500 then
    raise exception 'catalog_limit_reached' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger catalog_limit before insert on public.catalog_items
  for each row execute function public.catalog_limit();

-- -----------------------------------------------------------------------------
-- Bookings (seat/chair reservations)
-- -----------------------------------------------------------------------------
create table public.bookings (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique default public.short_code('B'),
  shop_id        uuid not null references public.shops (id) on delete cascade,
  customer_id    uuid not null references public.profiles (id) on delete cascade,
  service_id     uuid references public.catalog_items (id) on delete set null,
  service_name   text,                        -- snapshot
  price          numeric(12, 2),              -- snapshot
  starts_at      timestamptz not null,
  ends_at        timestamptz not null,
  status         public.booking_status not null default 'pending',
  customer_note  text check (char_length(customer_note) <= 300),
  owner_note     text check (char_length(owner_note) <= 300),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index bookings_shop_time_idx     on public.bookings (shop_id, starts_at);
create index bookings_customer_time_idx on public.bookings (customer_id, starts_at desc);
create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Orders (pre-order groceries, food, etc. — paid at shop / via shop's own QR)
-- -----------------------------------------------------------------------------
create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique default public.short_code('O'),
  shop_id           uuid not null references public.shops (id) on delete cascade,
  customer_id       uuid not null references public.profiles (id) on delete cascade,
  status            public.order_status not null default 'placed',
  fulfillment       public.fulfillment_type not null default 'pickup',
  delivery_address  text check (char_length(delivery_address) <= 300),
  customer_phone    text check (char_length(customer_phone) <= 20),
  customer_note     text check (char_length(customer_note) <= 300),
  subtotal          numeric(12, 2) not null default 0,
  currency          text not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index orders_shop_idx     on public.orders (shop_id, created_at desc);
create index orders_customer_idx on public.orders (customer_id, created_at desc);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  item_id     uuid references public.catalog_items (id) on delete set null,
  name        text not null,
  unit        text,
  unit_price  numeric(12, 2) not null,
  quantity    integer not null check (quantity between 1 and 99),
  line_total  numeric(12, 2) generated always as (unit_price * quantity) stored
);
create index order_items_order_idx on public.order_items (order_id);

-- -----------------------------------------------------------------------------
-- Reviews (UGC) + moderation
-- -----------------------------------------------------------------------------
create table public.reviews (
  id             uuid primary key default gen_random_uuid(),
  shop_id        uuid not null references public.shops (id) on delete cascade,
  author_id      uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  rating         smallint not null check (rating between 1 and 5),
  comment        text check (char_length(comment) <= 1000),
  author_name    text,          -- snapshot so reviews never expose the profiles table
  author_avatar  text,
  owner_reply    text check (char_length(owner_reply) <= 1000),
  replied_at     timestamptz,
  is_hidden      boolean not null default false,
  report_count   integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (shop_id, author_id)
);
create index reviews_shop_idx on public.reviews (shop_id, created_at desc);
create trigger reviews_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();

create or replace function public.reviews_before_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if exists (select 1 from public.shops where id = new.shop_id and owner_id = new.author_id) then
      raise exception 'cannot_review_own_shop' using errcode = 'P0001';
    end if;
    select coalesce(nullif(p.full_name, ''), 'Customer'), p.avatar_url
      into new.author_name, new.author_avatar
      from public.profiles p where p.id = new.author_id;
  end if;
  return new;
end $$;
create trigger reviews_before_write before insert or update on public.reviews
  for each row execute function public.reviews_before_write();

create or replace function public.refresh_shop_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_shop uuid := coalesce(new.shop_id, old.shop_id);
begin
  update public.shops s set
    rating_avg   = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where shop_id = v_shop and not is_hidden), 0),
    rating_count = (select count(*) from public.reviews where shop_id = v_shop and not is_hidden)
  where s.id = v_shop;
  return null;
end $$;
create trigger reviews_rating_agg after insert or update or delete on public.reviews
  for each row execute function public.refresh_shop_rating();

create table public.user_blocks (
  blocker_id  uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  blocked_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create or replace function public.is_blocked_by_me(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_blocks where blocker_id = auth.uid() and blocked_id = p_user)
$$;

create table public.content_reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  target_type  public.report_target not null,
  target_id    uuid not null,
  reason       text not null check (reason in ('spam', 'offensive', 'harassment', 'fake', 'scam', 'other')),
  details      text check (char_length(details) <= 500),
  status       public.report_status not null default 'open',
  created_at   timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

-- Auto-hide a review after 3 independent reports (pending human moderation).
create or replace function public.on_content_report()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.target_type = 'review' then
    update public.reviews
       set report_count = report_count + 1,
           is_hidden    = is_hidden or report_count + 1 >= 3
     where id = new.target_id;
  end if;
  return new;
end $$;
create trigger content_reports_after_insert after insert on public.content_reports
  for each row execute function public.on_content_report();

-- -----------------------------------------------------------------------------
-- Favorites ("follow a shop" — shows on customer's home)
-- -----------------------------------------------------------------------------
create table public.favorites (
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  shop_id     uuid not null references public.shops (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, shop_id)
);
create index favorites_shop_idx on public.favorites (shop_id);

create or replace function public.refresh_favorites_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_shop uuid := coalesce(new.shop_id, old.shop_id);
begin
  update public.shops set favorites_count = (select count(*) from public.favorites where shop_id = v_shop)
   where id = v_shop;
  return null;
end $$;
create trigger favorites_count after insert or delete on public.favorites
  for each row execute function public.refresh_favorites_count();

-- -----------------------------------------------------------------------------
-- Shop posts (offers / announcements = the marketing channel)
-- -----------------------------------------------------------------------------
create table public.shop_posts (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references public.shops (id) on delete cascade,
  title       text not null check (char_length(title) between 2 and 80),
  body        text check (char_length(body) <= 600),
  image_url   text,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);
create index shop_posts_shop_idx on public.shop_posts (shop_id, created_at desc);

create or replace function public.shop_posts_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.shop_posts
       where shop_id = new.shop_id and created_at > now() - interval '24 hours') >= 3 then
    raise exception 'post_rate_limited' using errcode = 'P0001', hint = 'Up to 3 posts per shop per day.';
  end if;
  return new;
end $$;
create trigger shop_posts_rate_limit before insert on public.shop_posts
  for each row execute function public.shop_posts_rate_limit();

-- -----------------------------------------------------------------------------
-- Notifications inbox + Expo push tokens
-- -----------------------------------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text,
  data        jsonb not null default '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

create table public.push_tokens (
  token       text primary key,
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  platform    text not null check (platform in ('android', 'ios', 'web')),
  updated_at  timestamptz not null default now()
);
create index push_tokens_user_idx on public.push_tokens (user_id);

create or replace function public.notify(p_user uuid, p_type text, p_title text, p_body text, p_data jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications (user_id, type, title, body, data)
  values (p_user, p_type, p_title, p_body, coalesce(p_data, '{}'::jsonb))
$$;
revoke execute on function public.notify(uuid, text, text, text, jsonb) from public, anon, authenticated;

-- Sends an Expo push for every inbox row. Uses pg_net when available (Supabase),
-- silently no-ops otherwise, and never blocks the originating transaction.
create or replace function public.push_notification()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_messages jsonb;
begin
  if to_regnamespace('net') is null then
    return new;
  end if;
  select jsonb_agg(jsonb_build_object(
           'to', t.token, 'title', new.title, 'body', new.body, 'sound', 'default',
           'channelId', 'default',
           'data', new.data || jsonb_build_object('notificationId', new.id, 'type', new.type)))
    into v_messages
    from public.push_tokens t where t.user_id = new.user_id;
  if v_messages is null then
    return new;
  end if;
  execute 'select net.http_post(url := $1, body := $2, headers := $3)'
    using 'https://exp.host/--/api/v2/push/send', v_messages,
          '{"Content-Type":"application/json","Accept":"application/json"}'::jsonb;
  return new;
exception when others then
  return new;
end $$;
create trigger notifications_push after insert on public.notifications
  for each row execute function public.push_notification();

-- Event → notification fan-out ------------------------------------------------
create or replace function public.on_booking_event()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_shop public.shops%rowtype;
  v_when text;
begin
  select * into v_shop from public.shops where id = new.shop_id;
  v_when := to_char(new.starts_at at time zone v_shop.timezone, 'Dy DD Mon, HH12:MI AM');
  if tg_op = 'INSERT' then
    perform public.notify(v_shop.owner_id, 'booking.new', 'New booking request',
      coalesce(new.service_name, 'Booking') || ' · ' || v_when,
      jsonb_build_object('bookingId', new.id, 'shopId', new.shop_id, 'role', 'owner'));
  elsif new.status is distinct from old.status then
    if auth.uid() = new.customer_id then
      perform public.notify(v_shop.owner_id, 'booking.' || new.status, 'Booking ' || new.status::text,
        new.code || ' · ' || v_when,
        jsonb_build_object('bookingId', new.id, 'shopId', new.shop_id, 'role', 'owner'));
    else
      perform public.notify(new.customer_id, 'booking.' || new.status,
        v_shop.name || ': booking ' || replace(new.status::text, '_', ' '),
        coalesce(new.service_name, 'Booking') || ' · ' || v_when,
        jsonb_build_object('bookingId', new.id, 'shopId', new.shop_id, 'role', 'customer'));
    end if;
  end if;
  return null;
end $$;
create trigger bookings_notify after insert or update of status on public.bookings
  for each row execute function public.on_booking_event();

create or replace function public.on_order_event()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_shop public.shops%rowtype;
begin
  select * into v_shop from public.shops where id = new.shop_id;
  if tg_op = 'INSERT' then
    -- Fired from place_order() after items are inserted (see below), not here.
    return null;
  elsif new.status is distinct from old.status then
    if auth.uid() = new.customer_id then
      perform public.notify(v_shop.owner_id, 'order.' || new.status, 'Order ' || new.code || ' ' || new.status::text,
        null, jsonb_build_object('orderId', new.id, 'shopId', new.shop_id, 'role', 'owner'));
    else
      perform public.notify(new.customer_id, 'order.' || new.status,
        v_shop.name || ': order ' || replace(new.status::text, '_', ' '),
        'Order ' || new.code,
        jsonb_build_object('orderId', new.id, 'shopId', new.shop_id, 'role', 'customer'));
    end if;
  end if;
  return null;
end $$;
create trigger orders_notify after update of status on public.orders
  for each row execute function public.on_order_event();

create or replace function public.on_review_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify(s.owner_id, 'review.new', 'New ' || new.rating || '★ review',
    left(coalesce(new.comment, ''), 120), jsonb_build_object('shopId', new.shop_id, 'reviewId', new.id, 'role', 'owner'))
  from public.shops s where s.id = new.shop_id;
  return null;
end $$;
create trigger reviews_notify after insert on public.reviews
  for each row execute function public.on_review_insert();

create or replace function public.on_post_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_shop_name text;
begin
  select name into v_shop_name from public.shops where id = new.shop_id;
  insert into public.notifications (user_id, type, title, body, data)
  select f.user_id, 'post.new', v_shop_name || ': ' || new.title, left(coalesce(new.body, ''), 140),
         jsonb_build_object('shopId', new.shop_id, 'postId', new.id, 'role', 'customer')
    from public.favorites f
    join public.profiles p on p.id = f.user_id and p.shop_updates_opt_in
   where f.shop_id = new.shop_id;
  return null;
end $$;
create trigger shop_posts_notify after insert on public.shop_posts
  for each row execute function public.on_post_insert();

-- =============================================================================
-- RPCs
-- =============================================================================

-- Discovery: shops near a point (or top-rated when no location given).
create or replace function public.nearby_shops(
  p_lat       double precision default null,
  p_lng       double precision default null,
  p_radius_m  integer default 15000,
  p_category  text default null,
  p_query     text default null,
  p_limit     integer default 30,
  p_offset    integer default 0
)
returns table (
  id uuid, slug text, name text, tagline text, category_slug text, area text, city text,
  logo_url text, cover_url text, rating_avg numeric, rating_count integer,
  accepts_bookings boolean, accepts_orders boolean, offers_delivery boolean,
  lat double precision, lng double precision, distance_m double precision,
  address text, opening_hours jsonb, timezone text
)
language sql stable set search_path = public, extensions as $$
  with origin as (
    select case when p_lat is null or p_lng is null then null
                else st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography end as g
  )
  select s.id, s.slug, s.name, s.tagline, s.category_slug, s.area, s.city,
         s.logo_url, s.cover_url, s.rating_avg, s.rating_count,
         s.accepts_bookings, s.accepts_orders, s.offers_delivery,
         s.lat, s.lng,
         case when o.g is null or s.location is null then null else st_distance(s.location, o.g) end,
         s.address, s.opening_hours, s.timezone
    from public.shops s cross join origin o
   where s.is_published and s.status = 'active'
     and (p_category is null or s.category_slug = p_category)
     and (p_query is null or p_query = '' or s.name ilike '%' || p_query || '%'
          or s.tagline ilike '%' || p_query || '%' or s.area ilike '%' || p_query || '%')
     and (o.g is null or (s.location is not null and st_dwithin(s.location, o.g, least(greatest(p_radius_m, 500), 100000))))
   order by case when o.g is null then null else st_distance(s.location, o.g) end asc nulls last,
            s.rating_avg desc, s.rating_count desc
   limit least(greatest(p_limit, 1), 100) offset greatest(p_offset, 0)
$$;

-- Owners set location via lat/lng (clients never need to build WKT).
create or replace function public.set_shop_location(p_shop uuid, p_lat double precision, p_lng double precision)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.is_shop_owner(p_shop) then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_lat not between -90 and 90 or p_lng not between -180 and 180 then raise exception 'invalid_coordinates'; end if;
  update public.shops set location = st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography where id = p_shop;
end $$;

-- Booking slots for one day in the shop's local timezone.
create or replace function public.get_available_slots(p_shop uuid, p_date date, p_service uuid default null)
returns table (slot_start timestamptz, slot_end timestamptz, remaining integer)
language plpgsql stable security definer set search_path = public as $$
declare
  v_shop      public.shops%rowtype;
  v_duration  interval;
  v_step      interval;
  v_day_key   text;
  v_range     jsonb;
  v_open      timestamptz;
  v_close     timestamptz;
  v_today     date;
begin
  select * into v_shop from public.shops where id = p_shop and is_published and status = 'active';
  if not found or not v_shop.accepts_bookings then return; end if;

  v_today := (now() at time zone v_shop.timezone)::date;
  if p_date < v_today or p_date > v_today + v_shop.booking_days_ahead then return; end if;

  v_step := make_interval(mins => v_shop.slot_minutes);
  select make_interval(mins => coalesce(ci.duration_minutes, v_shop.slot_minutes)) into v_duration
    from (select 1) x left join public.catalog_items ci
      on ci.id = p_service and ci.shop_id = p_shop and ci.kind = 'service' and ci.is_available;
  if p_service is not null and not exists (
    select 1 from public.catalog_items where id = p_service and shop_id = p_shop and kind = 'service' and is_available
  ) then return; end if;

  v_day_key := (array['sun','mon','tue','wed','thu','fri','sat'])[extract(dow from p_date)::int + 1];

  for v_range in select * from jsonb_array_elements(coalesce(v_shop.opening_hours -> v_day_key, '[]'::jsonb)) loop
    v_open  := (p_date + (v_range ->> 'open')::time)  at time zone v_shop.timezone;
    v_close := (p_date + (v_range ->> 'close')::time) at time zone v_shop.timezone;
    if v_close <= v_open then v_close := v_close + interval '1 day'; end if;   -- open past midnight

    return query
      select g.s, g.s + v_duration,
             (v_shop.booking_capacity - (
               select count(*) from public.bookings b
                where b.shop_id = p_shop and b.status in ('pending', 'confirmed')
                  and b.starts_at < g.s + v_duration and b.ends_at > g.s))::int
        from generate_series(v_open, v_close - v_duration, v_step) as g(s)
       where g.s > now() + interval '10 minutes'
         and v_shop.booking_capacity > (
               select count(*) from public.bookings b
                where b.shop_id = p_shop and b.status in ('pending', 'confirmed')
                  and b.starts_at < g.s + v_duration and b.ends_at > g.s);
  end loop;
end $$;

create or replace function public.create_booking(
  p_shop uuid, p_service uuid, p_starts_at timestamptz, p_note text default null
)
returns public.bookings language plpgsql security definer set search_path = public as $$
declare
  v_uid      uuid := auth.uid();
  v_shop     public.shops%rowtype;
  v_service  public.catalog_items%rowtype;
  v_slot     record;
  v_row      public.bookings;
begin
  if v_uid is null then raise exception 'auth_required' using errcode = '42501'; end if;
  select * into v_shop from public.shops where id = p_shop and is_published and status = 'active';
  if not found or not v_shop.accepts_bookings then raise exception 'bookings_disabled' using errcode = 'P0001'; end if;

  if p_service is not null then
    select * into v_service from public.catalog_items
     where id = p_service and shop_id = p_shop and kind = 'service' and is_available;
    if not found then raise exception 'service_unavailable' using errcode = 'P0001'; end if;
  end if;

  -- Serialise bookings per shop so two customers can't take the last seat.
  perform pg_advisory_xact_lock(hashtextextended(p_shop::text, 0));

  if (select count(*) from public.bookings
       where shop_id = p_shop and customer_id = v_uid
         and status in ('pending', 'confirmed') and starts_at > now()) >= 2 then
    raise exception 'too_many_active_bookings' using errcode = 'P0001';
  end if;

  select * into v_slot
    from public.get_available_slots(p_shop, (p_starts_at at time zone v_shop.timezone)::date, p_service) s
   where s.slot_start = p_starts_at;
  if not found then raise exception 'slot_unavailable' using errcode = 'P0001'; end if;

  insert into public.bookings (shop_id, customer_id, service_id, service_name, price, starts_at, ends_at, customer_note)
  values (p_shop, v_uid, v_service.id, v_service.name, v_service.price, v_slot.slot_start, v_slot.slot_end, left(p_note, 300))
  returning * into v_row;
  return v_row;
end $$;

create or replace function public.cancel_booking(p_booking uuid)
returns public.bookings language plpgsql security definer set search_path = public as $$
declare v_row public.bookings;
begin
  update public.bookings set status = 'cancelled'
   where id = p_booking and customer_id = auth.uid()
     and status in ('pending', 'confirmed') and starts_at > now()
  returning * into v_row;
  if not found then raise exception 'cannot_cancel' using errcode = 'P0001'; end if;
  return v_row;
end $$;

create or replace function public.update_booking_status(p_booking uuid, p_status public.booking_status, p_note text default null)
returns public.bookings language plpgsql security definer set search_path = public as $$
declare
  v_row public.bookings;
begin
  select b.* into v_row from public.bookings b
   where b.id = p_booking and public.is_shop_owner(b.shop_id) for update;
  if not found then raise exception 'forbidden' using errcode = '42501'; end if;

  if not (
       (v_row.status = 'pending'   and p_status in ('confirmed', 'rejected', 'cancelled'))
    or (v_row.status = 'confirmed' and p_status in ('completed', 'no_show', 'cancelled'))
  ) then
    raise exception 'invalid_transition % -> %', v_row.status, p_status using errcode = 'P0001';
  end if;

  update public.bookings set status = p_status, owner_note = coalesce(left(p_note, 300), owner_note)
   where id = p_booking returning * into v_row;
  return v_row;
end $$;

-- p_items: [{"item_id":"uuid","quantity":2}, ...]
create or replace function public.place_order(
  p_shop uuid, p_items jsonb, p_fulfillment public.fulfillment_type default 'pickup',
  p_address text default null, p_phone text default null, p_note text default null
)
returns public.orders language plpgsql security definer set search_path = public as $$
declare
  v_uid    uuid := auth.uid();
  v_shop   public.shops%rowtype;
  v_order  public.orders;
  v_lines  int;
  v_total  numeric(12, 2);
begin
  if v_uid is null then raise exception 'auth_required' using errcode = '42501'; end if;
  select * into v_shop from public.shops where id = p_shop and is_published and status = 'active';
  if not found or not v_shop.accepts_orders then raise exception 'orders_disabled' using errcode = 'P0001'; end if;
  if p_fulfillment = 'delivery' and (not v_shop.offers_delivery or coalesce(trim(p_address), '') = '') then
    raise exception 'delivery_unavailable' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'invalid_items' using errcode = 'P0001';
  end if;
  if (select count(*) from public.orders where shop_id = p_shop and customer_id = v_uid
        and status in ('placed', 'accepted', 'packing', 'ready', 'out_for_delivery')) >= 5 then
    raise exception 'too_many_open_orders' using errcode = 'P0001';
  end if;

  -- Merge duplicate lines, price everything server-side.
  drop table if exists pg_temp._lines;
  create temporary table _lines on commit drop as
    select ci.id, ci.name, ci.unit, ci.price, sum((x ->> 'quantity')::int)::int as qty
      from jsonb_array_elements(p_items) x
      join public.catalog_items ci
        on ci.id = (x ->> 'item_id')::uuid and ci.shop_id = p_shop and ci.is_available and ci.kind = 'product'
     group by ci.id, ci.name, ci.unit, ci.price;

  select count(*), coalesce(sum(price * qty), 0) into v_lines, v_total from _lines;
  if v_lines <> (select count(distinct (x ->> 'item_id')) from jsonb_array_elements(p_items) x) then
    raise exception 'item_unavailable' using errcode = 'P0001';
  end if;
  if exists (select 1 from _lines where qty < 1 or qty > 99) then
    raise exception 'invalid_quantity' using errcode = 'P0001';
  end if;
  if v_total < v_shop.min_order_amount then
    raise exception 'below_minimum_order' using errcode = 'P0001';
  end if;

  insert into public.orders (shop_id, customer_id, fulfillment, delivery_address, customer_phone, customer_note, subtotal, currency)
  values (p_shop, v_uid, p_fulfillment, left(p_address, 300), left(p_phone, 20), left(p_note, 300), v_total, v_shop.currency)
  returning * into v_order;

  insert into public.order_items (order_id, item_id, name, unit, unit_price, quantity)
  select v_order.id, id, name, unit, price, qty from _lines;

  perform public.notify(v_shop.owner_id, 'order.new', 'New order ' || v_order.code,
    v_lines || ' item(s) · ' || v_shop.currency || ' ' || v_total || ' · ' || p_fulfillment::text,
    jsonb_build_object('orderId', v_order.id, 'shopId', p_shop, 'role', 'owner'));
  return v_order;
end $$;

create or replace function public.cancel_order(p_order uuid)
returns public.orders language plpgsql security definer set search_path = public as $$
declare v_row public.orders;
begin
  update public.orders set status = 'cancelled'
   where id = p_order and customer_id = auth.uid() and status = 'placed'
  returning * into v_row;
  if not found then raise exception 'cannot_cancel' using errcode = 'P0001'; end if;
  return v_row;
end $$;

create or replace function public.update_order_status(p_order uuid, p_status public.order_status)
returns public.orders language plpgsql security definer set search_path = public as $$
declare v_row public.orders;
begin
  select o.* into v_row from public.orders o
   where o.id = p_order and public.is_shop_owner(o.shop_id) for update;
  if not found then raise exception 'forbidden' using errcode = '42501'; end if;

  if not (
       (v_row.status = 'placed'           and p_status in ('accepted', 'rejected'))
    or (v_row.status = 'accepted'         and p_status in ('packing', 'ready', 'cancelled'))
    or (v_row.status = 'packing'          and p_status in ('ready', 'cancelled'))
    or (v_row.status = 'ready'            and (p_status = 'completed' or (p_status = 'out_for_delivery' and v_row.fulfillment = 'delivery')))
    or (v_row.status = 'out_for_delivery' and p_status = 'completed')
  ) then
    raise exception 'invalid_transition % -> %', v_row.status, p_status using errcode = 'P0001';
  end if;

  update public.orders set status = p_status where id = p_order returning * into v_row;
  return v_row;
end $$;

create or replace function public.reply_to_review(p_review uuid, p_reply text)
returns public.reviews language plpgsql security definer set search_path = public as $$
declare v_row public.reviews;
begin
  update public.reviews r set owner_reply = nullif(left(trim(p_reply), 1000), ''), replied_at = now()
   where r.id = p_review and public.is_shop_owner(r.shop_id)
  returning * into v_row;
  if not found then raise exception 'forbidden' using errcode = '42501'; end if;
  return v_row;
end $$;

create or replace function public.shop_dashboard(p_shop uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_shop public.shops%rowtype;
  v_day_start timestamptz;
begin
  select * into v_shop from public.shops where id = p_shop and owner_id = auth.uid();
  if not found then raise exception 'forbidden' using errcode = '42501'; end if;
  v_day_start := date_trunc('day', now() at time zone v_shop.timezone) at time zone v_shop.timezone;
  return jsonb_build_object(
    'bookings_today',   (select count(*) from public.bookings where shop_id = p_shop and starts_at >= v_day_start and starts_at < v_day_start + interval '1 day' and status in ('pending','confirmed','completed')),
    'bookings_pending', (select count(*) from public.bookings where shop_id = p_shop and status = 'pending' and starts_at > now()),
    'orders_open',      (select count(*) from public.orders   where shop_id = p_shop and status in ('placed','accepted','packing','ready','out_for_delivery')),
    'orders_new',       (select count(*) from public.orders   where shop_id = p_shop and status = 'placed'),
    'revenue_today',    (select coalesce(sum(subtotal), 0) from public.orders where shop_id = p_shop and status = 'completed' and updated_at >= v_day_start)
                        + (select coalesce(sum(price), 0) from public.bookings where shop_id = p_shop and status = 'completed' and starts_at >= v_day_start and starts_at < v_day_start + interval '1 day'),
    'bookings_done_today',     (select count(*) from public.bookings where shop_id = p_shop and status = 'completed' and starts_at >= v_day_start and starts_at < v_day_start + interval '1 day'),
    'bookings_upcoming_today', (select count(*) from public.bookings where shop_id = p_shop and status in ('pending','confirmed') and starts_at >= now() and starts_at < v_day_start + interval '1 day'),
    'followers',        v_shop.favorites_count,
    'rating_avg',       v_shop.rating_avg,
    'rating_count',     v_shop.rating_count
  );
end $$;

create or replace function public.mark_notifications_read()
returns void language sql security definer set search_path = public as $$
  update public.notifications set read_at = now() where user_id = auth.uid() and read_at is null
$$;

-- Google Play requires in-app account deletion. Cascades remove all user data;
-- storage objects under media/<uid>/ are removed by the client before calling this.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'auth_required' using errcode = '42501'; end if;
  delete from auth.users where id = auth.uid();
end $$;

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles             enable row level security;
alter table public.categories           enable row level security;
alter table public.shops                enable row level security;
alter table public.shop_payment_methods enable row level security;
alter table public.catalog_items        enable row level security;
alter table public.bookings             enable row level security;
alter table public.orders               enable row level security;
alter table public.order_items          enable row level security;
alter table public.reviews              enable row level security;
alter table public.user_blocks          enable row level security;
alter table public.content_reports      enable row level security;
alter table public.favorites            enable row level security;
alter table public.shop_posts           enable row level security;
alter table public.notifications        enable row level security;
alter table public.push_tokens          enable row level security;

-- Start from zero privileges, then grant exactly what the app needs.
revoke all on all tables in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;

-- profiles: you see yourself + customers who booked/ordered at your shop.
grant select on public.profiles to authenticated;
grant update (full_name, phone, avatar_url, locale, shop_updates_opt_in) on public.profiles to authenticated;
create policy profiles_select on public.profiles for select to authenticated using (
  id = auth.uid()
  or exists (select 1 from public.bookings b join public.shops s on s.id = b.shop_id
              where b.customer_id = profiles.id and s.owner_id = auth.uid())
  or exists (select 1 from public.orders o join public.shops s on s.id = o.shop_id
              where o.customer_id = profiles.id and s.owner_id = auth.uid())
);
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- categories: public
grant select on public.categories to anon, authenticated;
create policy categories_read on public.categories for select using (true);

-- shops
grant select on public.shops to anon, authenticated;
grant insert (name, tagline, description, category_slug, phone, whatsapp, email, address, area, city, country_code,
              logo_url, cover_url, timezone, currency, opening_hours, accepts_bookings, accepts_orders,
              offers_delivery, booking_capacity, slot_minutes, booking_days_ahead, min_order_amount, is_published)
  on public.shops to authenticated;
grant update (name, tagline, description, category_slug, phone, whatsapp, email, address, area, city, country_code,
              logo_url, cover_url, timezone, currency, opening_hours, accepts_bookings, accepts_orders,
              offers_delivery, booking_capacity, slot_minutes, booking_days_ahead, min_order_amount, is_published)
  on public.shops to authenticated;
grant delete on public.shops to authenticated;
create policy shops_read   on public.shops for select using ((is_published and status = 'active') or owner_id = auth.uid());
create policy shops_insert on public.shops for insert to authenticated with check (owner_id = auth.uid());
create policy shops_update on public.shops for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy shops_delete on public.shops for delete to authenticated using (owner_id = auth.uid());

-- shop-owned child tables: public read when shop visible, owner writes
grant select on public.shop_payment_methods, public.catalog_items, public.shop_posts to anon, authenticated;
grant insert, update, delete on public.shop_payment_methods, public.catalog_items, public.shop_posts to authenticated;

create policy spm_read  on public.shop_payment_methods for select using ((is_active and public.shop_is_visible(shop_id)) or public.is_shop_owner(shop_id));
create policy spm_write on public.shop_payment_methods for all to authenticated using (public.is_shop_owner(shop_id)) with check (public.is_shop_owner(shop_id));
create policy items_read  on public.catalog_items for select using (public.shop_is_visible(shop_id) or public.is_shop_owner(shop_id));
create policy items_write on public.catalog_items for all to authenticated using (public.is_shop_owner(shop_id)) with check (public.is_shop_owner(shop_id));
create policy posts_read  on public.shop_posts for select using (public.shop_is_visible(shop_id) or public.is_shop_owner(shop_id));
create policy posts_write on public.shop_posts for all to authenticated using (public.is_shop_owner(shop_id)) with check (public.is_shop_owner(shop_id));

-- bookings / orders: read by participant, writes only through RPCs
grant select on public.bookings, public.orders, public.order_items to authenticated;
create policy bookings_read on public.bookings for select to authenticated
  using (customer_id = auth.uid() or public.is_shop_owner(shop_id));
create policy orders_read on public.orders for select to authenticated
  using (customer_id = auth.uid() or public.is_shop_owner(shop_id));
create policy order_items_read on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id
                  and (o.customer_id = auth.uid() or public.is_shop_owner(o.shop_id))));

-- reviews
grant select on public.reviews to anon, authenticated;
grant insert (shop_id, rating, comment) on public.reviews to authenticated;
grant update (rating, comment) on public.reviews to authenticated;
grant delete on public.reviews to authenticated;
create policy reviews_read on public.reviews for select using (
  author_id = auth.uid()
  or public.is_shop_owner(shop_id)
  or (not is_hidden
      and not public.is_blocked_by_me(author_id))
);
create policy reviews_insert on public.reviews for insert to authenticated
  with check (author_id = auth.uid() and public.shop_is_visible(shop_id));
create policy reviews_update on public.reviews for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy reviews_delete on public.reviews for delete to authenticated using (author_id = auth.uid());

-- blocks & reports
grant select, insert, delete on public.user_blocks to authenticated;
create policy blocks_own on public.user_blocks for all to authenticated
  using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());
grant insert (target_type, target_id, reason, details) on public.content_reports to authenticated;
create policy reports_insert on public.content_reports for insert to authenticated with check (reporter_id = auth.uid());

-- favorites
grant select, insert, delete on public.favorites to authenticated;
create policy favorites_own on public.favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- notifications
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant delete on public.notifications to authenticated;
create policy notifications_read   on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_update on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_delete on public.notifications for delete to authenticated using (user_id = auth.uid());

-- push tokens
grant select, insert, update, delete on public.push_tokens to authenticated;
create policy push_tokens_own on public.push_tokens for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- RPC execute grants
grant execute on function public.nearby_shops(double precision, double precision, integer, text, text, integer, integer) to anon, authenticated;
grant execute on function public.get_available_slots(uuid, date, uuid)                        to anon, authenticated;
grant execute on function public.create_booking(uuid, uuid, timestamptz, text)                to authenticated;
grant execute on function public.cancel_booking(uuid)                                         to authenticated;
grant execute on function public.update_booking_status(uuid, public.booking_status, text)     to authenticated;
grant execute on function public.place_order(uuid, jsonb, public.fulfillment_type, text, text, text) to authenticated;
grant execute on function public.cancel_order(uuid)                                           to authenticated;
grant execute on function public.update_order_status(uuid, public.order_status)               to authenticated;
grant execute on function public.reply_to_review(uuid, text)                                  to authenticated;
grant execute on function public.shop_dashboard(uuid)                                         to authenticated;
grant execute on function public.set_shop_location(uuid, double precision, double precision)  to authenticated;
grant execute on function public.mark_notifications_read()                                    to authenticated;
grant execute on function public.delete_my_account()                                          to authenticated;
-- helpers used inside RLS policies must be executable by the querying role
grant execute on function public.is_shop_owner(uuid)   to anon, authenticated;
grant execute on function public.shop_is_visible(uuid) to anon, authenticated;
grant execute on function public.is_blocked_by_me(uuid) to anon, authenticated;
