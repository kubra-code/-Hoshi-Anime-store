<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

async function handleLogin() {
  error.value = ''
  loading.value = true
  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  loading.value = false
  if (err) {
    error.value = 'الإيميل أو الباسورد غلط.'
  } else {
    router.push('/admin/products')
  }
}
</script>

<template>
  <div class="login-box">
    <h1>دخول لوحة التحكم</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="الإيميل" required />
      <input v-model="password" type="password" placeholder="الباسورد" required />
      <p v-if="error" class="error">{{ error }}</p>
      <button :disabled="loading">{{ loading ? 'جاري الدخول...' : 'دخول' }}</button>
    </form>
  </div>
</template>

<style scoped>
.login-box {
  max-width: 360px;
  margin: 60px auto;
  text-align: center;
}
form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}
input {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.15);
  background: var(--surface);
  color: var(--text);
  font-family: inherit;
}
button {
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.error {
  color: #ff6b6b;
  margin: 0;
}
</style>