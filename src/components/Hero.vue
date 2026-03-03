<template>
  <section 
    ref="heroRef"
    class="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden min-h-[80vh] flex flex-col justify-center transition-opacity duration-500"
    :style="{ opacity: heroOpacity }"
  >
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-30 pointer-events-none">
      <div class="absolute top-20 left-20 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div class="absolute top-20 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
    </div>

    <div class="flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
      <div class="flex-1 text-center lg:text-left">
        <h1 class="text-6xl sm:text-7xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-8">
          Academic <span class="text-orange-600">Excellence</span><br/>
          <span class="text-gray-400">On Demand.</span>
        </h1>
        
        <p class="text-xl text-gray-600 mb-10 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
          Access premium ISP documentation, revision slides, and project templates. <br/>
          <strong>Instant Delivery. Verified Quality.</strong>
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <button 
            @click="scrollToProducts"
            class="group relative inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition shadow-xl"
          >
            Browse Library
            <i data-lucide="arrow-down" class="group-hover:translate-y-1 transition-transform"></i>
          </button>
        </div>
        
        <div class="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 font-medium">
          <div class="flex items-center gap-2">
            <i data-lucide="globe" class="w-4 h-4 text-blue-500"></i> Global Payments (PayPal)
          </div>
          <div class="flex items-center gap-2">
            <i data-lucide="smartphone" class="w-4 h-4 text-green-500"></i> M-Pesa Accepted
          </div>
        </div>
      </div>
      
      <div class="flex-1 relative w-full max-w-lg perspective-1000 hidden lg:block">
        <div class="relative transform rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-y-[0deg] hover:rotate-x-[0deg] transition-transform duration-700 ease-out preserve-3d">
          <div class="absolute top-10 left-10 w-full h-full bg-gray-200 rounded-xl transform translate-z-[-20px] scale-95 border border-gray-300"></div>
          <div class="absolute top-5 left-5 w-full h-full bg-gray-100 rounded-xl transform translate-z-[-10px] scale-95 border border-gray-300"></div>
          
          <div class="relative bg-white rounded-xl shadow-2xl overflow-hidden aspect-[4/5] border border-gray-200 flex flex-col items-center justify-center p-8 text-center">
            <div class="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <i data-lucide="library" class="w-12 h-12 text-orange-600"></i>
            </div>
            <h3 class="text-3xl font-black text-gray-900 mb-2">rushour<span class="text-orange-600">.com</span></h3>
            <p class="text-gray-500">The Student's Secret Weapon</p>
            <div class="mt-8 grid grid-cols-2 gap-4 w-full">
              <div class="bg-gray-50 p-3 rounded-lg text-xs font-bold text-gray-600">PDFs</div>
              <div class="bg-gray-50 p-3 rounded-lg text-xs font-bold text-gray-600">Slides</div>
              <div class="bg-gray-50 p-3 rounded-lg text-xs font-bold text-gray-600">Templates</div>
              <div class="bg-gray-50 p-3 rounded-lg text-xs font-bold text-gray-600">Guides</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const heroOpacity = ref(1)

const emit = defineEmits(['heroInView'])

const scrollToProducts = () => {
  const el = document.getElementById('products')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleScroll = () => {
  const scrollY = window.scrollY
  const heroSection = document.querySelector('section')
  if (heroSection) {
    const rect = heroSection.getBoundingClientRect()
    const centerY = rect.top + rect.height / 2
    const viewportHeight = window.innerHeight
    
    if (centerY < viewportHeight * 0.7) {
      heroOpacity.value = Math.max(0, 1 - (viewportHeight * 0.7 - centerY) / 300)
      emit('heroInView', false)
    } else {
      heroOpacity.value = 1
      emit('heroInView', true)
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
.perspective-1000 {
  perspective: 1000px;
}
.preserve-3d {
  transform-style: preserve-3d;
}
</style>
