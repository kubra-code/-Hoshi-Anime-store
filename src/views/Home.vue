<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()
const router = useRouter()

const products = ref([])
const categories = ref([])
const animes = ref([])
const loading = ref(true)

const slides = ref([])
const fallbackBanner = ref('أفضل منتجات الأنمي في مكان واحد')
const activeSlide = ref(0)
let slideTimer = null

const selectedCategory = ref('الكل')
const selectedAnime = ref('الكل')
const searchTerm = ref(route.query.search || '')
const saleOnly = ref(route.query.sale === 'true')

watch(() => route.query, (q) => {
  searchTerm.value = q.search || ''
  saleOnly.value = q.sale === 'true'
})

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const catMatch = selectedCategory.value === 'الكل' || p.category === selectedCategory.value
    const animeMatch = selectedAnime.value === 'الكل' || p.anime === selectedAnime.value
    const searchMatch = !searchTerm.value ||
      p.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (p.anime && p.anime.toLowerCase().includes(searchTerm.value.toLowerCase()))
    const saleMatch = !saleOnly.value || (p.compare_at_price && p.compare_at_price > p.price)
    return catMatch && animeMatch && searchMatch && saleMatch
  })
})

const isFiltering = computed(() =>
  selectedCategory.value !== 'الكل' || selectedAnime.value !== 'الكل' || !!searchTerm.value || saleOnly.value
)

// أحدث 3 منتجات — بتتعرض في العمود الجانبي زي "مقترح ليك"
const suggested = computed(() => products.value.slice(0, 3))
const newArrivals = computed(() => {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  return products.value
    .filter(p => new Date(p.created_at).getTime() >= cutoff)
    .slice(0, 8)
})
function toggleCategory(name) {
  selectedCategory.value = selectedCategory.value === name ? 'الكل' : name
}
function toggleAnime(name) {
  selectedAnime.value = selectedAnime.value === name ? 'الكل' : name
}
function clearFilters() {
  selectedCategory.value = 'الكل'
  selectedAnime.value = 'الكل'
  searchTerm.value = ''
  saleOnly.value = false
  router.push({ path: '/', query: {} })
}

function goToSlide(i) {
  activeSlide.value = i
  resetTimer()
}
function nextSlide() {
  if (!slides.value.length) return
  activeSlide.value = (activeSlide.value + 1) % slides.value.length
}
function prevSlide() {
  if (!slides.value.length) return
  activeSlide.value = (activeSlide.value - 1 + slides.value.length) % slides.value.length
}
function resetTimer() {
  clearInterval(slideTimer)
  if (slides.value.length > 1) {
    slideTimer = setInterval(nextSlide, 5000)
  }
}

onMounted(async () => {
  const [{ data: settings }, { data: p }, { data: c }, { data: a }, { data: s }] = await Promise.all([
    supabase.from('store_settings').select('banner_text').eq('id', 1).single(),
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
    supabase.from('animes').select('*').order('name'),
    supabase.from('hero_slides').select('*').order('sort_order')
  ])
  if (settings?.banner_text) fallbackBanner.value = settings.banner_text
  products.value = p || []
  categories.value = c || []
  animes.value = a || []
  slides.value = s || []
  loading.value = false
  resetTimer()
})

onUnmounted(() => clearInterval(slideTimer))
</script>

<template>
  <section class="hero">
    <template v-if="slides.length">
      <div
        v-for="(s, i) in slides"
        :key="s.id"
        class="hero-slide"
        :class="{ active: i === activeSlide }"
      >
        <div class="hero-text">
          <h1>{{ s.title || fallbackBanner }}</h1>
          <p v-if="s.subtitle">{{ s.subtitle }}</p>
        </div>
        <div class="hero-image-wrap">
          <img :src="s.image_url" :alt="s.title" />
        </div>
      </div>

      <button class="hero-arrow prev" @click="prevSlide">‹</button>
      <button class="hero-arrow next" @click="nextSlide">›</button>

      <div class="hero-dots">
        <button
          v-for="(s, i) in slides"
          :key="s.id"
          class="dot"
          :class="{ active: i === activeSlide }"
          @click="goToSlide(i)"
        ></button>
      </div>
    </template>

    <div v-else class="hero-slide active no-slides">
      <div class="hero-text">
        <h1>{{ fallbackBanner }}</h1>
      </div>
    </div>
  </section>

  <section v-if="categories.length" class="tiles-section">
    <h2 class="section-heading">تسوق حسب النوع</h2>
    <div class="tiles">
      <button
        v-for="c in categories"
        :key="c.id"
        class="tile"
        :class="{ active: selectedCategory === c.name }"
        @click="toggleCategory(c.name)"
      >
        <img :src="c.image_url || 'https://placehold.co/150'" />
        <span>{{ c.name }}</span>
      </button>
    </div>
  </section>
  <section v-if="newArrivals.length" class="tiles-section">
  <h2 class="section-heading">✨ وصل حديثًا</h2>
  <div class="grid">
    <ProductCard v-for="p in newArrivals" :key="p.id" :product="p" />
  </div>
</section>

  <div class="layout">
    <div class="main-col">
      <section v-if="animes.length" class="tiles-section">
        <h2 class="section-heading">تسوق حسب الأنمي</h2>
        <div class="tiles">
          <button
            v-for="a in animes"
            :key="a.id"
            class="tile"
            :class="{ active: selectedAnime === a.name }"
            @click="toggleAnime(a.name)"
          >
            <img :src="a.image_url || 'https://placehold.co/150'" />
            <span>{{ a.name }}</span>
          </button>
        </div>
      </section>

      <div class="products-header">
        <h2 class="section-heading">
          {{ searchTerm ? `نتائج البحث عن "${searchTerm}"` : (isFiltering ? 'نتائج البحث' : 'كل المنتجات') }}
        </h2>
        <button v-if="isFiltering" class="clear-btn" @click="clearFilters">مسح الفلاتر ✕</button>
      </div>

      <p v-if="loading">جاري تحميل المنتجات...</p>
      <p v-else-if="!filteredProducts.length">لا توجد منتجات مطابقة.</p>

      <div v-else class="grid">
        <ProductCard v-for="p in filteredProducts" :key="p.id" :product="p" />
      </div>
    </div>

    <aside class="side-col">
      <div class="side-block">
        <h3 class="section-heading">فلاتر سريعة</h3>
        <div class="quick-pills">
          <button
            v-for="c in categories.slice(0, 6)"
            :key="c.id"
            class="pill"
            @click="toggleCategory(c.name)"
          >
            🔍 {{ c.name }}
          </button>
        </div>
      </div>

      <div class="side-block" v-if="suggested.length">
        <h3 class="section-heading">مقترح ليك</h3>
        <RouterLink
          v-for="p in suggested"
          :key="p.id"
          :to="`/product/${p.id}`"
          class="mini-card"
        >
          <img :src="p.image_url || 'https://placehold.co/70'" />
          <div class="mini-info">
            <strong>{{ p.name }}</strong>
            <span>{{ p.price }} ج.م</span>
          </div>
        </RouterLink>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 40px;
  background: var(--accent-tint);
  min-height: 340px;
}

.hero-slide {
  display: none;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  min-height: 340px;
}
.hero-slide.active {
  display: grid;
}
.hero-slide.no-slides {
  grid-template-columns: 1fr;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.hero-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
  z-index: 2;
}
.hero-text h1 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 12px;
  line-height: 1.3;
}
.hero-text p {
  color: var(--muted);
  margin: 0;
  max-width: 340px;
}

.hero-image-wrap {
  position: relative;
  overflow: hidden;
}
.hero-image-wrap::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--accent-tint) 0%, transparent 25%);
  z-index: 1;
}
.hero-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.85);
  color: var(--text);
  font-size: 1.3rem;
  cursor: pointer;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-arrow:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.hero-arrow.prev { right: 16px; }
.hero-arrow.next { left: 16px; }

.hero-dots {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 3;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(32,26,23,0.2);
  cursor: pointer;
  padding: 0;
}
.dot.active {
  background: var(--accent);
  width: 22px;
  border-radius: 4px;
}

@media (max-width: 700px) {
  .hero-slide { grid-template-columns: 1fr; }
  .hero-image-wrap { height: 200px; order: 1; }
  .hero-image-wrap::before { background: linear-gradient(180deg, transparent 60%, var(--accent-tint) 100%); }
  .hero-text { padding: 24px; order: 2; }
}

.tiles-section {
  margin-bottom: 36px;
}
.tiles {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 6px;
}
.tile {
  flex: 0 0 auto;
  width: 110px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  text-align: center;
}
.tile img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--radius-md);
  display: block;
  margin-bottom: 8px;
  border: 2px solid var(--border);
}
.tile span {
  color: var(--text);
  font-size: 0.85rem;
}
.tile.active img { border-color: var(--accent); }
.tile.active span { color: var(--accent); font-weight: 700; }

.layout {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 32px;
  align-items: start;
}

.products-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.clear-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--muted);
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.side-col {
  display: flex;
  flex-direction: column;
  gap: 28px;
  position: sticky;
  top: 20px;
}
.side-block {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 18px;
}
.quick-pills {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pill {
  text-align: right;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
}
.pill:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.mini-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.mini-card:last-child { border-bottom: none; }
.mini-card img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
.mini-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.85rem;
}
.mini-info span {
  color: var(--accent);
  font-weight: 700;
}

@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .side-col { position: static; }
}
</style>