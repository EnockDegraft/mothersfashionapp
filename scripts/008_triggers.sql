-- Auto-create profile on user signup
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
  for each row
  execute function public.handle_new_user();

-- Auto-update order total when order items change
create or replace function public.update_order_total()
returns trigger as $$
begin
  update public.orders
  set total_amount = (
    select coalesce(sum(line_total), 0)
    from public.order_items
    where order_id = new.order_id
  ),
  updated_at = now()
  where id = new.order_id;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_update_order_total on public.order_items;

create trigger trigger_update_order_total
  after insert or update on public.order_items
  for each row
  execute function public.update_order_total();

-- Auto-log inventory transactions
create or replace function public.log_inventory_transaction()
returns trigger as $$
begin
  if (new.quantity_on_hand != old.quantity_on_hand) then
    insert into public.inventory_transactions (
      product_id,
      transaction_type,
      quantity_change,
      notes,
      created_by
    ) values (
      new.product_id,
      'adjustment',
      (new.quantity_on_hand - old.quantity_on_hand),
      'Inventory adjustment',
      auth.uid()
    );
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_log_inventory_transaction on public.inventory;

create trigger trigger_log_inventory_transaction
  after update on public.inventory
  for each row
  execute function public.log_inventory_transaction();
