import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Load Lucide icons
const script = document.createElement('script')
script.src = 'https://unpkg.com/lucide@latest/dist/umd/lucide.js'
script.onload = () => {
  if (window.lucide) {
    window.lucide.createIcons()
  }
}
document.head.appendChild(script)

app.mount('#app')
