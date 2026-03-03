import { defineStore } from 'pinia'
import { supabase, TABLES } from '../lib/supabase'

export const useOrderStore = defineStore('orders', {
  state: () => ({
    orders: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async createOrder(order) {
      try {
        const { data, error } = await supabase
          .from(TABLES.ORDERS)
          .insert([order])
          .select()
        
        if (error) throw error
        return data[0]
      } catch (err) {
        console.error('Error creating order:', err)
        throw err
      }
    },
    
    async fetchOrders() {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from(TABLES.ORDERS)
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        this.orders = data || []
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    
    async updateOrderStatus(id, updates) {
      try {
        const { data, error } = await supabase
          .from(TABLES.ORDERS)
          .update(updates)
          .eq('id', id)
          .select()
        
        if (error) throw error
        return data[0]
      } catch (err) {
        console.error('Error updating order:', err)
        throw err
      }
    },
    
    async verifyOrder(id) {
      const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
      const expiry = new Date()
      expiry.setHours(expiry.getHours() + 1)
      
      return this.updateOrderStatus(id, {
        status: 'verified',
        download_token: token,
        token_expiry: expiry.toISOString(),
        downloads_count: 0
      })
    },
    
    async rejectOrder(id) {
      return this.updateOrderStatus(id, { status: 'rejected' })
    },
    
    async getOrderByToken(token) {
      try {
        const { data, error } = await supabase
          .from(TABLES.ORDERS)
          .select('*')
          .eq('download_token', token)
          .single()
        
        if (error) throw error
        return data
      } catch (err) {
        console.error('Error finding order:', err)
        return null
      }
    }
  }
})
