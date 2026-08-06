-- Comments engagement: permission flags + normalized post_comments

alter table site_settings
  add column if not exists comments_enabled boolean not null default true,
  add column if not exists likes_enabled boolean not null default true;

alter table posts
  add column if not exists comment_count int not null default 0;

create table if not exists post_comments (
  id text primary key,
  post_id text not null references posts(id) on delete cascade,
  user_name text not null,
  body text not null,
  lang_tag text not null default 'my',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists post_comments_post_id_sort_idx
  on post_comments (post_id, sort_order);

alter table post_comments enable row level security;

drop policy if exists "public read post_comments" on post_comments;
create policy "public read post_comments"
  on post_comments for select using (true);
