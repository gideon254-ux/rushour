<template>
  <section class="py-20 bg-gray-50 border-t border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <h2 class="text-2xl font-bold text-gray-900">What Students Are Saying</h2>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8">
        <div v-for="(t, i) in testimonials" :key="i" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div class="flex gap-1 text-yellow-400 mb-4">
            <i v-for="j in 5" :key="j" data-lucide="star" class="w-4 h-4 fill-current"></i>
          </div>
          <p class="text-gray-600 mb-6 italic">"{{ t.quote }}"</p>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
              {{ t.name.charAt(0) }}
            </div>
            <div>
              <div class="font-bold text-gray-900 text-sm">{{ t.name }}</div>
              <div class="text-xs text-gray-500">{{ t.role }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

const testimonials = [
  {
    name: "Kevin",
    role: "Class of '26",
    quote: "I was stuck on the ERD for weeks. This saved my life! The documentation is exactly what my teacher asked for."
  },
  {
    name: "Faith M.",
    role: "Computer Student",
    quote: "Instant delivery is real. I got the PDF in my email literally seconds after paying. 10/10 service."
  },
  {
    name: "Brian O.",
    role: "Nairobi",
    quote: "The 3-tier architecture explanation in the doc is amazing. Helped me understand my own project better."
  }
]

onMounted(() => {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 100)
})
</script>
