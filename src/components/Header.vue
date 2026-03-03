<template>
  <header class="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex justify-between items-center">
      <div class="flex items-center gap-2 group cursor-pointer" @click="$router.push('/')">
        <div class="bg-orange-600 text-white p-1 rounded font-bold text-xl tracking-tighter transform group-hover:rotate-12 transition">RH</div>
        <span class="font-extrabold text-xl tracking-tight text-gray-900">rushour<span class="text-orange-600">.com</span></span>
      </div>
      
      <button 
        @click="$emit('openOrder')"
        class="hidden sm:flex items-center gap-2 bg-white/80 backdrop-blur border border-gray-200 text-gray-900 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-50 transition shadow-sm"
      >
        <i data-lucide="download" class="w-4 h-4 text-orange-600"></i>
        Get Azani
      </button>
    </nav>
  </header>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  if (window.lucide) {
    window.lucide.createIcons()
  }
})
</script>
