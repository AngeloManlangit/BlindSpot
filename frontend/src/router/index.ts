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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [],
})

export default router
