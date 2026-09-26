<script setup>
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

async function logout() {
  await supabase.auth.signOut()
  router.push('/admin/login')
}
</script>

<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <h2>لوحة التحكم</h2>
      <nav>
        <RouterLink to="/admin/products">المنتجات</RouterLink>
        <RouterLink to="/admin/orders">الطلبات</RouterLink>
        <RouterLink to="/admin/categories">التصنيفات</RouterLink>
<RouterLink to="/admin/animes">الأنميهات</RouterLink>
        <RouterLink to="/admin/settings">إعدادات المتجر</RouterLink>
      </nav>
      <button class="logout" @click="logout">تسجيل خروج</button>
    </aside>
    <div class="content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 32px;
  min-height: 60vh;
}
.sidebar {
  background: var(--surface);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.sidebar h2 {
  font-size: 1.1rem;
  margin-bottom: 20px;
}
nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
nav a {
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--muted);
}
nav a.router-link-active {
  background: var(--accent);
  color: white;
}
.logout {
  margin-top: auto;
  background: none;
  border: 1px solid rgba(255,255,255,0.15);
  color: var(--muted);
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
}

@media (max-width: 700px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }
}
</style>