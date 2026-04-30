-- Mother Clothing Ltd. - Complete Database Setup
-- This script creates all necessary tables and RLS policies

-- ============================================================
-- PROFILES TABLE
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  role text default 'sales_personnel' check (role in ('admin', 'sales_personnel')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "profiles_delete_admin" on public.profiles
  for delete using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
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

-- ============================================================
-- INVENTORY TABLE
-- ============================================================
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  quantity_on_hand integer default 0,
  low_stock_level integer default 10,
  reorder_quantity integer default 50,
  warehouse_location text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(product_id)
);

create index if not exists idx_inventory_product_id on public.inventory(product_id);

alter table public.inventory enable row level security;

create policy "inventory_select_all" on public.inventory
  for select using (true);

create policy "inventory_update_admin" on public.inventory
  for update using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- ============================================================
-- CUSTOMERS TABLE
-- ============================================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text,
  contact_email text not null,
  contact_phone text,
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_customers_email on public.customers(contact_email);

alter table public.customers enable row level security;

create policy "customers_select_all" on public.customers
  for select using (true);

create policy "customers_insert_all" on public.customers
  for insert with check (true);

create policy "customers_update_own_or_admin" on public.customers
  for update using (
    auth.uid() = created_by or exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "customers_delete_admin" on public.customers
  for delete using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- ============================================================
-- ORDERS TABLE
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid not null references public.customers(id),
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(12, 2),
  order_date timestamp with time zone default now(),
  delivery_date timestamp with time zone,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_order_number on public.orders(order_number);

alter table public.orders enable row level security;

create policy "orders_select_own_or_all_for_admin" on public.orders
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

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null,
  unit_price decimal(10, 2) not null,
  subtotal decimal(12, 2),
  created_at timestamp with time zone default now()
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);

alter table public.order_items enable row level security;

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

-- ============================================================
-- INVENTORY TRANSACTIONS TABLE
-- ============================================================
create table if not exists public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('in', 'out', 'adjustment', 'return')),
  quantity integer not null,
  reference_id text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

create index if not exists idx_transactions_product_id on public.inventory_transactions(product_id);
create index if not exists idx_transactions_type on public.inventory_transactions(transaction_type);

alter table public.inventory_transactions enable row level security;

create policy "transactions_select_all" on public.inventory_transactions
  for select using (true);

create policy "transactions_insert_all" on public.inventory_transactions
  for insert with check (true);

-- ============================================================
-- AUDIT LOG TABLE
-- ============================================================
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text,
  action text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  changed_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

create index if not exists idx_audit_logs_table on public.audit_logs(table_name);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at);

alter table public.audit_logs enable row level security;

create policy "audit_logs_select_admin" on public.audit_logs
  for select using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- ============================================================
-- TRIGGER FUNCTION - Auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'sales_personnel')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- INSERT SAMPLE DATA (optional, comment out if not needed)
-- ============================================================

-- Insert sample products
insert into public.products (sku, name, description, category, unit_price, created_by)
values 
  ('SHIRT-001', 'Classic Cotton T-Shirt', 'Comfortable 100% cotton t-shirt', 'Shirts', 15.99, null),
  ('SHIRT-002', 'Designer Polo Shirt', 'Premium polo shirt with logo', 'Shirts', 35.99, null),
  ('PANT-001', 'Black Denim Jeans', 'Classic black denim jeans', 'Pants', 49.99, null),
  ('PANT-002', 'Casual Chinos', 'Comfortable casual chinos', 'Pants', 39.99, null),
  ('DRESS-001', 'Summer Dress', 'Light cotton summer dress', 'Dresses', 45.00, null),
  ('DRESS-002', 'Formal Evening Dress', 'Elegant evening wear', 'Dresses', 89.99, null)
on conflict do nothing;

-- Insert sample customers
insert into public.customers (name, business_name, contact_email, contact_phone, city, state, country)
values
  ('Kwaku Mensah', 'Mensah Enterprises', 'kwaku@mensah.com', '0501234567', 'Accra', 'Greater Accra', 'Ghana'),
  ('Ama Boateng', 'Boateng Traders', 'ama@boateng.com', '0541234567', 'Kumasi', 'Ashanti', 'Ghana'),
  ('Kofi Darko', 'Darko Retail', 'kofi@darko.com', '0551234567', 'Takoradi', 'Western', 'Ghana'),
  ('Abena Asante', 'Asante Collections', 'abena@asante.com', '0561234567', 'Cape Coast', 'Central', 'Ghana')
on conflict do nothing;
