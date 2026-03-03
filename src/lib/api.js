const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(endpoint, options = {}) {
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
    return request('/products')
  },
  
  async createProduct(product) {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    })
  },
  
  async deleteProduct(id) {
    return request(`/products/${id}`, {
      method: 'DELETE'
    })
  },
  
  // Orders
  async getOrders() {
    return request('/orders')
  },
  
  async createOrder(order) {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    })
  },
  
  async updateOrder(id, updates) {
    return request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  },
  
  async verifyToken(token) {
    return request(`/orders/verify/${token}`)
  }
}
