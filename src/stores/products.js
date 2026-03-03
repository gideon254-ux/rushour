import { defineStore } from 'pinia'
import { api } from '../lib/api'

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
        const products = await api.getProducts()
        this.products = products || []
      } catch (err) {
        this.error = err.message
        console.error('Error fetching products:', err)
      } finally {
        this.loading = false
      }
    },
    
    async addProduct(product) {
      try {
        const newProduct = await api.createProduct(product)
        this.products.unshift(newProduct)
        return newProduct
      } catch (err) {
        console.error('Error adding product:', err)
        throw err
      }
    },
    
    async deleteProduct(id) {
      try {
        await api.deleteProduct(id)
        this.products = this.products.filter(p => p.id !== id)
      } catch (err) {
        console.error('Error deleting product:', err)
        throw err
      }
    }
  }
})
