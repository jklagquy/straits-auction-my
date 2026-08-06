-- Straits Scholar's Auction CMS
-- Run in Supabase SQL Editor or via CLI

create extension if not exists "pgcrypto";

-- Global price rules (singleton id = 1)
create table if not exists price_rules (
  id int primary key default 1 check (id = 1),
  default_uplift_enabled boolean not null default true,
  default_uplift_mode text not null default 'percent_daily'
    check (default_uplift_mode in ('percent_daily', 'fixed_daily')),
  default_uplift_value numeric(12,4) not null default 0.3,
  currency text not null default 'MYR',
  updated_at timestamptz not null default now()
);

insert into price_rules (id) values (1) on conflict (id) do nothing;

-- Site settings (singleton id = 1)
create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  brand_cn text not null default '海峡金石拍卖',
  brand_zh text not null default '海峽金石拍賣',
  brand_en text not null default 'Straits Scholar''s Auction',
  whatsapp_number text default '60321488800',
  tawk_property_id text default '',
  tawk_widget_id text default '',
  contact_email text default 'info@straitsscholars.com.my',
  contact_phone text default '+60 3-2148 8800',
  address_cn text default '',
  address_zh text default '',
  address_en text default '',
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

-- Sale sessions (Phase 2)
create table if not exists sale_sessions (
  id text primary key,
  slug text unique not null,
  title_cn text not null,
  title_zh text not null,
  title_en text not null,
  description_cn text default '',
  description_zh text default '',
  description_en text default '',
  preview_start date,
  preview_end date,
  sale_date date,
  location_cn text default '',
  location_zh text default '',
  location_en text default '',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Products / lots
create table if not exists products (
  id text primary key,
  slug text unique not null,
  lot_no text not null,
  category_cn text not null,
  category_zh text not null,
  category_en text not null,
  title_cn text not null,
  title_zh text not null,
  title_en text not null,
  excerpt_cn text default '',
  excerpt_zh text default '',
  excerpt_en text default '',
  description_cn text default '',
  description_zh text default '',
  description_en text default '',
  image text not null,
  gallery jsonb not null default '[]'::jsonb,
  specs jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  status text not null default 'preview'
    check (status in ('preview', 'available', 'reserved', 'sold')),
  base_price_low numeric(14,2) not null default 0,
  base_price_high numeric(14,2) not null default 0,
  currency text not null default 'MYR',
  uplift_enabled boolean,
  uplift_mode text check (uplift_mode is null or uplift_mode in ('percent_daily', 'fixed_daily')),
  uplift_value numeric(12,4),
  uplift_start_at date not null default current_date,
  price_cap_high numeric(14,2),
  sale_session_id text references sale_sessions(id) on delete set null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_sort on products (active, sort_order);
create index if not exists products_slug on products (slug);

-- News articles
create table if not exists articles (
  id text primary key,
  slug text unique not null,
  title_cn text not null,
  title_zh text not null,
  title_en text not null,
  excerpt_cn text default '',
  excerpt_zh text default '',
  excerpt_en text default '',
  body_cn text default '',
  body_zh text default '',
  body_en text default '',
  cover text not null default '',
  category_cn text default '',
  category_zh text default '',
  category_en text default '',
  published_at date not null default current_date,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Collector posts
create table if not exists posts (
  id text primary key,
  author_cn text not null,
  author_zh text not null,
  author_en text not null,
  avatar text default '',
  content_cn text not null,
  content_zh text not null,
  content_en text not null,
  image text default '',
  published_at date not null default current_date,
  likes int not null default 0,
  views int not null default 0,
  comments jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Marquee messages
create table if not exists marquee_messages (
  id text primary key,
  text_cn text not null,
  text_zh text not null,
  text_en text not null,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Hero / news banners
create table if not exists banners (
  id text primary key,
  image text not null,
  headline_cn text default '',
  headline_zh text default '',
  headline_en text default '',
  sub_cn text default '',
  sub_zh text default '',
  sub_en text default '',
  category text not null default 'hero' check (category in ('hero', 'news')),
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Inquiry CRM
create table if not exists inquiries (
  id text primary key,
  name text not null,
  email text not null,
  phone text default '',
  message text not null,
  source text not null default 'contact',
  lot_slug text,
  locale text default 'cn',
  status text not null default 'new'
    check (status in ('new', 'following', 'closed', 'won')),
  admin_notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Daily price snapshots for trend chart
create table if not exists price_snapshots (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  snapshot_date date not null,
  price_low numeric(14,2) not null,
  price_high numeric(14,2) not null,
  unique (product_id, snapshot_date)
);

create index if not exists price_snapshots_product on price_snapshots (product_id, snapshot_date);

-- RLS: public read active content
alter table products enable row level security;
alter table articles enable row level security;
alter table posts enable row level security;
alter table marquee_messages enable row level security;
alter table banners enable row level security;
alter table site_settings enable row level security;
alter table price_rules enable row level security;
alter table sale_sessions enable row level security;

create policy "public read active products" on products for select using (active = true);
create policy "public read active articles" on articles for select using (active = true);
create policy "public read active posts" on posts for select using (active = true);
create policy "public read active marquee" on marquee_messages for select using (active = true);
create policy "public read active banners" on banners for select using (active = true);
create policy "public read site_settings" on site_settings for select using (true);
create policy "public read price_rules" on price_rules for select using (true);
create policy "public read active sessions" on sale_sessions for select using (active = true);

-- Public insert inquiries
alter table inquiries enable row level security;
create policy "public insert inquiries" on inquiries for insert with check (true);

-- Service role bypasses RLS for admin API routes
