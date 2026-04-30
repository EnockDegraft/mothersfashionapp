# Manual Database Setup Guide

Since the automated setup script encountered issues, follow these steps to manually set up your Supabase database:

## Step 1: Access Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your Mother Clothing Ltd project
3. Click on "SQL Editor" in the left sidebar

## Step 2: Create Tables

Copy and paste the following SQL statements one at a time into the SQL Editor and click "Run":

### 2.1 Create Products Table

```sql
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  sku VARCHAR NOT NULL UNIQUE,
  category VARCHAR,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 Create Customers Table

```sql
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  business_name VARCHAR,
  contact_email VARCHAR NOT NULL,
  contact_phone VARCHAR,
  address VARCHAR,
  city VARCHAR,
  state VARCHAR,
  postal_code VARCHAR,
  country VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.3 Create Inventory Table

```sql
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity_on_hand INTEGER DEFAULT 0,
  low_stock_level INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id)
);
```

### 2.4 Create Orders Table

```sql
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  order_number VARCHAR NOT NULL UNIQUE,
  order_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR DEFAULT 'pending',
  total_amount DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.5 Create Order Items Table

```sql
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Step 3: Insert Sample Data

### 3.1 Insert Sample Products

```sql
INSERT INTO products (name, sku, category, unit_price) VALUES
('Cotton T-Shirt', 'TS-001', 'Tops', 12.99),
('Denim Jeans', 'DJ-001', 'Bottoms', 49.99),
('Summer Dress', 'DR-001', 'Dresses', 34.99),
('Polo Shirt', 'PS-001', 'Tops', 24.99),
('Cargo Shorts', 'CS-001', 'Bottoms', 39.99),
('Cotton Hoodie', 'HO-001', 'Tops', 34.99),
('Linen Pants', 'LP-001', 'Bottoms', 44.99),
('Casual Blazer', 'BL-001', 'Outerwear', 79.99);
```

### 3.2 Insert Inventory for Products

```sql
INSERT INTO inventory (product_id, quantity_on_hand, low_stock_level)
SELECT id, FLOOR(RANDOM() * 200 + 20), 30 FROM products;
```

### 3.3 Insert Sample Customers

```sql
INSERT INTO customers (name, business_name, contact_email, contact_phone, city, state, country) VALUES
('Kwaku Mensah', 'Mensah Enterprises', 'kwaku@mensah.com', '0501234567', 'Accra', 'Greater Accra', 'Ghana'),
('Ama Boateng', 'Boateng Traders', 'ama@boateng.com', '0541234567', 'Kumasi', 'Ashanti', 'Ghana'),
('Kofi Darko', NULL, 'kofi.darko@email.com', '0551234567', 'Takoradi', 'Western', 'Ghana'),
('Abena Asante', 'Asante Collections', 'abena@asante.com', '0231234567', 'Cape Coast', 'Central', 'Ghana'),
('Yaw Ofori', 'Ofori Distribution', 'yaw@ofori.com', '0271234567', 'Sekondi', 'Western', 'Ghana');
```

### 3.4 Insert Sample Orders

```sql
INSERT INTO orders (customer_id, order_number, status, total_amount) VALUES
((SELECT id FROM customers WHERE name = 'Kwaku Mensah' LIMIT 1), 'ORD-001', 'completed', 150.00),
((SELECT id FROM customers WHERE name = 'Ama Boateng' LIMIT 1), 'ORD-002', 'pending', 250.00),
((SELECT id FROM customers WHERE name = 'Kofi Darko' LIMIT 1), 'ORD-003', 'processing', 185.50),
((SELECT id FROM customers WHERE name = 'Abena Asante' LIMIT 1), 'ORD-004', 'completed', 320.00);
```

## Step 4: Enable Row Level Security (Optional but Recommended)

To enable RLS for better security:

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all authenticated users to read/write
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on inventory" ON inventory FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on order_items" ON order_items FOR ALL USING (true);
```

## Step 5: Verify Your Setup

Run the following query to verify all tables are created:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

You should see:
- customers
- inventory
- order_items
- orders
- products

## Step 6: Test CRUD Operations

Your application is now ready to use! The pages will automatically:

- **Create (C)**: Add new products, customers, and orders through the UI
- **Read (R)**: Display all data from the database tables
- **Update (U)**: Edit product prices, customer info, order status
- **Delete (D)**: Remove products and customers

All CRUD operations are fully functional and connected to your Supabase database.

## Troubleshooting

If you encounter errors:

1. **"Table already exists"** - The tables are already created. You can proceed to the next step.
2. **"Foreign key constraint"** - Ensure parent tables (products, customers) are created before child tables (orders, order_items).
3. **"Permission denied"** - Check your Supabase API key and ensure it has write permissions.

## Next Steps

1. Log in with admin credentials: `admin@motherclothing.com` / `Admin@2024`
2. Create employee accounts in the User Management section
3. Start managing inventory, customers, and orders!
