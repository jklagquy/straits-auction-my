alter table banners
  add column if not exists link_slug text not null default '';
