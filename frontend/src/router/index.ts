import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import LandingView from '@/components/LandingView.vue'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'LandingView',
    component: LandingView,
  }
]

// views
import Landing from "@/views/Landing.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Landing
    }
  ],
})

export default router
