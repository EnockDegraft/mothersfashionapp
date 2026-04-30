-- Create inventory table
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  quantity_on_hand integer not null default 0 check (quantity_on_hand >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  reorder_level integer default 10,
  last_restock_date timestamp with time zone,
  warehouse_location text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(product_id)
);

create index if not exists idx_inventory_product on public.inventory(product_id);

alter table public.inventory enable row level security;

-- Inventory policies: all can read, only admins can update
create policy "inventory_select_all" on public.inventory
  for select using (true);

create policy "inventory_update_admin" on public.inventory
  for update using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "inventory_delete_admin" on public.inventory
  for delete using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));
