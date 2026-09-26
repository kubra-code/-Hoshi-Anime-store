<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const items = ref([])
const loading = ref(true)
const editingId = ref(null)
const form = ref({ name: '', image_url: '' })

async function fetchItems() {
  loading.value = true
  const { data } = await supabase.from('animes').select('*').order('created_at')
  items.value = data || []
  loading.value = false
}

function resetForm() {
  form.value = { name: '', image_url: '' }
  editingId.value = null
}

function editItem(item) {
  editingId.value = item.id
  form.value = { name: item.name, image_url: item.image_url }
}

async function saveItem() {
  if (!form.value.name) return
  if (editingId.value) {
    await supabase.from('animes').update(form.value).eq('id', editingId.value)
  } else {
    await supabase.from('animes').insert(form.value)
  }
  resetForm()
  await fetchItems()
}

async function deleteItem(id) {
  if (!confirm('متأكد إنك عايز تمسح الأنمي ده؟')) return
  await supabase.from('animes').delete().eq('id', id)
  await fetchItems()
}

async function uploadImage(e) {
  const file = e.target.files[0]
  if (!file) return
  const fileName = `animes/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('product-images').upload(fileName, file)
  if (error) {
    alert('فشل رفع الصورة: ' + error.message)
    return
  }
  const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
  form.value.image_url = data.publicUrl
}

onMounted(fetchItems)
</script>

<template>
  <h1>الأنميهات</h1>

  <form class="item-form" @submit.prevent="saveItem">
    <h3>{{ editingId ? 'تعديل أنمي' : 'إضافة أنمي جديد' }}</h3>
    <input v-model="form.name" placeholder="اسم الأنمي (ون بيس، ناروتو...)" required />
    <input type="file" accept="image/*" @change="uploadImage" />
    <img v-if="form.image_url" :src="form.image_url" class="preview" />
    <div class="row">
      <button type="submit">{{ editingId ? 'حفظ التعديل' : 'إضافة' }}</button>
      <button v-if="editingId" type="button" class="cancel" @click="resetForm">إلغاء</button>
    </div>
  </form>

  <hr />

  <p v-if="loading">جاري التحميل...</p>
  <p v-else-if="!items.length">لسه مفيش أنميهات مضافة.</p>

  <div v-else class="grid">
    <div class="card" v-for="item in items" :key="item.id">
      <img :src="item.image_url || 'https://placehold.co/150'" />
      <h4>{{ item.name }}</h4>
      <div class="actions">
        <button @click="editItem(item)">تعديل</button>
        <button class="danger" @click="deleteItem(item.id)">حذف</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-form { background: var(--surface); padding: 20px; border-radius: 14px; display: flex; flex-direction: column; gap: 10px; max-width: 420px; margin-bottom: 30px; }
input { padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: var(--bg); color: var(--text); font-family: inherit; }
.preview { width: 90px; height: 90px; object-fit: cover; border-radius: 8px; }
.row { display: flex; gap: 10px; }
button { padding: 10px 16px; border: none; border-radius: 8px; background: var(--accent); color: white; cursor: pointer; font-family: inherit; }
.cancel { background: #444; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }
.card { background: var(--surface); border-radius: 12px; padding: 12px; text-align: center; }
.card img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; margin-bottom: 8px; }
.card h4 { margin: 0 0 8px; font-size: 0.9rem; }
.actions { display: flex; gap: 6px; justify-content: center; }
.danger { background: #ff4d4d; }
</style>