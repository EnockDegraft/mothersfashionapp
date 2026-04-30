-- Create inventory_transactions table for audit logging
create table if not exists public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  transaction_type text check (transaction_type in ('purchase', 'sale', 'adjustment', 'return', 'restock')),
  quantity_change integer not null,
  notes text,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_transactions_product on public.inventory_transactions(product_id);
create index if not exists idx_transactions_date on public.inventory_transactions(created_at);
create index if not exists idx_transactions_type on public.inventory_transactions(transaction_type);

alter table public.inventory_transactions enable row level security;

-- Inventory transactions policies: all can read, automatic writes via trigger
create policy "inventory_transactions_select_all" on public.inventory_transactions
  for select using (true);
