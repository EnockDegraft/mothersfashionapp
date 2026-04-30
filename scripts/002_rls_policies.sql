-- Enable RLS on all tables
alter table if exists public.products enable row level security;
alter table if exists public.inventory enable row level security;
alter table if exists public.customers enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;
alter table if exists public.inventory_transactions enable row level security;
alter table if exists public.profiles enable row level security;

-- Helper function to check user role
create or replace function public.is_admin()
returns boolean as $$
declare
  user_role text;
begin
  user_role := auth.jwt() ->> 'user_metadata' -> 'role';
  return coalesce(user_role, 'sales_personnel') = 'admin';
exception when others then
  return false;
end;
$$ language plpgsql security definer stable;

-- Products policies: all can read, only admins can write
create policy "products_select_all" on public.products
  for select using (true);

create policy "products_insert_admin" on public.products
  for insert with check (public.is_admin());

create policy "products_update_admin" on public.products
  for update using (public.is_admin());

create policy "products_delete_admin" on public.products
  for delete using (public.is_admin());

-- Inventory policies: all can read, only admins can update
create policy "inventory_select_all" on public.inventory
  for select using (true);

create policy "inventory_update_admin" on public.inventory
  for update using (public.is_admin());

create policy "inventory_delete_admin" on public.inventory
  for delete using (public.is_admin());

-- Customers policies
create policy "customers_select_all" on public.customers
  for select using (true);

create policy "customers_insert_all" on public.customers
  for insert with check (true);

create policy "customers_update_own_or_admin" on public.customers
  for update using (
    auth.uid() = created_by or public.is_admin()
  );

create policy "customers_delete_admin" on public.customers
  for delete using (public.is_admin());

-- Orders policies
create policy "orders_select_own_or_admin" on public.orders
  for select using (
    auth.uid() = created_by or public.is_admin()
  );

create policy "orders_insert_all" on public.orders
  for insert with check (true);

create policy "orders_update_own_or_admin" on public.orders
  for update using (
    auth.uid() = created_by or public.is_admin()
  );

create policy "orders_delete_admin" on public.orders
  for delete using (public.is_admin());

-- Order items policies
create policy "order_items_select_all" on public.order_items
  for select using (true);

create policy "order_items_insert_all" on public.order_items
  for insert with check (true);

create policy "order_items_update_admin" on public.order_items
  for update using (public.is_admin());

create policy "order_items_delete_admin" on public.order_items
  for delete using (public.is_admin());

-- Inventory transactions policies: all can read, automatic writes via trigger
create policy "inventory_transactions_select_all" on public.inventory_transactions
  for select using (true);

-- Profiles policies
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

create policy "profiles_delete_admin" on public.profiles
  for delete using (public.is_admin());
