import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabase'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Home.vue') },
  { path: '/product/:id', name: 'product', component: () => import('../views/ProductDetail.vue') },
  { path: '/cart', name: 'cart', component: () => import('../views/Cart.vue') },
  { path: '/admin/login', name: 'admin-login', component: () => import('../views/AdminLogin.vue') },
  {
    path: '/admin',
    component: () => import('../views/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/products' },
      { path: 'products', name: 'admin-products', component: () => import('../views/AdminProducts.vue') },
      { path: 'orders', name: 'admin-orders', component: () => import('../views/AdminOrders.vue') },
      { path: 'categories', name: 'admin-categories', component: () => import('../views/AdminCategories.vue') },
{ path: 'animes', name: 'admin-animes', component: () => import('../views/AdminAnimes.vue') },
      { path: 'settings', name: 'admin-settings', component: () => import('../views/AdminSettings.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      return { name: 'admin-login' }
    }
  }
})

export default router