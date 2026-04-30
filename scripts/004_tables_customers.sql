-- Create customers table
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_person text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  customer_type text check (customer_type in ('wholesale', 'online', 'retail')),
  credit_limit decimal(10, 2),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_customers_email on public.customers(email);
create index if not exists idx_customers_company on public.customers(company_name);

alter table public.customers enable row level security;

-- Customers policies
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
