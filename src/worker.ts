// Cloudflare Worker - serves both frontend + API
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // API endpoints
    if (path.startsWith('/api/')) {
      return handleApi(request, env, corsHeaders);
    }

    // Serve HTML
    return new Response(INDEX_HTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};

function getMockProducts() {
  return [
    { id: 1, name: 'Azani ISP Documentation', price: 400, description: 'Complete ISP documentation for students. Includes ERD, UML diagrams, and source code.', category: 'book', image_url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400' },
    { id: 2, name: 'Business Plan Template', price: 250, description: 'Professional business plan template for students and entrepreneurs.', category: 'template', image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400' },
    { id: 3, name: 'Mathematics Revision Slides', price: 300, description: 'Comprehensive math revision slides for KCSE and university exams.', category: 'slides', image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400' },
    { id: 4, name: 'Physics Lab Report Template', price: 200, description: 'Professional lab report template following university standards.', category: 'template', image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400' },
    { id: 5, name: 'Programming Algorithms Guide', price: 350, description: 'Essential algorithms and data structures for CS students.', category: 'book', image_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400' },
    { id: 6, name: 'Chemistry Notes PDF', price: 280, description: 'Complete chemistry notes for form 4 students.', category: 'book', image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400' }
  ];
}

async function handleApi(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const db = env.DB;

  const json = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  };

  try {
    // GET products
    if (path === '/api/products' && method === 'GET') {
      try {
        const { results } = await db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
        return json(results && results.length > 0 ? results : getMockProducts());
      } catch (e) {
        return json(getMockProducts());
      }
    }

    // POST product (admin)
    if (path === '/api/products' && method === 'POST') {
      const body = await request.json();
      const { name, price, description, category, image_url, download_url } = body;
      const result = await db.prepare(
        `INSERT INTO products (name, price, description, category, image_url, download_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
      ).bind(name, price, description, category, image_url, download_url).run();
      const newProduct = await db.prepare('SELECT * FROM products WHERE id = ?').bind(result.lastInsertRowid).first();
      return json(newProduct, 201);
    }

    // DELETE product (admin)
    if (path.match(/^\/api\/products\/.+$/) && method === 'DELETE') {
      const id = path.split('/').pop();
      await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
      return json({ success: true });
    }

    // GET orders (admin)
    if (path === '/api/orders' && method === 'GET') {
      try {
        const { results } = await db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
        return json(results || []);
      } catch (e) {
        return json([]);
      }
    }

    // POST order
    if (path === '/api/orders' && method === 'POST') {
      const body = await request.json();
      const { email, product_id, payment_method, paypal_order_id, amount_paid, status, download_token, token_expiry, downloads_count, mpesa_code, download_url } = body;
      const result = await db.prepare(
        `INSERT INTO orders (email, product_id, payment_method, paypal_order_id, amount_paid, status, download_token, token_expiry, downloads_count, mpesa_code, download_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      ).bind(email, product_id, payment_method, paypal_order_id, amount_paid, status || 'pending', download_token, token_expiry, downloads_count || 0, mpesa_code, download_url).run();
      const newOrder = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(result.lastInsertRowid).first();
      return json(newOrder, 201);
    }

    // PUT order (admin)
    if (path.match(/^\/api\/orders\/.+$/) && method === 'PUT') {
      const id = path.split('/').pop();
      const body = await request.json();
      const fields = Object.keys(body).filter(k => k !== 'id');
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      const values = fields.map(f => body[f]);
      await db.prepare(`UPDATE orders SET ${setClause} WHERE id = ?`).bind(...values, id).run();
      const updated = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
      return json(updated);
    }

    return json({ error: 'Not found' }, 404);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>rushour - Premier Academic Resources</title>
  <meta name="description" content="High-quality academic resources for Kenyan students">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://www.paypal.com/sdk/js?client-id=AbsiUPJ8ZNu8UMqke1HVoJXBFCRECG9QliyN9o7RexoCNEoCNzZiq3bA-O0Pj5zDdgdfCAuu2mOxJyIk&currency=USD"></script>
  <style>
    body{font-family:'Inter Tight',sans-serif}
    .blob{animation:blob 7s infinite}
    .blob:nth-child(1){animation-delay:0s}
    .blob:nth-child(2){animation-delay:2s}
    .blob:nth-child(3){animation-delay:4s}
    @keyframes blob{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}}
    .fade-in{animation:fadeIn 0.8s ease-out forwards}
    @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    .float{animation:float 3s ease-in-out infinite}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    .shimmer{background:linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  </style>
</head>
<body class="bg-gray-50">
  
  <!-- Header -->
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
    <nav class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
      <div class="flex items-center gap-2 cursor-pointer" onclick="window.scrollTo(0,0)">
        <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-2 py-1 rounded-lg font-black text-xl shadow-lg">RH</div>
        <span class="font-extrabold text-xl text-gray-900">rushour<span class="text-orange-600">.com</span></span>
      </div>
      <div class="flex items-center gap-4">
        <a href="#products" class="text-gray-600 hover:text-orange-600 font-medium transition">Library</a>
        <a href="#features" class="text-gray-600 hover:text-orange-600 font-medium transition hidden sm:block">Features</a>
        <a href="#testimonials" class="text-gray-600 hover:text-orange-600 font-medium transition hidden md:block">Reviews</a>
        <button onclick="openAdmin()" class="text-gray-400 hover:text-gray-600 font-medium text-sm">Admin</button>
        <button onclick="scrollToProducts()" class="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition transform">Browse</button>
      </div>
    </nav>
  </header>

  <!-- Hero -->
  <section class="relative pt-32 pb-20 px-4 overflow-hidden">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 blob"></div>
      <div class="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 blob"></div>
      <div class="absolute bottom-10 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 blob"></div>
    </div>
    
    <div class="max-w-7xl mx-auto relative z-10">
      <div class="text-center max-w-3xl mx-auto">
        <div class="fade-in inline-block bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-sm font-semibold mb-6">📚 Trusted by 2,500+ Students</div>
        <h1 class="fade-in text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
          Academic <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Excellence</span><br>
          <span class="text-gray-400">On Demand.</span>
        </h1>
        <p class="fade-in text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Access premium ISP documentation, revision slides, and project templates. <strong class="text-orange-600">Instant Delivery.</strong> <strong class="text-green-600">Verified Quality.</strong></p>
        <div class="fade-in flex flex-col sm:flex-row gap-4 justify-center">
          <button onclick="scrollToProducts()" class="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-2xl hover:scale-105 transition transform flex items-center justify-center gap-2">
            Browse Library
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <a href="https://wa.me/254768213649" target="_blank" class="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-full font-bold text-lg hover:border-green-500 hover:text-green-600 transition flex items-center justify-center gap-2">
            💬 Chat with Us
          </a>
        </div>
        <div class="fade-in mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <span class="flex items-center gap-2">✅ Instant Digital Delivery</span>
          <span class="flex items-center gap-2">🔒 Secure Payments</span>
          <span class="flex items-center gap-2">⭐ Quality Verified</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats -->
  <section class="py-10 bg-white border-y border-gray-100">
    <div class="max-w-7xl mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div class="text-3xl font-black text-orange-600">2,500+</div>
          <div class="text-gray-500 text-sm">Students Served</div>
        </div>
        <div>
          <div class="text-3xl font-black text-orange-600">50+</div>
          <div class="text-gray-500 text-sm">Resources</div>
        </div>
        <div>
          <div class="text-3xl font-black text-orange-600">98%</div>
          <div class="text-gray-500 text-sm">Satisfaction</div>
        </div>
        <div>
          <div class="text-3xl font-black text-orange-600">24/7</div>
          <div class="text-gray-500 text-sm">Support</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section id="features" class="py-20 px-4 bg-gray-50">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-4">Why Students Choose rushour</h2>
      <p class="text-gray-600 text-center mb-12 max-w-2xl mx-auto">We understand what students need - quality, speed, and reliability.</p>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100">
          <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-2xl">⚡</div>
          <h3 class="font-bold text-xl mb-2">Instant Delivery</h3>
          <p class="text-gray-600">Get your download link immediately after payment. No waiting, no delays.</p>
        </div>
        <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100">
          <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-2xl">🎯</div>
          <h3 class="font-bold text-xl mb-2">Quality Verified</h3>
          <p class="text-gray-600">All resources are reviewed by experts to ensure accuracy and completeness.</p>
        </div>
        <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100">
          <div class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-2xl">💬</div>
          <h3 class="font-bold text-xl mb-2">Direct Support</h3>
          <p class="text-gray-600">Chat with us directly on WhatsApp. We respond within minutes.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Products -->
  <section id="products" class="py-20 px-4 bg-white">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-end mb-12">
        <div>
          <h2 class="text-3xl font-bold text-gray-900">Latest Resources</h2>
          <p class="text-gray-500 mt-2">Curated for excellence. Verified for results.</p>
        </div>
        <div class="hidden md:flex gap-2">
          <button onclick="filterProducts('all')" class="filter-btn px-4 py-2 rounded-full text-sm font-medium bg-gray-900 text-white" data-filter="all">All</button>
          <button onclick="filterProducts('book')" class="filter-btn px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200" data-filter="book">Books</button>
          <button onclick="filterProducts('slides')" class="filter-btn px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200" data-filter="slides">Slides</button>
          <button onclick="filterProducts('template')" class="filter-btn px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200" data-filter="template">Templates</button>
        </div>
      </div>
      
      <div id="product-grid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Products loaded dynamically -->
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <section id="testimonials" class="py-20 px-4 bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-12">What Students Say</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-gray-800 p-6 rounded-2xl">
          <div class="flex text-yellow-400 mb-4">★★★★★</div>
          <p class="text-gray-300 mb-4">"I was stuck on the ERD for weeks. This saved my life! The documentation is exactly what my teacher asked for."</p>
          <div class="font-bold">Kevin M.</div>
          <div class="text-gray-500 text-sm">Computer Science</div>
        </div>
        <div class="bg-gray-800 p-6 rounded-2xl">
          <div class="flex text-yellow-400 mb-4">★★★★★</div>
          <p class="text-gray-300 mb-4">"Instant delivery is real! Got the PDF in my email seconds after paying. Highly recommend."</p>
          <div class="font-bold">Faith W.</div>
          <div class="text-gray-500 text-sm">Business Student</div>
        </div>
        <div class="bg-gray-800 p-6 rounded-2xl">
          <div class="flex text-yellow-400 mb-4">★★★★★</div>
          <p class="text-gray-300 mb-4">"The best resource site for students. Quick WhatsApp support and quality content."</p>
          <div class="font-bold">Brian O.</div>
          <div class="text-gray-500 text-sm">Engineering</div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-20 px-4 bg-gradient-to-r from-orange-500 to-orange-600">
    <div class="max-w-3xl mx-auto text-center text-white">
      <h2 class="text-3xl font-bold mb-4">Ready to Ace Your Studies?</h2>
      <p class="text-orange-100 mb-8 text-lg">Browse our library and find the resources you need to succeed.</p>
      <button onclick="scrollToProducts()" class="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:scale-105 transition transform">Start Browsing</button>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-900 text-gray-400 py-12 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 pb-8 border-b border-gray-800">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="bg-orange-600 text-white px-2 py-1 rounded font-bold">RH</div>
            <span class="font-bold text-white text-xl">rushour.com</span>
          </div>
          <div class="flex gap-4 ml-8">
            <a href="#products" class="hover:text-white transition">Products</a>
            <a href="#features" class="hover:text-white transition">Features</a>
            <a href="https://wa.me/254768213649" class="hover:text-white transition">Contact</a>
          </div>
        </div>
        <a href="https://wa.me/254768213649" target="_blank" class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition">
          💬 Chat on WhatsApp
        </a>
      </div>
      <div class="flex flex-col md:flex-row justify-between items-center text-sm">
        <p>© 2026 rushour Inc. All rights reserved.</p>
        <p class="text-gray-600">Made with ❤️ for Kenyan students</p>
      </div>
    </div>
  </footer>

  <!-- Checkout Modal -->
  <div id="checkout-modal" class="fixed inset-0 z-50 hidden">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeModal()"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
      <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      
      <div class="text-center mb-6">
        <h3 class="font-bold text-2xl text-gray-900">Checkout</h3>
        <p id="checkout-product" class="text-gray-500 mt-1"></p>
      </div>
      
      <div class="space-y-3">
        <p class="font-semibold text-gray-700">Select payment method:</p>
        
        <button onclick="payWithWhatsApp()" class="w-full flex items-center gap-4 p-4 border-2 border-green-500 bg-green-50 rounded-xl hover:bg-green-100 transition">
          <span class="text-3xl">📱</span>
          <div class="text-left">
            <div class="font-bold text-gray-900">Kenya - M-Pesa</div>
            <div class="text-sm text-gray-500">Chat on WhatsApp for payment</div>
          </div>
        </button>
        
        <button onclick="payWithPayPal()" class="w-full flex items-center gap-4 p-4 border-2 border-blue-500 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
          <span class="text-3xl">🌍</span>
          <div class="text-left">
            <div class="font-bold text-gray-900">International</div>
            <div class="text-sm text-gray-500">PayPal or Card (~USD <span id="usd-price"></span>)</div>
          </div>
        </button>
        
        <div id="paypal-section" class="hidden mt-4">
          <input type="email" id="buyer-email" placeholder="Your email for delivery" class="w-full p-3 border rounded-xl mb-3">
          <div id="paypal-button" class="mt-4"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Admin Modal -->
  <div id="admin-modal" class="fixed inset-0 z-50 hidden">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeAdmin()"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-bold text-2xl text-gray-900">Admin Panel</h3>
        <button onclick="closeAdmin()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      </div>
      
      <div class="flex gap-4 mb-6">
        <button onclick="showAdminSection('products')" class="px-4 py-2 bg-gray-900 text-white rounded-lg">Products</button>
        <button onclick="showAdminSection('orders')" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">Orders</button>
        <button onclick="showAdminSection('add')" class="px-4 py-2 bg-orange-500 text-white rounded-lg">+ Add Product</button>
      </div>
      
      <div id="admin-products" class="admin-section">
        <div id="admin-product-list" class="space-y-3"></div>
      </div>
      
      <div id="admin-orders" class="admin-section hidden">
        <div id="admin-order-list" class="space-y-3"></div>
      </div>
      
      <div id="admin-add" class="admin-section hidden">
        <form onsubmit="addProduct(event)" class="space-y-4">
          <input type="text" id="new-name" placeholder="Product name" required class="w-full p-3 border rounded-xl">
          <div class="grid grid-cols-2 gap-4">
            <input type="number" id="new-price" placeholder="Price (KES)" required class="w-full p-3 border rounded-xl">
            <select id="new-category" class="w-full p-3 border rounded-xl">
              <option value="book">Book</option>
              <option value="slides">Slides</option>
              <option value="template">Template</option>
            </select>
          </div>
          <input type="url" id="new-image" placeholder="Cover image URL" class="w-full p-3 border rounded-xl">
          <input type="url" id="new-download" placeholder="Download link (Google Drive)" class="w-full p-3 border rounded-xl">
          <textarea id="new-desc" placeholder="Description" class="w-full p-3 border rounded-xl h-24"></textarea>
          <button type="submit" class="w-full bg-orange-600 text-white py-3 rounded-xl font-bold">Add Product</button>
        </form>
      </div>
    </div>
  </div>

  <script>
    const products = [
      { id: 1, name: 'Azani ISP Documentation', price: 400, description: 'Complete ISP documentation for students. Includes ERD, UML diagrams, and source code.', category: 'book', image_url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400' },
      { id: 2, name: 'Business Plan Template', price: 250, description: 'Professional business plan template for students and entrepreneurs.', category: 'template', image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400' },
      { id: 3, name: 'Mathematics Revision Slides', price: 300, description: 'Comprehensive math revision slides for KCSE and university exams.', category: 'slides', image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400' },
      { id: 4, name: 'Physics Lab Report Template', price: 200, description: 'Professional lab report template following university standards.', category: 'template', image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400' },
      { id: 5, name: 'Programming Algorithms Guide', price: 350, description: 'Essential algorithms and data structures for CS students.', category: 'book', image_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400' },
      { id: 6, name: 'Chemistry Notes PDF', price: 280, description: 'Complete chemistry notes for form 4 students.', category: 'book', image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400' }
    ];

    let currentProduct = {};

    // Render products
    function renderProducts(filter = 'all') {
      const grid = document.getElementById('product-grid');
      const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
      
      grid.innerHTML = filtered.map((p, i) => \`
        <div class="group fade-in" style="animation-delay: \${i * 0.1}s">
          <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
            <div class="relative h-48 bg-gray-100 overflow-hidden">
              <img src="\${p.image_url}" alt="\${p.name}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110"/>
              <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-900">\${p.category}</div>
            </div>
            <div class="p-5">
              <h3 class="font-bold text-lg text-gray-900 mb-2 line-clamp-1">\${p.name}</h3>
              <p class="text-gray-500 text-sm mb-4 line-clamp-2">\${p.description}</p>
              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span class="text-xs text-gray-400 uppercase font-bold">Price</span>
                  <div class="font-mono font-bold text-xl text-orange-600">KES \${p.price}</div>
                </div>
                <button onclick='openModal(\${JSON.stringify(p)})' class="bg-gray-900 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition">Buy Now</button>
              </div>
            </div>
          </div>
        </div>
      \`).join('');
      
      // Update filter buttons
      document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === filter) {
          btn.className = 'filter-btn px-4 py-2 rounded-full text-sm font-medium bg-gray-900 text-white';
        } else {
          btn.className = 'filter-btn px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200';
        }
      });
    }

    function filterProducts(category) {
      renderProducts(category);
    }

    function scrollToProducts() {
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    }

    // Modal functions
    function openModal(product) {
      currentProduct = product;
      document.getElementById('checkout-modal').classList.remove('hidden');
      document.getElementById('checkout-product').innerHTML = \`\${product.name} - <span class="font-bold text-orange-600">KES \${product.price}</span>\`;
      document.getElementById('usd-price').innerText = (product.price / 130).toFixed(2);
      document.getElementById('paypal-section').classList.add('hidden');
    }

    function closeModal() {
      document.getElementById('checkout-modal').classList.add('hidden');
    }

    function payWithWhatsApp() {
      const msg = \`Hi! I want to buy: \${currentProduct.name} (KES \${currentProduct.price})\`;
      window.open('https://wa.me/254768213649?text=' + encodeURIComponent(msg), '_blank');
    }

    function payWithPayPal() {
      document.getElementById('paypal-section').classList.remove('hidden');
      setTimeout(() => {
        if (window.paypal) {
          const container = document.getElementById('paypal-button');
          container.innerHTML = '';
          window.paypal.Buttons({
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [{ amount: { value: (currentProduct.price / 130).toFixed(2) } }]
              })
            },
            onApprove: () => {
              alert('Payment successful! Check your email for the download link.');
              closeModal();
            }
          }).render('#paypal-button');
        }
      }, 300);
    }

    // Admin functions
    function openAdmin() {
      document.getElementById('admin-modal').classList.remove('hidden');
      loadAdminData();
    }

    function closeAdmin() {
      document.getElementById('admin-modal').classList.add('hidden');
    }

    function showAdminSection(section) {
      document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
      document.getElementById('admin-' + section).classList.remove('hidden');
    }

    function loadAdminData() {
      // Show products in admin
      const productList = document.getElementById('admin-product-list');
      productList.innerHTML = products.map(p => \`
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div class="flex items-center gap-4">
            <img src="\${p.image_url}" class="w-12 h-12 rounded-lg object-cover"/>
            <div>
              <div class="font-bold">\${p.name}</div>
              <div class="text-sm text-gray-500">KES \${p.price} - \${p.category}</div>
            </div>
          </div>
          <button onclick="deleteProduct(\${p.id})" class="text-red-500 hover:text-red-700">🗑️</button>
        </div>
      \`).join('');
    }

    function addProduct(e) {
      e.preventDefault();
      const newProduct = {
        id: Date.now(),
        name: document.getElementById('new-name').value,
        price: parseInt(document.getElementById('new-price').value),
        category: document.getElementById('new-category').value,
        image_url: document.getElementById('new-image').value || 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400',
        download_url: document.getElementById('new-download').value,
        description: document.getElementById('new-desc').value
      };
      products.unshift(newProduct);
      renderProducts();
      loadAdminData();
      alert('Product added!');
      e.target.reset();
    }

    function deleteProduct(id) {
      if (confirm('Delete this product?')) {
        const idx = products.findIndex(p => p.id === id);
        if (idx > -1) {
          products.splice(idx, 1);
          renderProducts();
          loadAdminData();
        }
      }
    }

    // Initialize
    renderProducts();
    
    // Add scroll animation
    window.addEventListener('scroll', () => {
      document.querySelectorAll('.fade-in').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          el.style.opacity = '1';
        }
      });
    });
  </script>
</body>
</html>`;
