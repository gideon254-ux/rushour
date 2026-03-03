import { defineStore } from 'pinia'
import { api } from '../lib/api'

export const useOrderStore = defineStore('orders', {
  state: () => ({
    orders: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async createOrder(order) {
      try {
        const newOrder = await api.createOrder(order)
        return newOrder
      } catch (err) {
        console.error('Error creating order:', err)
        throw err
      }
    },
    
    async fetchOrders() {
      this.loading = true
      try {
        const orders = await api.getOrders()
        this.orders = orders || []
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    
    async updateOrderStatus(id, updates) {
      try {
        const updated = await api.updateOrder(id, updates)
        const index = this.orders.findIndex(o => o.id === id)
        if (index !== -1) {
          this.orders[index] = updated
        }
        return updated
      } catch (err) {
        console.error('Error updating order:', err)
        throw err
      }
    },
    
    async verifyOrder(id) {
      const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
      const expiry = new Date()
      expiry.setHours(expiry.getHours() + 1)
      
      return this.updateOrder(id, {
        status: 'verified',
        download_token: token,
        token_expiry: expiry.toISOString(),
        downloads_count: 0
      })
    },
    
    async rejectOrder(id) {
      return this.updateOrder(id, { status: 'rejected' })
    },
    
    async getOrderByToken(token) {
      try {
        const order = await api.verifyToken(token)
        return order
      } catch (err) {
        console.error('Error finding order:', err)
        return null
      }
    }
  }
})
