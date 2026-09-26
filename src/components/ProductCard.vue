<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'

const props = defineProps(['product'])
const router = useRouter()
const cart = useCartStore()

const showQuickView = ref(false)
const added = ref(false)

const isNew = computed(() => {
  const created = new Date(props.product.created_at)
  const daysAgo = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
  return daysAgo <= 7
})

const hasDiscount = computed(() =>
  props.product.compare_at_price && props.product.compare_at_price > props.product.price
)

const discountPercent = computed(() => {
  if (!hasDiscount.value) return 0
  return Math.round(100 - (props.product.price / props.product.compare_at_price) * 100)
})

function openQuickView(e) {
  e.preventDefault()
  showQuickView.value = true
}

function quickAdd() {
  cart.addItem(props.product)
  added.value = true
  setTimeout(() => (added.value = false), 1200)
}

function goToDetails() {
  showQuickView.value = false
  router.push(`/product/${props.product.id}`)
}
</script>

<template>
  <RouterLink :to="`/product/${product.id}`" class="card">
    <div class="badges">
      <span v-if="isNew" class="badge new">جديد</span>
      <span v-if="hasDiscount" class="badge sale">-{{ discountPercent }}%</span>
    </div>

    <div class="image-wrap">
      <img :src="product.image_url || 'https://placehold.co/300x300?text=No+Image'" :alt="product.name" />
      <button class="quick-view-btn" @click="openQuickView">نظرة سريعة</button>
    </div>

    <div class="info">
      <span v-if="product.anime" class="anime-tag">{{ product.anime }}</span>
      <h3>{{ product.name }}</h3>
      <div class="prices">
        <span class="price">{{ product.price }} ج.م</span>
        <span v-if="hasDiscount" class="old-price">{{ product.compare_at_price }} ج.م</span>
      </div>
    </div>
  </RouterLink>

  <Teleport to="body">
    <div v-if="showQuickView" class="qv-overlay" @click.self="showQuickView = false">
      <div class="qv-modal">
        <button class="qv-close" @click="showQuickView = false">✕</button>
        <img :src="product.image_url || 'https://placehold.co/400x400?text=No+Image'" :alt="product.name" />
        <div class="qv-info">
          <span v-if="product.anime" class="anime-tag">{{ product.anime }}</span>
          <h3>{{ product.name }}</h3>
          <p class="qv-desc">{{ product.description || 'لا يوجد وصف لهذا المنتج.' }}</p>
          <div class="prices">
            <span class="price">{{ product.price }} ج.م</span>
            <span v-if="hasDiscount" class="old-price">{{ product.compare_at_price }} ج.م</span>
          </div>
          <p class="stock" :class="{ out: product.stock <= 0 }">
            {{ product.stock > 0 ? `متوفر (${product.stock} قطعة)` : 'نفذت الكمية' }}
          </p>
          <div class="qv-actions">
            <button class="btn-primary" :disabled="product.stock <= 0" @click="quickAdd">
              {{ added ? 'تمت الإضافة ✓' : 'أضف للسلة' }}
            </button>
            <button class="btn-secondary" @click="goToDetails">التفاصيل الكاملة</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.card {
  position: relative;
  background: var(--surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  overflow: hidden;
  display: block;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
.card:hover {
  border-color: var(--accent);
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.image-wrap {
  position: relative;
  overflow: hidden;
}
.image-wrap img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}
.quick-view-btn {
  position: absolute;
  bottom: -40px;
  left: 0;
  right: 0;
  padding: 10px;
  border: none;
  background: rgba(32,26,23,0.85);
  color: white;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: bottom 0.2s ease;
}
.card:hover .quick-view-btn {
  bottom: 0;
}

.info {
  padding: 14px;
}
.anime-tag {
  display: block;
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
  margin-bottom: 4px;
}
.info h3 {
  margin: 0 0 6px;
  font-size: 0.95rem;
  font-weight: 700;
}
.prices {
  display: flex;
  align-items: center;
  gap: 8px;
}
.price {
  margin: 0;
  color: var(--accent);
  font-weight: 700;
}
.old-price {
  color: var(--muted);
  text-decoration: line-through;
  font-size: 0.85rem;
}
.badges {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 6px;
  z-index: 1;
}
.badge {
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
}
.badge.new {
  background: #2e8b57;
}
.badge.sale {
  background: var(--accent);
}

/* Quick View Modal */
.qv-overlay {
  position: fixed;
  inset: 0;
  background: rgba(32,26,23,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}
.qv-modal {
  position: relative;
  background: var(--surface);
  border-radius: var(--radius-md);
  max-width: 640px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
  max-height: 85vh;
  overflow-y: auto;
}
.qv-modal img {
  width: 100%;
  border-radius: var(--radius-md);
  object-fit: cover;
  aspect-ratio: 1;
}
.qv-close {
  position: absolute;
  top: 12px;
  left: 12px;
  border: none;
  background: var(--bg);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  z-index: 1;
}
.qv-info {
  display: flex;
  flex-direction: column;
}
.qv-info h3 {
  margin: 0 0 10px;
  font-size: 1.2rem;
}
.qv-desc {
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 14px;
}
.stock {
  font-weight: 600;
  color: #2e8b57;
  margin: 10px 0;
}
.stock.out {
  color: var(--accent);
}
.qv-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}
.btn-secondary {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: none;
  color: var(--text);
  cursor: pointer;
  font-family: inherit;
  font-weight: 700;
}
.btn-secondary:hover {
  border-color: var(--accent);
  color: var(--accent);
}

@media (max-width: 600px) {
  .qv-modal {
    grid-template-columns: 1fr;
  }
}
</style>