<template>
  <Teleport to="body">
    <div v-if="isOpen && product" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
      
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-20">
          <i data-lucide="x" class="w-6 h-6"></i>
        </button>

        <div class="bg-gray-50 p-6 border-b border-gray-100">
          <h3 class="font-bold text-gray-900 text-lg">Checkout</h3>
          <p class="text-sm text-gray-500">{{ product.name }} • <span class="font-mono text-orange-600">KES {{ product.price }}</span></p>
        </div>

        <div class="p-6">
          <!-- STEP 1: REGION SELECTION -->
          <div v-if="step === 1" class="space-y-4">
            <p class="text-sm font-medium text-gray-700 mb-2">Select your location:</p>
            
            <button 
              @click="selectRegion('ke')"
              class="w-full flex items-center justify-between p-4 border rounded-xl hover:border-orange-500 hover:bg-orange-50 transition group"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <i data-lucide="smartphone"></i>
                </div>
                <div class="text-left">
                  <div class="font-bold text-gray-900">Kenya</div>
                  <div class="text-xs text-gray-500">M-Pesa via WhatsApp</div>
                </div>
              </div>
              <i data-lucide="chevron-right" class="text-gray-300 group-hover:text-orange-500"></i>
            </button>

            <button 
              @click="selectRegion('int')"
              class="w-full flex items-center justify-between p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <i data-lucide="globe"></i>
                </div>
                <div class="text-left">
                  <div class="font-bold text-gray-900">International</div>
                  <div class="text-xs text-gray-500">PayPal / Card (~{{ usdPrice }})</div>
                </div>
              </div>
              <i data-lucide="chevron-right" class="text-gray-300 group-hover:text-blue-500"></i>
            </button>
          </div>

          <!-- STEP 2: PAYMENT FORM -->
          <div v-if="step === 2">
            <!-- KENYA: M-Pesa WhatsApp -->
            <div v-if="region === 'ke'" class="space-y-6">
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i data-lucide="message-circle" class="w-8 h-8 text-green-600"></i>
                </div>
                <h4 class="font-bold text-gray-900 text-lg mb-2">Chat with us on WhatsApp</h4>
                <p class="text-gray-500 text-sm">
                  Click below to inquire about payment options and availability. We'll respond quickly!
                </p>
              </div>

              <a 
                :href="whatsappLink" 
                target="_blank"
                class="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition"
              >
                <i data-lucide="message-circle" class="w-5 h-5"></i>
                Chat on WhatsApp
              </a>

              <button @click="step = 1" class="w-full text-center text-gray-500 text-sm hover:text-gray-800 mt-4">
                Back to Region Selection
              </button>
            </div>

            <!-- INTERNATIONAL: PayPal -->
            <div v-else class="space-y-6">
              <div class="space-y-3">
                <label class="block text-sm font-bold text-gray-700">Email for Delivery</label>
                <input
                  type="email"
                  v-model="formData.email"
                  placeholder="you@example.com"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              <div v-if="formData.email && formData.email.includes('@')" id="paypal-button-container">
                <!-- PayPal buttons will render here -->
              </div>
              <div v-else class="p-4 bg-blue-50 text-blue-700 text-sm rounded-xl text-center">
                Please enter a valid email to proceed to payment.
              </div>

              <button @click="step = 1" class="w-full text-center text-gray-500 text-sm hover:text-gray-800 mt-4">
                Back to Region Selection
              </button>
            </div>
          </div>

          <!-- STEP 3: SUCCESS -->
          <div v-if="step === 3" class="text-center py-6">
            <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-green-500/50 shadow-lg animate-bounce">
              <i data-lucide="check" class="w-8 h-8 text-white"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
            <p class="text-gray-600 mb-6">
              {{ region === 'int' 
                ? "Your payment was successful. The download link has been sent to your email." 
                : "We'll get back to you on WhatsApp shortly with payment details."}}
            </p>
            <button @click="$emit('close')" class="bg-gray-100 text-gray-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-200">
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useOrderStore } from '../stores/orders'

const props = defineProps({
  isOpen: Boolean,
  product: Object
})

const emit = defineEmits(['close', 'orderCreated'])

const orderStore = useOrderStore()
const step = ref(1)
const region = ref(null)
const formData = ref({
  email: ''
})

const usdPrice = computed(() => {
  if (!props.product) return '0.00'
  return (props.product.price / 130).toFixed(2)
})

const whatsappLink = computed(() => {
  if (!props.product) return 'https://wa.me/254768213649'
  const message = `Hi! I'm interested in: ${props.product.name} (KES ${props.product.price}). How can I pay?`
  return `https://wa.me/254768213649?text=${encodeURIComponent(message)}`
})

const selectRegion = (r) => {
  region.value = r
  step.value = 2
  
  if (r === 'int') {
    nextTick(() => {
      renderPayPalButtons()
    })
  }
}

const renderPayPalButtons = () => {
  if (!window.paypal || !props.product) return
  
  const container = document.getElementById('paypal-button-container')
  if (!container) return
  
  container.innerHTML = ''
  
  window.paypal.Buttons({
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: usdPrice.value
          }
        }]
      })
    },
    onApprove: async (data, actions) => {
      const details = await actions.order.capture()
      await handlePayPalSuccess(details, data)
    },
    onError: (err) => {
      console.error('PayPal Error:', err)
      alert('PayPal Error. Please try again.')
    }
  }).render(container)
}

const handlePayPalSuccess = async (details, data) => {
  try {
    const order = await orderStore.createOrder({
      email: details.payer?.email_address || formData.value.email,
      product_id: props.product.id,
      payment_method: 'paypal',
      paypal_order_id: data.orderID,
      amount_paid: props.product.price,
      status: 'verified',
      download_token: Math.random().toString(36).substring(7),
      token_expiry: new Date(Date.now() + 3600000).toISOString(),
      downloads_count: 0,
      download_url: props.product.download_url || ''
    })
    
    step.value = 3
    emit('orderCreated', order)
  } catch (error) {
    console.error('Error creating order:', error)
    alert('Order creation failed. Contact support.')
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    step.value = 1
    region.value = null
    formData.value.email = ''
    
    nextTick(() => {
      if (window.lucide) {
        window.lucide.createIcons()
      }
      if (region.value === 'int') {
        setTimeout(renderPayPalButtons, 500)
      }
    })
  }
})

onMounted(() => {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 100)
})
</script>
