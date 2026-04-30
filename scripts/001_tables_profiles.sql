-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  role text default 'sales_personnel' check (role in ('admin', 'sales_personnel')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- Profiles policies
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
