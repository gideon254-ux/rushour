// Mock API for demo mode - works without backend
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Azani ISP Documentation',
    price: 400,
    description: 'Complete ISP documentation for students. Includes ERD, UML diagrams, and source code.',
    category: 'book',
    image_url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400',
    download_url: 'https://example.com/download.pdf'
  },
  {
    id: 2,
    name: 'Business Plan Template',
    price: 250,
    description: 'Professional business plan template for students and entrepreneurs.',
    category: 'template',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    download_url: 'https://example.com/download.pdf'
  },
  {
    id: 3,
    name: 'Mathematics Revision Slides',
    price: 300,
    description: 'Comprehensive math revision slides for KCSE and university exams.',
    category: 'slides',
    image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
    download_url: 'https://example.com/download.pdf'
  }
]

const API_BASE = import.meta.env.VITE_API_URL

// If no API URL, use mock data (for demo mode)
const useMock = !API_BASE

async function request(endpoint, options = {}) {
  if (useMock) {
    console.log('Using mock data for', endpoint)
    // Return mock data for products
    if (endpoint === '/products') return MOCK_PRODUCTS
    if (endpoint === '/orders') return []
    return { error: 'Demo mode' }
  }
  
  const url = `${API_BASE}${endpoint}`
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }
  
  const response = await fetch(url, config)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }
  
  return response.json()
}

export const api = {
  // Products
  async getProducts() {
    if (useMock) return MOCK_PRODUCTS
    return request('/products')
  },
  
  async createProduct(product) {
    if (useMock) return { ...product, id: Date.now() }
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    })
  },
  
  async deleteProduct(id) {
    if (useMock) return { success: true }
    return request(`/products/${id}`, {
      method: 'DELETE'
    })
  },
  
  // Orders
  async getOrders() {
    if (useMock) return []
    return request('/orders')
  },
  
  async createOrder(order) {
    if (useMock) return { ...order, id: Date.now(), status: 'verified' }
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    })
  },
  
  async updateOrder(id, updates) {
    if (useMock) return { id, ...updates }
    return request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  },
  
  async verifyToken(token) {
    if (useMock) return null
    return request(`/orders/verify/${token}`)
  }
}
