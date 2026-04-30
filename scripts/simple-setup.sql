-- Simple Database Setup for Mother Clothing Ltd
-- No RLS policies - just basic tables

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- INVENTORY TABLE  
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_on_hand INTEGER DEFAULT 0,
  low_stock_level INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 50,
  warehouse_location TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id)
);

-- CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_name TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_date TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- INVENTORY TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  transaction_type TEXT NOT NULL,
  quantity_change INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(contact_email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON inventory_transactions(product_id);

-- Insert sample products
INSERT INTO products (sku, name, category, unit_price, description) VALUES
('TS-001', 'Cotton T-Shirt', 'Tops', 12.99, 'Classic cotton t-shirt available in multiple colors'),
('DJ-001', 'Denim Jeans', 'Bottoms', 49.99, 'Premium denim jeans with comfortable fit'),
('DR-001', 'Summer Dress', 'Dresses', 34.99, 'Light and breathable summer dress'),
('PS-001', 'Polo Shirt', 'Tops', 24.99, 'Professional polo shirt for casual wear'),
('CS-001', 'Cargo Shorts', 'Bottoms', 39.99, 'Practical cargo shorts with multiple pockets')
ON CONFLICT (sku) DO NOTHING;

-- Insert sample inventory
INSERT INTO inventory (product_id, quantity_on_hand, low_stock_level, reorder_quantity, warehouse_location)
SELECT id, 150, 30, 100, 'Warehouse A' FROM products WHERE sku = 'TS-001'
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO inventory (product_id, quantity_on_hand, low_stock_level, reorder_quantity, warehouse_location)
SELECT id, 45, 20, 50, 'Warehouse B' FROM products WHERE sku = 'DJ-001'
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO inventory (product_id, quantity_on_hand, low_stock_level, reorder_quantity, warehouse_location)
SELECT id, 25, 40, 75, 'Warehouse A' FROM products WHERE sku = 'DR-001'
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO inventory (product_id, quantity_on_hand, low_stock_level, reorder_quantity, warehouse_location)
SELECT id, 80, 25, 100, 'Warehouse C' FROM products WHERE sku = 'PS-001'
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO inventory (product_id, quantity_on_hand, low_stock_level, reorder_quantity, warehouse_location)
SELECT id, 15, 20, 50, 'Warehouse B' FROM products WHERE sku = 'CS-001'
ON CONFLICT (product_id) DO NOTHING;

-- Insert sample customers
INSERT INTO customers (name, business_name, contact_email, contact_phone, city, state, country) VALUES
('Kwaku Mensah', 'Mensah Enterprises', 'kwaku@mensah.com', '0501234567', 'Accra', 'Greater Accra', 'Ghana'),
('Ama Boateng', 'Boateng Traders', 'ama@boateng.com', '0541234567', 'Kumasi', 'Ashanti', 'Ghana'),
('Kofi Darko', NULL, 'kofi.darko@email.com', '0551234567', 'Takoradi', 'Western', 'Ghana'),
('Abena Asante', 'Asante Collections', 'abena@asante.com', NULL, 'Cape Coast', 'Central', 'Ghana'),
('Eric Mensah', 'Mensah Retail', 'eric@retail.com', '0501112222', 'Accra', 'Greater Accra', 'Ghana')
ON CONFLICT DO NOTHING;
