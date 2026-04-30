-- Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  description text,
  category text,
  unit_price decimal(10, 2) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_products_sku on public.products(sku);
create index if not exists idx_products_category on public.products(category);

alter table public.products enable row level security;

-- Products policies: all can read, only admins can write
create policy "products_select_all" on public.products
  for select using (true);

create policy "products_insert_admin" on public.products
  for insert with check (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "products_update_admin" on public.products
  for update using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "products_delete_admin" on public.products
  for delete using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));
