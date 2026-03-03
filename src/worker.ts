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

    // Handle API requests
    if (path.startsWith('/api/')) {
      return handleApi(request, env, corsHeaders);
    }

    // Serve HTML for all routes (SPA)
    return new Response(INDEX_HTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};

function getMockProducts() {
  return [
    { id: 1, name: 'Azani ISP Documentation', price: 400, description: 'Complete ISP documentation for students. Includes ERD, UML diagrams, and source code.', category: 'book', image_url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400' },
    { id: 2, name: 'Business Plan Template', price: 250, description: 'Professional business plan template for students and entrepreneurs.', category: 'template', image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400' },
    { id: 3, name: 'Mathematics Revision Slides', price: 300, description: 'Comprehensive math revision slides for KCSE and university exams.', category: 'slides', image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400' }
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
    if (path === '/api/products' && method === 'GET') {
      try {
        const { results } = await db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
        return json(results && results.length > 0 ? results : getMockProducts());
      } catch (e) {
        return json(getMockProducts());
      }
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
  <meta name="description" content="High-quality academic resources for students">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;600;800&display=swap" rel="stylesheet">
  <script src="https://www.paypal.com/sdk/js?client-id=AbsiUPJ8ZNu8UMqke1HVoJXBFCRECG9QliyN9o7RexoCNEoCNzZiq3bA-O0Pj5zDdgdfCAuu2mOxJyIk&currency=USD"></script>
  <style>body{font-family:'Inter Tight',sans-serif}</style>
</head>
<body class="bg-gray-50">
  <header class="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
    <nav class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <div class="bg-orange-600 text-white px-2 py-1 rounded font-bold text-xl">RH</div>
        <span class="font-extrabold text-xl text-gray-900">rushour<span class="text-orange-600">.com</span></span>
      </div>
      <button onclick="document.getElementById('products').scrollIntoView({behavior:'smooth'})" class="bg-gray-900 text-white px-5 py-2 rounded-full font-bold text-sm">Browse Library</button>
    </nav>
  </header>
  
  <section class="pt-32 pb-20 px-4 max-w-7xl mx-auto">
    <h1 class="text-6xl font-black text-gray-900 mb-4">Academic <span class="text-orange-600">Excellence</span><br><span class="text-gray-400">On Demand.</span></h1>
    <p class="text-xl text-gray-600 mb-8 max-w-lg">Access premium ISP documentation, revision slides, and project templates. <strong>Instant Delivery. Verified Quality.</strong></p>
    <button onclick="document.getElementById('products').scrollIntoView({behavior:'smooth'})" class="bg-gray-900 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl">Browse Library</button>
    <div class="mt-8 flex gap-6 text-sm text-gray-500">
      <span>🌍 PayPal Payments</span>
      <span>📱 M-Pesa via WhatsApp</span>
    </div>
  </section>

  <section id="products" class="py-20 px-4 bg-white max-w-7xl mx-auto">
    <h2 class="text-3xl font-bold text-gray-900 mb-8">Latest Resources</h2>
    <div class="grid md:grid-cols-3 gap-8" id="product-grid">
      <div class="border rounded-2xl overflow-hidden hover:shadow-xl transition">
        <div class="h-48 bg-gray-100"><img src="https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400" class="w-full h-full object-cover"/></div>
        <div class="p-4">
          <span class="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded">book</span>
          <h3 class="font-bold text-lg mt-2">Azani ISP Documentation</h3>
          <p class="text-gray-500 text-sm mt-1">Complete ISP documentation for students. Includes ERD, UML diagrams.</p>
          <div class="flex justify-between items-center mt-4">
            <span class="font-mono font-bold text-xl text-orange-600">KES 400</span>
            <button onclick="openModal(1,'Azani ISP Documentation',400)" class="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm">Buy Now</button>
          </div>
        </div>
      </div>
      <div class="border rounded-2xl overflow-hidden hover:shadow-xl transition">
        <div class="h-48 bg-gray-100"><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400" class="w-full h-full object-cover"/></div>
        <div class="p-4">
          <span class="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded">template</span>
          <h3 class="font-bold text-lg mt-2">Business Plan Template</h3>
          <p class="text-gray-500 text-sm mt-1">Professional business plan template for students.</p>
          <div class="flex justify-between items-center mt-4">
            <span class="font-mono font-bold text-xl text-orange-600">KES 250</span>
            <button onclick="openModal(2,'Business Plan Template',250)" class="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm">Buy Now</button>
          </div>
        </div>
      </div>
      <div class="border rounded-2xl overflow-hidden hover:shadow-xl transition">
        <div class="h-48 bg-gray-100"><img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400" class="w-full h-full object-cover"/></div>
        <div class="p-4">
          <span class="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded">slides</span>
          <h3 class="font-bold text-lg mt-2">Mathematics Revision Slides</h3>
          <p class="text-gray-500 text-sm mt-1">Comprehensive math revision slides for exams.</p>
          <div class="flex justify-between items-center mt-4">
            <span class="font-mono font-bold text-xl text-orange-600">KES 300</span>
            <button onclick="openModal(3,'Mathematics Revision Slides',300)" class="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer class="bg-gray-900 text-gray-400 py-12 px-4">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <div class="bg-red-600 text-white px-1 rounded font-bold text-xs">RH</div>
          <span class="font-bold text-white">rushour.com</span>
        </div>
        <p class="text-xs">© 2026 rushour Inc. All rights reserved.</p>
      </div>
      <a href="https://wa.me/254768213649" target="_blank" class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold transition">
        💬 Chat on WhatsApp
      </a>
    </div>
  </footer>

  <!-- Modal -->
  <div id="modal" class="fixed inset-0 z-50 hidden">
    <div class="absolute inset-0 bg-black/60" onclick="closeModal()"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
      <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-400 text-2xl">&times;</button>
      <h3 class="font-bold text-xl mb-2">Checkout</h3>
      <p id="modal-product" class="text-gray-600 mb-4"></p>
      <p class="text-sm font-medium mb-3">Select payment method:</p>
      <button onclick="openWhatsApp()" class="w-full flex items-center gap-3 p-4 border-2 border-green-500 rounded-xl mb-3 bg-green-50">
        <span class="text-2xl">📱</span>
        <div class="text-left"><div class="font-bold">Kenya</div><div class="text-xs text-gray-500">M-Pesa via WhatsApp</div></div>
      </button>
      <button onclick="showPayPal()" class="w-full flex items-center gap-3 p-4 border-2 border-blue-500 rounded-xl mb-4 bg-blue-50">
        <span class="text-2xl">🌍</span>
        <div class="text-left"><div class="font-bold">International</div><div class="text-xs text-gray-500">PayPal / Card</div></div>
      </button>
      <div id="paypal-container" class="hidden"></div>
    </div>
  </div>

  <script>
    let currentProduct = {};
    
    function openModal(id, name, price) {
      currentProduct = {id, name, price};
      document.getElementById('modal').classList.remove('hidden');
      document.getElementById('modal-product').innerHTML = name + ' - <span class="font-bold text-orange-600">KES ' + price + '</span>';
      document.getElementById('paypal-container').classList.add('hidden');
    }
    
    function closeModal() {
      document.getElementById('modal').classList.add('hidden');
    }
    
    function openWhatsApp() {
      const msg = 'Hi! I want to buy: ' + currentProduct.name + ' (KES ' + currentProduct.price + ')';
      window.open('https://wa.me/254768213649?text=' + encodeURIComponent(msg), '_blank');
    }
    
    function showPayPal() {
      document.getElementById('paypal-container').classList.remove('hidden');
      const usd = (currentProduct.price / 130).toFixed(2);
      document.getElementById('paypal-container').innerHTML = '<input id="buyer-email" type="email" placeholder="Your email" class="w-full p-3 border rounded-xl mb-3"/><div id="paypal-btn"></div>';
      
      setTimeout(() => {
        if (window.paypal) {
          window.paypal.Buttons({
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [{ amount: { value: usd } }]
              })
            },
            onApprove: () => {
              alert('Payment successful! We will send the download link to your email.');
              closeModal();
            }
          }).render('#paypal-btn');
        }
      }, 300);
    }
  </script>
</body>
</html>`;
