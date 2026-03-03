import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import AdminPage from '../pages/AdminPage.vue'
import DownloadPage from '../pages/DownloadPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPage
    },
    {
      path: '/download',
      name: 'download',
      component: DownloadPage
    }
  ]
})

export default router
