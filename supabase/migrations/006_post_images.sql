-- Multi-image galleries for collector lifestyle posts
alter table posts
  add column if not exists images jsonb not null default '[]'::jsonb;

-- Backfill from single cover image when empty
update posts
set images = jsonb_build_array(image)
where (images is null or images = '[]'::jsonb)
  and coalesce(image, '') <> '';
