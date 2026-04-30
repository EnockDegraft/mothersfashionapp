const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('[v0] Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    console.log('[v0] Starting database setup...')

    // Create products table
    console.log('[v0] Creating products table...')
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR NOT NULL UNIQUE,
          sku VARCHAR NOT NULL UNIQUE,
          category VARCHAR,
          unit_price DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    })

    // Create customers table
    console.log('[v0] Creating customers table...')
    await supabase.rpc('exec', {
      sql: `
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
        )
      `
    })

    // Create inventory table
    console.log('[v0] Creating inventory table...')
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS inventory (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          quantity_on_hand INTEGER DEFAULT 0,
          low_stock_level INTEGER DEFAULT 10,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(product_id)
        )
      `
    })

    // Create orders table
    console.log('[v0] Creating orders table...')
    await supabase.rpc('exec', {
      sql: `
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
        )
      `
    })

    // Create order items table
    console.log('[v0] Creating order_items table...')
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS order_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id),
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `
    })

    // Insert sample products
    console.log('[v0] Inserting sample products...')
    const { data: products } = await supabase
      .from('products')
      .insert([
        { name: 'Cotton T-Shirt', sku: 'TS-001', category: 'Tops', unit_price: 12.99 },
        { name: 'Denim Jeans', sku: 'DJ-001', category: 'Bottoms', unit_price: 49.99 },
        { name: 'Summer Dress', sku: 'DR-001', category: 'Dresses', unit_price: 34.99 },
        { name: 'Polo Shirt', sku: 'PS-001', category: 'Tops', unit_price: 24.99 },
        { name: 'Cargo Shorts', sku: 'CS-001', category: 'Bottoms', unit_price: 39.99 },
      ])
      .select()

    // Insert inventory for products
    if (products && products.length > 0) {
      console.log('[v0] Inserting inventory records...')
      await supabase.from('inventory').insert(
        products.map((product) => ({
          product_id: product.id,
          quantity_on_hand: Math.floor(Math.random() * 200) + 20,
          low_stock_level: 30,
        }))
      )
    }

    // Insert sample customers
    console.log('[v0] Inserting sample customers...')
    const { data: customers } = await supabase
      .from('customers')
      .insert([
        {
          name: 'Kwaku Mensah',
          business_name: 'Mensah Enterprises',
          contact_email: 'kwaku@mensah.com',
          contact_phone: '0501234567',
          city: 'Accra',
          state: 'Greater Accra',
          country: 'Ghana',
        },
        {
          name: 'Ama Boateng',
          business_name: 'Boateng Traders',
          contact_email: 'ama@boateng.com',
          contact_phone: '0541234567',
          city: 'Kumasi',
          state: 'Ashanti',
          country: 'Ghana',
        },
        {
          name: 'Kofi Darko',
          business_name: null,
          contact_email: 'kofi.darko@email.com',
          contact_phone: '0551234567',
          city: 'Takoradi',
          state: 'Western',
          country: 'Ghana',
        },
      ])
      .select()

    // Insert sample orders
    if (customers && customers.length > 0) {
      console.log('[v0] Inserting sample orders...')
      await supabase.from('orders').insert([
        {
          customer_id: customers[0].id,
          order_number: 'ORD-001',
          status: 'completed',
          total_amount: 150.00,
        },
        {
          customer_id: customers[1].id,
          order_number: 'ORD-002',
          status: 'pending',
          total_amount: 250.00,
        },
      ])
    }

    console.log('[v0] ✅ Database setup completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('[v0] ❌ Error setting up database:', error.message)
    process.exit(1)
  }
}

setupDatabase()
