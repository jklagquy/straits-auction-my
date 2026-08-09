-- Stock quantity for lots (mirrors old-site inventory field)
alter table products
  add column if not exists stock_quantity integer not null default 1;

comment on column products.stock_quantity is 'Available stock / limited edition count shown on product detail';
