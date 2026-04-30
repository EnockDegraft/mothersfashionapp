# Mother Clothing Ltd. - Database Setup Guide

This document provides instructions for setting up the database for the Inventory & Order Management System.

## Prerequisites

- Supabase project created and connected
- Database access through Supabase dashboard

## Database Setup Steps

### Step 1: Create Tables

Run the following SQL scripts in your Supabase SQL editor in order:

#### 1.1 Create Profiles Table
Execute the contents of `scripts/001_tables_profiles.sql`

This creates:
- `profiles` table for user information and roles

#### 1.2 Create Products Table
Execute the contents of `scripts/002_tables_products.sql`

This creates:
- `products` table for product catalog

#### 1.3 Create Inventory Table
Execute the contents of `scripts/003_tables_inventory.sql`

This creates:
- `inventory` table for stock tracking

#### 1.4 Create Customers Table
Execute the contents of `scripts/004_tables_customers.sql`

This creates:
- `customers` table for customer records

#### 1.5 Create Orders Table
Execute the contents of `scripts/005_tables_orders.sql`

This creates:
- `orders` table for order management

#### 1.6 Create Order Items Table
Execute the contents of `scripts/006_tables_order_items.sql`

This creates:
- `order_items` table for line items in orders

#### 1.7 Create Inventory Transactions Table
Execute the contents of `scripts/007_tables_transactions.sql`

This creates:
- `inventory_transactions` table for audit logging

#### 1.8 Create Triggers
Execute the contents of `scripts/008_triggers.sql`

This creates:
- Trigger for auto-creating user profiles on signup
- Trigger for logging inventory transactions

### Step 2: Enable Row Level Security (RLS)

RLS is enabled automatically in the table creation scripts, but you can manually enable it if needed:

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
```

### Step 3: Create RLS Policies

Create a helper function for role checking:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  user_role := auth.jwt() ->> 'user_metadata' -> 'role';
  RETURN coalesce(user_role, 'sales_personnel') = 'admin';
EXCEPTION WHEN others THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

Then create the policies by executing `scripts/002_rls_policies.sql`

## User Roles

The system supports two roles:

### Admin
- Full access to all features
- Can create, edit, and delete products
- Can view all orders and customers
- Can access reports and analytics
- Can manage user accounts

### Sales Personnel
- Can create and manage orders
- Can view customer information
- Can view inventory status
- Can view their own order history
- Cannot modify product or user information

## Environment Variables

Make sure the following environment variables are set in your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are automatically set when you connect the Supabase integration in v0.

## Testing the Setup

1. **Sign Up**: Create an account at `/auth/sign-up`
   - You can sign up as either "Admin" or "Sales Personnel"
   - Email confirmation may be required

2. **Dashboard**: After login, you should see the main dashboard at `/protected`

3. **Test Features**:
   - Navigate to Inventory to add products
   - Go to Customers to add customer records
   - Create orders in the Orders section
   - View analytics in Reports

## Troubleshooting

### "No row found" errors when creating customers/orders
- Make sure the user profile was created via the trigger
- Check that the trigger is working by verifying a profile exists in the `profiles` table after signup

### RLS policy errors
- Ensure the `is_admin()` function is created correctly
- Check that user metadata includes the `role` field during signup

### Missing data in tables
- Verify all table creation scripts were executed
- Check Supabase project status

## Database Schema Overview

- **profiles**: Stores user information and role metadata
- **products**: Product catalog with SKU, price, and reorder levels
- **inventory**: Current stock levels per product
- **customers**: Customer contact information and details
- **orders**: Order records with status tracking
- **order_items**: Line items for each order
- **inventory_transactions**: Audit log of all inventory changes

## Support

For issues with database setup, check the Supabase documentation at https://supabase.com/docs
