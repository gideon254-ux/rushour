import { defineStore } from 'pinia'
import { supabase, TABLES } from '../lib/supabase'

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    loading: false,
    error: null
  }),
  
  getters: {
    getProductById: (state) => (id) => {
      return state.products.find(p => p.id === id)
    }
  },
  
  actions: {
    async fetchProducts() {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from(TABLES.PRODUCTS)
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        this.products = data || []
      } catch (err) {
        this.error = err.message
        console.error('Error fetching products:', err)
      } finally {
        this.loading = false
      }
    },
    
    async addProduct(product) {
      try {
        const { data, error } = await supabase
          .from(TABLES.PRODUCTS)
          .insert([product])
          .select()
        
        if (error) throw error
        if (data) {
          this.products.unshift(data[0])
        }
        return data[0]
      } catch (err) {
        console.error('Error adding product:', err)
        throw err
      }
    },
    
    async updateProduct(id, updates) {
      try {
        const { data, error } = await supabase
          .from(TABLES.PRODUCTS)
          .update(updates)
          .eq('id', id)
          .select()
        
        if (error) throw error
        if (data) {
          const index = this.products.findIndex(p => p.id === id)
          if (index !== -1) {
            this.products[index] = data[0]
          }
        }
        return data[0]
      } catch (err) {
        console.error('Error updating product:', err)
        throw err
      }
    },
    
    async deleteProduct(id) {
      try {
        const { error } = await supabase
          .from(TABLES.PRODUCTS)
          .delete()
          .eq('id', id)
        
        if (error) throw error
        this.products = this.products.filter(p => p.id !== id)
      } catch (err) {
        console.error('Error deleting product:', err)
        throw err
      }
    }
  }
})
