<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const settings = ref({ store_name: '', logo_url: '', banner_text: '', currency: '' })
const saved = ref(false)

const slides = ref([])
const newSlide = ref({ image_url: '', title: '', subtitle: '' })
const uploading = ref(false)

async function fetchSettings() {
  const { data } = await supabase.from('store_settings').select('*').eq('id', 1).single()
  if (data) settings.value = data
}

async function saveSettings() {
  await supabase.from('store_settings').update(settings.value).eq('id', 1)
  saved.value = true
  setTimeout(() => (saved.value = false), 1500)
}

async function fetchSlides() {
  const { data } = await supabase.from('hero_slides').select('*').order('sort_order')
  slides.value = data || []
}

async function uploadSlideImage(e) {
  const file = e.target.files[0]
  if (!file) return
  uploading.value = true
  const fileName = `hero/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('product-images').upload(fileName, file)
  uploading.value = false
  if (error) {
    alert('فشل رفع الصورة: ' + error.message)
    return
  }
  const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
  newSlide.value.image_url = data.publicUrl
}

async function addSlide() {
  if (!newSlide.value.image_url) return
  const nextOrder = slides.value.length
  await supabase.from('hero_slides').insert({ ...newSlide.value, sort_order: nextOrder })
  newSlide.value = { image_url: '', title: '', subtitle: '' }
  await fetchSlides()
}

async function deleteSlide(id) {
  if (!confirm('متأكد إنك عايز تمسح السلايد ده؟')) return
  await supabase.from('hero_slides').delete().eq('id', id)
  await fetchSlides()
}

async function moveSlide(index, direction) {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= slides.value.length) return
  const a = slides.value[index]
  const b = slides.value[targetIndex]
  await Promise.all([
    supabase.from('hero_slides').update({ sort_order: b.sort_order }).eq('id', a.id),
    supabase.from('hero_slides').update({ sort_order: a.sort_order }).eq('id', b.id)
  ])
  await fetchSlides()
}

onMounted(() => {
  fetchSettings()
  fetchSlides()
})
</script>

<template>
  <h1>إعدادات المتجر</h1>

  <form class="settings-form" @submit.prevent="saveSettings">
    <label>اسم المتجر</label>
    <input v-model="settings.store_name" />

    <label>نص الشعار الافتراضي (لو مفيش سلايدات)</label>
    <input v-model="settings.banner_text" />

    <label>العملة</label>
    <input v-model="settings.currency" />

    <button type="submit" class="btn-primary">{{ saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات' }}</button>
  </form>

  <hr />

  <h2>صور الهيرو (السلايدر في الصفحة الرئيسية)</h2>
  <p class="hint">ضيف كذا صورة، وهتتقلب أوتوماتيك في الصفحة الرئيسية. لو محتاج ترتيب معين استخدم الأسهم.</p>

  <div class="slides-list">
    <div class="slide-row" v-for="(s, i) in slides" :key="s.id">
      <img :src="s.image_url" class="thumb" />
      <div class="slide-info">
        <strong>{{ s.title || 'بدون عنوان' }}</strong>
        <span>{{ s.subtitle }}</span>
      </div>
      <div class="slide-actions">
        <button type="button" @click="moveSlide(i, -1)" :disabled="i === 0">↑</button>
        <button type="button" @click="moveSlide(i, 1)" :disabled="i === slides.length - 1">↓</button>
        <button type="button" class="danger" @click="deleteSlide(s.id)">حذف</button>
      </div>
    </div>
  </div>

  <form class="slide-form" @submit.prevent="addSlide">
    <h3>إضافة سلايد جديد</h3>
    <input type="file" accept="image/*" @change="uploadSlideImage" />
    <img v-if="newSlide.image_url" :src="newSlide.image_url" class="preview" />
    <input v-model="newSlide.title" placeholder="عنوان (اختياري)" />
    <input v-model="newSlide.subtitle" placeholder="نص فرعي (اختياري)" />
    <button type="submit" class="btn-primary" :disabled="!newSlide.image_url || uploading">
      {{ uploading ? 'جاري الرفع...' : 'إضافة السلايد' }}
    </button>
  </form>
</template>

<style scoped>
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 420px;
}
label {
  color: var(--muted);
  font-size: 0.9rem;
  margin-top: 10px;
}
input {
  padding: 10px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255,255,255,0.15);
  background: var(--surface);
  color: var(--text);
  font-family: inherit;
}
.hint {
  color: var(--muted);
  font-size: 0.85rem;
  margin-bottom: 16px;
}
.slides-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
  max-width: 600px;
}
.slide-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--surface);
  padding: 10px;
  border-radius: var(--radius-md);
}
.thumb {
  width: 70px;
  height: 44px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
.slide-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.slide-info span {
  color: var(--muted);
  font-size: 0.8rem;
}
.slide-actions {
  display: flex;
  gap: 6px;
}
.slide-actions button {
  padding: 6px 10px;
  border: 1px solid rgba(255,255,255,0.15);
  background: none;
  color: var(--text);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: inherit;
}
.slide-actions button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.danger {
  border-color: #ff4d4d !important;
  color: #ff4d4d;
}
.slide-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 420px;
  background: var(--surface);
  padding: 20px;
  border-radius: var(--radius-md);
}
.preview {
  width: 160px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
</style>