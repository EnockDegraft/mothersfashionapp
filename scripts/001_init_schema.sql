-- Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku varchar(100) unique not null,
  name varchar(255) not null,
  description text,
  category varchar(100),
  unit_price decimal(12, 2) not null,
  cost_price decimal(12, 2),
  reorder_level integer default 10,
  status varchar(50) default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create inventory table
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  warehouse_location varchar(100),
  quantity_on_hand integer default 0,
  quantity_reserved integer default 0,
  last_counted_at timestamp with time zone,
  updated_at timestamp with time zone default now()
);

-- Create customers table
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  customer_name varchar(255) not null,
  customer_type varchar(50) default 'wholesale',
  email varchar(255),
  phone varchar(20),
  address varchar(255),
  city varchar(100),
  state varchar(50),
  postal_code varchar(20),
  contact_person varchar(255),
  credit_limit decimal(12, 2),
  payment_terms varchar(100),
  status varchar(50) default 'active',
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number varchar(50) unique not null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  order_date timestamp with time zone default now(),
  delivery_date timestamp with time zone,
  order_type varchar(50) default 'wholesale',
  status varchar(50) default 'pending',
  total_amount decimal(12, 2) default 0,
  notes text,
  created_by uuid not null references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create order_items table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity_ordered integer not null,
  unit_price decimal(12, 2) not null,
  discount decimal(5, 2) default 0,
  line_total decimal(12, 2) generated always as ((quantity_ordered * unit_price) - ((quantity_ordered * unit_price) * (discount / 100))) stored,
  created_at timestamp with time zone default now()
);

-- Create inventory_transactions table (audit log)
create table if not exists public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  transaction_type varchar(50) not null,
  quantity_change integer not null,
  reference_id varchar(255),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name varchar(255),
  last_name varchar(255),
  role varchar(50) default 'sales_personnel',
  department varchar(100),
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
create index if not exists idx_inventory_product_id on public.inventory(product_id);
create index if not exists idx_inventory_quantity on public.inventory(quantity_on_hand);
create index if not exists idx_customers_email on public.customers(email);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_by on public.orders(created_by);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_inventory_transactions_product_id on public.inventory_transactions(product_id);
create index if not exists idx_inventory_transactions_created_by on public.inventory_transactions(created_by);
