# Mother Clothing Ltd. - Quick Start Guide

Get started with the Inventory & Order Management System in minutes.

## 1. Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account (https://supabase.com)
- Environment variables configured (see step 2)

## 2. Environment Setup

### Get Your Supabase Credentials

1. Log in to your Supabase project
2. Go to Settings → API
3. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Create `.env.local`

In the project root, create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Database Setup

### Run SQL Migration Scripts

1. Open your Supabase project SQL editor
2. Execute scripts in this order:
   - `scripts/001_tables_profiles.sql`
   - `scripts/002_tables_products.sql`
   - `scripts/003_tables_inventory.sql`
   - `scripts/004_tables_customers.sql`
   - `scripts/005_tables_orders.sql`
   - `scripts/006_tables_order_items.sql`
   - `scripts/007_tables_transactions.sql`
   - `scripts/008_triggers.sql`

3. Create the `is_admin()` helper function:

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

4. Create RLS policies by executing `scripts/002_rls_policies.sql`

## 4. Start Development Server

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Visit `http://localhost:3000` in your browser.

## 5. Create Your First Account

### Sign Up

1. Click "Sign Up" on the home page
2. Enter your details:
   - **First Name & Last Name**: Your full name
   - **Email**: Your email address
   - **Role**: Select "Admin" (recommended for first account)
   - **Password**: Create a secure password

3. Click "Sign Up"
4. Check your email for confirmation (if required)

### First Login

After email confirmation:
1. Click "Login"
2. Enter your credentials
3. You'll be taken to the Dashboard

## 6. Add Your First Product

### Create a Product

1. From the Dashboard, click "Inventory"
2. Click "Add Product" button
3. Fill in:
   - **Product Name**: e.g., "Cotton T-Shirt"
   - **SKU**: e.g., "TSHIRT-001"
   - **Category**: e.g., "Shirts"
   - **Unit Price**: e.g., 15.99
   - **Reorder Level**: e.g., 10
4. Click "Add Product"

### Update Stock

1. Click on the product name to view details
2. Click "Add Adjustment"
3. Enter quantity and reason (e.g., "Add (Receipt)")
4. Click "Record Adjustment"

## 7. Add Your First Customer

### Create a Customer

1. From the Dashboard, click "Customers"
2. Click "Add Customer" button
3. Fill in required fields:
   - **Full Name**: Customer name
   - **Email**: Contact email
   - Optional fields: Phone, Business Name, Address, etc.
4. Click "Add Customer"

## 8. Create Your First Order

### New Order

1. From the Dashboard, click "Orders"
2. Click "Create Order"
3. Fill in:
   - **Customer**: Select the customer you created
   - **Order Type**: "Wholesale" or "Online"
   - **Status**: Start with "Pending"
   - **Total Amount**: Order total
   - **Notes**: Any special instructions
4. Click "Create Order"

## 9. View Analytics

1. From the Dashboard, click "Reports"
2. See key metrics:
   - Total Orders & Revenue
   - Product count & Low Stock items
   - Order trends
   - Category distribution

## 10. User Roles & Features

### Admin Account

Create a second admin account to test full permissions:

- Add/edit/delete products
- Manage all customers and orders
- View all analytics
- Access user management

### Sales Personnel Account

Create another account with the "Sales Personnel" role:

- Create and manage orders
- View customers
- View inventory
- View reports
- Cannot modify products or user data

## Common Tasks

### Search for a Product

1. Go to Inventory
2. Type product name or SKU in search box
3. Results filter instantly

### Update Customer Information

1. Go to Customers
2. Click customer name to open details
3. Click "Edit" button
4. Update information
5. Click "Save Changes"

### Track Order Status

1. Go to Orders
2. Find the order in the list
3. See current status (Pending/Confirmed/Shipped/Delivered)

### Check Low Stock

1. Go to Reports
2. View "Low Stock Items" metric
3. Go to Inventory to see which products need reordering

## Troubleshooting

### "Invalid API Key" Error

- Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct in `.env.local`
- Restart the development server after changing `.env.local`

### Can't See Data After Signup

- Check that all database tables were created successfully
- Verify RLS policies were applied
- Clear browser cache and reload

### Permission Denied Errors

- Confirm your user role is set correctly in the sign-up flow
- Check the `profiles` table in Supabase to verify role is saved
- Make sure RLS policies are enabled on all tables

### Missing Products/Customers/Orders

- Verify you're looking at data from the correct user/account
- Check RLS policies allow the current user to view the data
- Try signing in with an Admin account to see all data

## Next Steps

- Customize the branding by editing layouts and styles
- Add more users to your system
- Set up email notifications (optional enhancement)
- Export data for reporting

## Support

For detailed information:
- See `README.md` for full feature documentation
- See `DATABASE_SETUP.md` for database structure
- Check `lib/db/` folder for available database operations

## Tips

- Start with Admin account to test all features
- Create test data to understand the workflows
- Review the analytics dashboard to understand your data
- Use the search features to find products quickly

Happy managing!
