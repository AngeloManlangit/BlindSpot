import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import LandingView from '@/views/LandingView.vue'
import MapPage from '@/views/mapPage.vue'

// views
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: LandingView
    },
    {
      path: '/Map',
      name: 'Map',
      component: MapPage
    }
  ],
})

export default router
