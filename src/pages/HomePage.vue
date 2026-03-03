<template>
  <div class="min-h-screen flex flex-col bg-white selection:bg-orange-100 selection:text-orange-900">
    <Header @openOrder="openOrder(null)" />
    
    <main class="flex-grow">
      <Hero @heroInView="heroVisible = $event" />
      <ProductGrid 
        :products="products" 
        :loading="loading"
        :visible="!heroVisible"
        @buy="openOrder"
      />
      <Testimonials />
    </main>
    
    <Footer />
    
    <OrderModal 
      :isOpen="orderModalOpen"
      :product="selectedProduct"
      @close="orderModalOpen = false"
      @orderCreated="handleOrderCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '../stores/products'
import Header from '../components/Header.vue'
import Hero from '../components/Hero.vue'
import ProductGrid from '../components/ProductGrid.vue'
import Testimonials from '../components/Testimonials.vue'
import Footer from '../components/Footer.vue'
import OrderModal from '../components/OrderModal.vue'

const productStore = useProductStore()

const heroVisible = ref(true)
const orderModalOpen = ref(false)
const selectedProduct = ref(null)

const products = computed(() => productStore.products)
const loading = computed(() => productStore.loading)

const defaultProduct = {
  id: 'default-azani',
  name: 'Azani ISP Documentation',
  price: 400,
  description: 'Premium ISP documentation for students',
  category: 'book'
}

const openOrder = (product) => {
  selectedProduct.value = product || defaultProduct
  orderModalOpen.value = true
}

const handleOrderCreated = (order) => {
  console.log('Order created:', order)
}

onMounted(async () => {
  await productStore.fetchProducts()
  
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 100)
})
</script>
