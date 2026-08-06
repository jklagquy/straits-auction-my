-- Logo / brand subtitle + public media bucket
-- Run in Supabase SQL Editor after 001_auction_cms.sql

alter table site_settings
  add column if not exists logo_url text default '',
  add column if not exists brand_sub_cn text default 'Straits Scholar''s Auction',
  add column if not exists brand_sub_zh text default 'Straits Scholar''s Auction',
  add column if not exists brand_sub_en text default 'Straits Scholar''s Auction',
  add column if not exists company_cn text default '',
  add column if not exists company_zh text default '',
  add column if not exists company_en text default '';

-- Public media bucket for logos / product images / covers
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for media bucket
drop policy if exists "public read media" on storage.objects;
create policy "public read media"
  on storage.objects for select
  using (bucket_id = 'media');

-- Writes go through service role (bypasses RLS); no anon write policy on purpose
