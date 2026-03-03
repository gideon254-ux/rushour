<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div v-if="status === 'verifying'" class="text-center">
      <i data-lucide="loader" class="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4"></i>
      <p class="text-gray-400">Securing connection...</p>
    </div>

    <div v-else-if="status === 'expired'" class="max-w-md bg-gray-800 p-8 rounded-2xl border border-red-900 text-center">
      <i data-lucide="lock" class="w-16 h-16 text-red-500 mx-auto mb-4"></i>
      <h1 class="text-2xl font-bold mb-2">Link Expired</h1>
      <p class="text-gray-400 mb-6">This secure link has expired or reached its download limit.</p>
      <a href="/" class="inline-block bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-200">
        Purchase New Copy
      </a>
    </div>

    <div v-else-if="status === 'error'" class="max-w-md bg-gray-800 p-8 rounded-2xl text-center">
      <i data-lucide="alert-triangle" class="w-16 h-16 text-yellow-500 mx-auto mb-4"></i>
      <h1 class="text-2xl font-bold mb-2">Access Denied</h1>
      <p class="text-gray-400 mb-6">{{ message }}</p>
    </div>

    <div v-else-if="status === 'ready'" class="max-w-lg w-full bg-gray-800 p-10 rounded-3xl border border-gray-700 text-center shadow-2xl relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-purple-500 to-orange-500 animate-pulse"></div>
      
      <i data-lucide="file-check" class="w-16 h-16 text-green-500 mx-auto mb-6"></i>
      <h1 class="text-3xl font-bold mb-2">Your File is Ready</h1>
      <p class="text-gray-400 mb-8">{{ productName }}</p>
      
      <a 
        :href="downloadUrl" 
        download
        class="block w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xl py-4 rounded-xl shadow-lg shadow-orange-900/50 transition transform hover:-translate-y-1"
      >
        Download Now
      </a>
      
      <div class="mt-6 text-xs text-gray-500">
        Link expires in 1 hour. Do not share.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useOrderStore } from '../stores/orders'

const orderStore = useOrderStore()

const status = ref('verifying')
const message = ref('')
const downloadUrl = ref(null)
const productName = ref('')

const verifyToken = async () => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  if (!token) {
    status.value = 'error'
    message.value = 'Missing download token.'
    return
  }

  try {
    const order = await orderStore.getOrderByToken(token)

    if (!order) {
      status.value = 'error'
      message.value = 'Invalid token.'
      return
    }

    const now = new Date()
    const expiry = new Date(order.token_expiry)

    if (now > expiry) {
      status.value = 'expired'
      return
    }

    if (order.downloads_count >= 3) {
      status.value = 'expired'
      message.value = 'Download limit (3) exceeded.'
      return
    }

    // Update download count
    await orderStore.updateOrderStatus(order.id, {
      downloads_count: order.downloads_count + 1
    })

    // Get download URL (stored in order when created)
    if (order.download_url) {
      downloadUrl.value = order.download_url
    } else {
      downloadUrl.value = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }

    productName.value = 'RushHOUR_Purchase.pdf'
    status.value = 'ready'

  } catch (e) {
    console.error(e)
    status.value = 'error'
    message.value = 'System error. Please contact support.'
  }
}

onMounted(() => {
  verifyToken()
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 100)
})
</script>
