<template>
  <section id="products" class="py-20 bg-white" :class="{ 'opacity-0': !visible, 'opacity-100': visible }" style="transition: opacity 0.5s ease;">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex justify-between items-end mb-12">
        <div>
          <h2 class="text-3xl font-bold text-gray-900">Latest Resources</h2>
          <p class="text-gray-500 mt-2">Curated for excellence. Verified for results.</p>
        </div>
      </div>

      <div v-if="loading" class="flex flex-col items-center gap-4 py-20">
        <i data-lucide="loader" class="w-8 h-8 text-orange-600 animate-spin"></i>
        <p class="text-gray-400">Loading library...</p>
      </div>

      <div v-else-if="products.length === 0" class="text-center py-20">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i data-lucide="library" class="w-8 h-8 text-gray-400"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-900">Library Empty</h3>
        <p class="text-gray-500 mt-2">Check back later for new academic resources.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="(product, index) in products" 
          :key="product.id"
          class="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          :style="{ 
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: `${index * 100}ms`
          }"
        >
          <div class="relative h-64 bg-gray-100 overflow-hidden">
            <img 
              v-if="product.image_url" 
              :src="product.image_url" 
              :alt="product.name" 
              class="w-full h-full object-cover transition duration-700 group-hover:scale-110"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
              <i data-lucide="book" class="w-12 h-12"></i>
            </div>
            <div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-900">
              {{ product.category }}
            </div>
          </div>
          
          <div class="p-6 flex-1 flex flex-col">
            <h3 class="text-xl font-bold text-gray-900 mb-2 leading-tight">{{ product.name }}</h3>
            <p class="text-gray-500 text-sm mb-6 line-clamp-3 flex-1">{{ product.description }}</p>
            
            <div class="flex items-center justify-between pt-6 border-t border-gray-100">
              <div>
                <span class="block text-xs text-gray-400 uppercase font-bold">Price</span>
                <span class="font-mono font-bold text-xl text-orange-600">KES {{ product.price }}</span>
              </div>
              <button 
                @click="$emit('buy', product)"
                class="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition flex items-center gap-2"
              >
                Buy Now <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, watch } from 'vue'

const props = defineProps({
  products: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  visible: {
    type: Boolean,
    default: false
  }
})

defineEmits(['buy'])

onMounted(() => {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 100)
})

watch(() => props.visible, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      if (window.lucide) {
        window.lucide.createIcons()
      }
    }, 100)
  }
})
</script>
