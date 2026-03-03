// Cloudflare Worker - serves both frontend + API
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (path.startsWith('/api/')) {
      // Handle API requests
      return handleApi(request, env, corsHeaders);
    }

    // Serve static frontend (SPA)
    return env.ASSETS.fetch(request);
  }
};

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
    // PRODUCTS
    if (path === '/api/products' && method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
      return json(results || []);
    }

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

    if (path.match(/^\/api\/products\/.+$/) && method === 'DELETE') {
      const id = path.split('/').pop();
      await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
      return json({ success: true });
    }

    // ORDERS
    if (path === '/api/orders' && method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
      return json(results || []);
    }

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

    if (path.match(/^\/api\/orders\/verify\/.+$/) && method === 'GET') {
      const token = path.split('/').pop();
      const order = await db.prepare('SELECT * FROM orders WHERE download_token = ?').bind(token).first();
      if (!order) return json({ error: 'Invalid token' }, 404);
      return json(order);
    }

    return json({ error: 'Not found' }, 404);

  } catch (error) {
    console.error('Worker error:', error);
    return json({ error: error.message }, 500);
  }
}
