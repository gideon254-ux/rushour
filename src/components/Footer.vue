<template>
  <footer class="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <!-- WhatsApp & Trust Badges -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 pb-8 border-b border-gray-800">
        <a 
          href="https://wa.me/254768213649" 
          target="_blank"
          class="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold transition"
        >
          <i data-lucide="message-circle" class="w-5 h-5"></i>
          Chat with us
        </a>
        
        <div class="flex flex-wrap justify-center gap-4">
          <div class="flex items-center gap-2 text-sm">
            <i data-lucide="zap" class="w-4 h-4 text-green-500"></i>
            <span>Instant Delivery</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i data-lucide="shield-check" class="w-4 h-4 text-blue-500"></i>
            <span>Secure Payment</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i data-lucide="rotate-ccw" class="w-4 h-4 text-orange-500"></i>
            <span>7-Day Refund</span>
          </div>
        </div>
      </div>
      
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="text-center md:text-left">
          <div class="flex items-center gap-2 justify-center md:justify-start mb-2">
            <div class="bg-red-600 text-white p-0.5 rounded font-bold text-xs">RH</div>
            <span class="font-bold text-white">rushour.com</span>
          </div>
          <p class="text-xs text-gray-500">© 2026 rushour Inc. All rights reserved.</p>
        </div>
        
        <div class="flex gap-6 text-sm">
          <a href="#" class="hover:text-white transition">Privacy Policy</a>
          <a href="#" class="hover:text-white transition">Terms of Service</a>
          <a href="https://wa.me/254768213649" class="hover:text-white transition">Support</a>
        </div>
        
        <div class="text-xs text-gray-600 text-center md:text-right max-w-xs">
          Disclaimer: This material is for educational reference only. Plagiarism is a punishable offense by KNEC.
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 100)
})
</script>
