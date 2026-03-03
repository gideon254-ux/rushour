-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'book',
  image_url TEXT,
  download_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  product_id TEXT,
  payment_method TEXT,
  paypal_order_id TEXT,
  amount_paid REAL,
  status TEXT DEFAULT 'pending',
  download_token TEXT,
  token_expiry DATETIME,
  downloads_count INTEGER DEFAULT 0,
  mpesa_code TEXT,
  download_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (name, price, description, category, image_url) VALUES
('Azani ISP Documentation', 400, 'Complete ISP documentation for students', 'book', 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400'),
('Business Plan Template', 250, 'Professional business plan template', 'template', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400'),
('Mathematics Revision Slides', 300, 'Comprehensive math revision for exams', 'slides', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400');
