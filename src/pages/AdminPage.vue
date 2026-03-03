<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 text-white fixed h-full hidden md:block">
      <div class="p-6">
        <div class="flex items-center gap-2 mb-8 cursor-pointer" @click="$router.push('/')">
          <div class="bg-orange-600 text-white p-1 rounded font-bold text-sm">RH</div>
          <span class="font-bold text-lg">Admin</span>
        </div>
        <nav class="space-y-2">
          <button 
            @click="view = 'orders'"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition',
              view === 'orders' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800'
            ]"
          >
            <i data-lucide="shopping-cart" class="w-4 h-4"></i> Orders
          </button>
          <button 
            @click="view = 'products'"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition',
              view === 'products' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800'
            ]"
          >
            <i data-lucide="package" class="w-4 h-4"></i> Products
          </button>
          <button 
            @click="$router.push('/')"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 transition"
          >
            <i data-lucide="eye" class="w-4 h-4"></i> View Site
          </button>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 md:ml-64 p-8">
      <div class="max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900 capitalize">{{ view }} Management</h1>
          <div class="flex gap-2">
            <button 
              v-if="view === 'products'" 
              @click="showProductForm = true"
              class="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800"
            >
              <i data-lucide="plus" class="w-4 h-4"></i> Add Product
            </button>
            <button 
              @click="fetchData" 
              class="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow text-sm font-medium hover:bg-gray-50 border border-gray-200"
            >
              <i data-lucide="refresh-cw" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- ORDERS VIEW -->
        <div v-if="view === 'orders'" class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4">Product ID</th>
                  <th class="px-6 py-4">Details</th>
                  <th class="px-6 py-4">Payment</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm">
                <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <span :class="[
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-bold capitalize',
                      order.status === 'verified' ? 'bg-green-100 text-green-700' : 
                      order.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    ]">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-mono text-xs text-gray-500">{{ order.product_id || 'N/A' }}</td>
                  <td class="px-6 py-4">
                    <div class="font-medium text-gray-900">{{ order.email }}</div>
                    <div class="text-gray-500 text-xs">{{ new Date(order.created_at).toLocaleString() }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-xs font-mono">
                      <span v-if="order.payment_method === 'paypal'" class="text-blue-600 flex items-center gap-1">
                        <i data-lucide="credit-card" class="w-3 h-3"></i> PayPal
                      </span>
                      <span v-else class="text-green-600 flex items-center gap-1">
                        <i data-lucide="smartphone" class="w-3 h-3"></i> {{ order.mpesa_code || 'WhatsApp' }}
                      </span>
                      <div v-if="order.amount_paid" class="text-gray-400 mt-0.5">KES {{ order.amount_paid }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <button v-if="order.status === 'pending'" @click="verifyOrder(order)" class="text-green-600 hover:bg-green-50 p-1 rounded">
                      <i data-lucide="check" class="w-4 h-4"></i>
                    </button>
                    <button v-if="order.status === 'pending'" @click="rejectOrder(order)" class="text-red-600 hover:bg-red-50 p-1 rounded">
                      <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="orders.length === 0">
                  <td colspan="5" class="p-8 text-center text-gray-500">No orders yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- PRODUCTS VIEW -->
        <div v-if="view === 'products'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="product in products" :key="product.id" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div class="h-32 bg-gray-100 relative">
              <img v-if="product.image_url" :src="product.image_url" :alt="product.name" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                <i data-lucide="image" class="w-10 h-10"></i>
              </div>
              <div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                {{ product.category }}
              </div>
            </div>
            <div class="p-4 flex-1">
              <h3 class="font-bold text-gray-900 mb-1 line-clamp-1">{{ product.name }}</h3>
              <p class="text-sm text-gray-500 mb-4 line-clamp-2">{{ product.description }}</p>
              <div class="flex justify-between items-center mt-auto">
                <span class="font-mono font-bold text-orange-600">KES {{ product.price }}</span>
                <button @click="deleteProduct(product.id)" class="text-red-500 hover:text-red-700 p-2">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          </div>
          <div v-if="products.length === 0" class="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
            No products found. Add one to get started.
          </div>
        </div>
      </div>
    </main>

    <!-- Add Product Modal -->
    <div v-if="showProductForm" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Add New Product</h2>
          <button @click="showProductForm = false">
            <i data-lucide="x" class="w-6 h-6 text-gray-400 hover:text-gray-600"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleAddProduct" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input v-model="newProduct.name" required class="w-full p-2 border rounded-lg" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Price (KES)</label>
              <input type="number" v-model="newProduct.price" required class="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select v-model="newProduct.category" class="w-full p-2 border rounded-lg">
                <option value="book">Book (PDF)</option>
                <option value="slides">Slides (PPT)</option>
                <option value="template">Template</option>
                <option value="software">Software</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input v-model="newProduct.image_url" class="w-full p-2 border rounded-lg" placeholder="https://..." />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
            <FileUploader 
              v-model="newProduct.file" 
              @uploaded="newProduct.r2_key = $event"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="newProduct.description" class="w-full p-2 border rounded-lg h-24"></textarea>
          </div>
          
          <button type="submit" class="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700">
            Save Product
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '../stores/products'
import { useOrderStore } from '../stores/orders'
import FileUploader from '../components/FileUploader.vue'

const productStore = useProductStore()
const orderStore = useOrderStore()

const view = ref('orders')
const showProductForm = ref(false)
const orders = ref([])
const products = ref([])

const newProduct = ref({
  name: '',
  price: '',
  description: '',
  category: 'book',
  image_url: '',
  r2_key: '',
  file: null
})

const fetchData = async () => {
  await Promise.all([
    productStore.fetchProducts(),
    orderStore.fetchOrders()
  ])
  orders.value = orderStore.orders
  products.value = productStore.products
}

const handleAddProduct = async () => {
  try {
    const productData = {
      name: newProduct.value.name,
      price: parseFloat(newProduct.value.price),
      description: newProduct.value.description,
      category: newProduct.value.category,
      image_url: newProduct.value.image_url,
      r2_key: newProduct.value.r2_key
    }
    
    await productStore.addProduct(productData)
    showProductForm.value = false
    newProduct.value = { name: '', price: '', description: '', category: 'book', image_url: '', r2_key: '', file: null }
    alert('Product added successfully!')
  } catch (err) {
    console.error(err)
    alert('Failed to add product')
  }
}

const deleteProduct = async (id) => {
  if (!confirm('Delete this product?')) return
  try {
    await productStore.deleteProduct(id)
  } catch (err) {
    alert('Failed to delete')
  }
}

const verifyOrder = async (order) => {
  try {
    await orderStore.verifyOrder(order.id)
    alert('Order verified!')
    fetchData()
  } catch (err) {
    alert('Failed to verify')
  }
}

const rejectOrder = async (order) => {
  if (!confirm('Reject this order?')) return
  try {
    await orderStore.rejectOrder(order.id)
    fetchData()
  } catch (err) {
    alert('Failed to reject')
  }
}

onMounted(() => {
  fetchData()
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 100)
})
</script>
