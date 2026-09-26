<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
const router = useRouter()
const route = useRoute()

const menuOpen = ref(false)
const searchTerm = ref(route.query.search || '')

function submitSearch() {
  if (!searchTerm.value.trim()) return
  router.push({ path: '/', query: { search: searchTerm.value.trim() } })
  menuOpen.value = false
}

function goHome(query = {}) {
  router.push({ path: '/', query })
  menuOpen.value = false
}
</script>

<template>
  <header class="navbar">
    <div class="navbar-top">
      <RouterLink to="/" class="logo" @click="menuOpen = false">
        <img src="/logo.png" alt="Hoshi Anime Store" />
      </RouterLink>

      <form class="search-box" @submit.prevent="submitSearch">
        <input v-model="searchTerm" type="text" placeholder="ابحث عن منتج أو أنمي..." />
        <button type="submit" aria-label="بحث">🔍</button>
      </form>

      <div class="navbar-actions">
        <RouterLink to="/cart" class="cart-link">
          🛒
          <span v-if="cart.totalItems" class="badge">{{ cart.totalItems }}</span>
        </RouterLink>
        <button class="menu-toggle" @click="menuOpen = !menuOpen" aria-label="القائمة">
          {{ menuOpen ? '✕' : '☰' }}
        </button>
      </div>
    </div>

    <nav class="navbar-links" :class="{ open: menuOpen }">
      <a href="#" @click.prevent="goHome()">الرئيسية</a>
      <a href="#" @click.prevent="goHome()">كل المنتجات</a>
      <a href="#" @click.prevent="goHome({ sale: 'true' })">العروض</a>
    </nav>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--surface);
  border-bottom: 2px solid var(--accent);
}
.navbar-top {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 32px;
}
.logo img {
  height: 40px;
  display: block;
  flex-shrink: 0;
}
.search-box {
  flex: 1;
  max-width: 480px;
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 999px;
  overflow: hidden;
  background: var(--bg);
}
.search-box input {
  flex: 1;
  border: none;
  background: none;
  padding: 10px 16px;
  color: var(--text);
  font-family: inherit;
  outline: none;
}
.search-box button {
  border: none;
  background: none;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 1rem;
}
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-right: auto;
}
.cart-link {
  position: relative;
  font-size: 1.3rem;
}
.badge {
  position: absolute;
  top: -8px;
  left: -10px;
  background: var(--accent);
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
}
.menu-toggle {
  display: none;
  border: none;
  background: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--text);
}
.navbar-links {
  display: flex;
  gap: 24px;
  padding: 0 32px 14px;
}
.navbar-links a {
  color: var(--muted);
  font-weight: 600;
  font-size: 0.9rem;
}
.navbar-links a:hover {
  color: var(--accent);
}

@media (max-width: 700px) {
  .navbar-top {
    padding: 12px 16px;
    gap: 12px;
  }
  .search-box {
    max-width: none;
  }
  .menu-toggle {
    display: block;
  }
  .navbar-links {
    display: none;
    flex-direction: column;
    gap: 12px;
    padding: 0 16px 16px;
  }
  .navbar-links.open {
    display: flex;
  }
}
</style>