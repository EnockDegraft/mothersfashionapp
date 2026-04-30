-- Create orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  order_number text unique not null,
  order_date timestamp with time zone default now(),
  delivery_date timestamp with time zone,
  status text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10, 2) default 0,
  order_type text check (order_type in ('wholesale', 'online', 'retail')),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_number on public.orders(order_number);

alter table public.orders enable row level security;

-- Orders policies
create policy "orders_select_own_or_admin" on public.orders
  for select using (
    auth.uid() = created_by or exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "orders_insert_all" on public.orders
  for insert with check (true);

create policy "orders_update_own_or_admin" on public.orders
  for update using (
    auth.uid() = created_by or exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "orders_delete_admin" on public.orders
  for delete using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));
