<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const products = ref([])
const categories = ref([])
const animes = ref([])
const loading = ref(true)
const editingId = ref(null)

const form = ref({
  name: '', description: '', price: 0, compare_at_price: null,
  image_url: '', category: '', anime: '', stock: 0
})

async function fetchAll() {
  loading.value = true
  const [{ data: p }, { data: c }, { data: a }] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
    supabase.from('animes').select('*').order('name')
  ])
  products.value = p || []
  categories.value = c || []
  animes.value = a || []
  loading.value = false
}

function resetForm() {
  form.value = {
    name: '', description: '', price: 0, compare_at_price: null,
    image_url: '', category: '', anime: '', stock: 0
  }
  editingId.value = null
}

function editProduct(p) {
  editingId.value = p.id
  form.value = {
    name: p.name,
    description: p.description,
    price: p.price,
    compare_at_price: p.compare_at_price,
    image_url: p.image_url,
    category: p.category,
    anime: p.anime,
    stock: p.stock
  }
}

async function saveProduct() {
  if (!form.value.name) return
  if (editingId.value) {
    await supabase.from('products').update(form.value).eq('id', editingId.value)
  } else {
    await supabase.from('products').insert(form.value)
  }
  resetForm()
  await fetchAll()
}

async function deleteProduct(id) {
  if (!confirm('متأكد إنك عايز تمسح المنتج ده؟')) return
  await supabase.from('products').delete().eq('id', id)
  await fetchAll()
}

async function uploadImage(e) {
  const file = e.target.files[0]
  if (!file) return
  const fileName = `${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('product-images').upload(fileName, file)
  if (error) {
    alert('فشل رفع الصورة: ' + error.message)
    return
  }
  const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
  form.value.image_url = data.publicUrl
}

onMounted(fetchAll)
</script>

<template>
  <h1>المنتجات</h1>

  <form class="product-form" @submit.prevent="saveProduct">
    <h3>{{ editingId ? 'تعديل منتج' : 'إضافة منتج جديد' }}</h3>
    <input v-model="form.name" placeholder="اسم المنتج" required />
    <textarea v-model="form.description" placeholder="الوصف"></textarea>

    <div class="row">
      <input v-model.number="form.price" type="number" step="0.01" placeholder="السعر" required />
      <input v-model.number="form.compare_at_price" type="number" step="0.01" placeholder="السعر قبل الخصم (اختياري)" />
    </div>

    <div class="row">
      <select v-model="form.category" required>
        <option value="" disabled>اختر التصنيف</option>
        <option v-for="c in categories" :key="c.id" :value="c.name">{{ c.name }}</option>
      </select>
      <select v-model="form.anime">
        <option value="">بدون أنمي محدد</option>
        <option v-for="a in animes" :key="a.id" :value="a.name">{{ a.name }}</option>
      </select>
    </div>
    <p v-if="!categories.length" class="hint">
      لسه معملتش تصنيفات — روح لصفحة "التصنيفات" وضيف واحد الأول.
    </p>

    <input v-model.number="form.stock" type="number" placeholder="الكمية المتاحة" />

    <input type="file" accept="image/*" @change="uploadImage" />
    <img v-if="form.image_url" :src="form.image_url" class="preview" />

    <div class="row">
      <button type="submit">{{ editingId ? 'حفظ التعديل' : 'إضافة المنتج' }}</button>
      <button v-if="editingId" type="button" class="cancel" @click="resetForm">إلغاء</button>
    </div>
  </form>

  <hr />

  <p v-if="loading">جاري التحميل...</p>
  <table v-else class="products-table">
    <thead>
      <tr>
        <th>الصورة</th><th>الاسم</th><th>الأنمي</th><th>السعر</th><th>الكمية</th><th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="p in products" :key="p.id">
        <td><img :src="p.image_url || 'https://placehold.co/50'" class="thumb" /></td>
        <td>{{ p.name }}</td>
        <td>{{ p.anime || '—' }}</td>
        <td>
          {{ p.price }} ج.م
          <span v-if="p.compare_at_price" class="old-price">{{ p.compare_at_price }} ج.م</span>
        </td>
        <td>{{ p.stock }}</td>
        <td class="actions">
          <button @click="editProduct(p)">تعديل</button>
          <button class="danger" @click="deleteProduct(p.id)">حذف</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.product-form {
  background: var(--surface);
  padding: 20px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 500px;
  margin-bottom: 30px;
}
.row { display: flex; gap: 10px; }
.row > * { flex: 1; }
input, textarea, select {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.15);
  background: var(--bg);
  color: var(--text);
  font-family: inherit;
}
.hint { color: var(--muted); font-size: 0.85rem; margin: 0; }
.preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}
button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  cursor: pointer;
  font-family: inherit;
}
.cancel { background: #444; }
.products-table {
  width: 100%;
  border-collapse: collapse;
}
.products-table th, .products-table td {
  padding: 10px;
  text-align: right;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.thumb {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 6px;
}
.old-price {
  display: block;
  color: var(--muted);
  text-decoration: line-through;
  font-size: 0.8rem;
}
.actions button {
  padding: 6px 10px;
  font-size: 0.85rem;
  margin-inline-start: 6px;
}
.danger { background: #ff4d4d; }
</style>