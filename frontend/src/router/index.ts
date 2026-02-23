import { createRouter, createWebHistory } from 'vue-router'

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
