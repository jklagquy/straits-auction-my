-- Public site on/off switch. Domain stays registered; frontend hides all data.
alter table site_settings
  add column if not exists site_public_enabled boolean not null default true;
