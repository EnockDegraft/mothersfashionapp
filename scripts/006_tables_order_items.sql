-- Create order_items table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price decimal(10, 2) not null,
  line_total decimal(10, 2) generated always as (quantity * unit_price) stored,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_product on public.order_items(product_id);

alter table public.order_items enable row level security;

-- Order items policies
create policy "order_items_select_all" on public.order_items
  for select using (true);

create policy "order_items_insert_all" on public.order_items
  for insert with check (true);

create policy "order_items_update_admin" on public.order_items
  for update using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "order_items_delete_admin" on public.order_items
  for delete using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));
