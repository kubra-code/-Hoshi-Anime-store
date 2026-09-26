<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { useCartStore } from '../stores/cart'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()

const product = ref(null)
const loading = ref(true)
const added = ref(false)

onMounted(async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', route.params.id)
    .single()

  if (!error) product.value = data
  loading.value = false
})

function addToCart() {
  cart.addItem(product.value)
  added.value = true
  setTimeout(() => (added.value = false), 1500)
}
</script>

<template>
  <p v-if="loading">جاري التحميل...</p>
  <p v-else-if="!product">المنتج مش موجود.</p>

  <div v-else class="detail">
    <img :src="product.image_url || 'https://placehold.co/500x500?text=No+Image'" :alt="product.name" />
    <div class="info">
      <button class="back" @click="router.push('/')">→ رجوع للمتجر</button>
      <h1>{{ product.name }}</h1>
      <p class="category">{{ product.category }}</p>
      <p class="price">{{ product.price }} ج.م</p>
      <p class="desc">{{ product.description || 'لا يوجد وصف لهذا المنتج.' }}</p>
      <p class="stock" :class="{ out: product.stock <= 0 }">
        {{ product.stock > 0 ? `متوفر (${product.stock} قطعة)` : 'نفذت الكمية' }}
      </p>
      <button class="add-btn" :disabled="product.stock <= 0" @click="addToCart">
        {{ added ? 'تمت الإضافة ✓' : 'أضف للسلة' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}
.detail img {
  width: 100%;
  border-radius: 16px;
  object-fit: cover;
  aspect-ratio: 1;
}
.back {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 0;
  margin-bottom: 12px;
  font-family: inherit;
}
.category {
  color: var(--muted);
  margin: 0 0 8px;
}
.price {
  font-size: 1.6rem;
  color: var(--accent);
  font-weight: 800;
}
.desc {
  color: var(--muted);
  line-height: 1.7;
}
.stock {
  font-weight: 600;
  color: #6ee7a0;
}
.stock.out {
  color: #ff6b6b;
}
.add-btn {
  margin-top: 16px;
  padding: 14px 28px;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  font-family: inherit;
}
.add-btn:disabled {
  background: #444;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .detail {
    grid-template-columns: 1fr;
  }
}
</style>