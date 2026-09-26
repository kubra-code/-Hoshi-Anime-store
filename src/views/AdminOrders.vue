<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const orders = ref([])
const loading = ref(true)

async function fetchOrders() {
  loading.value = true
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  orders.value = data || []
  loading.value = false
}

async function updateStatus(id, status) {
  await supabase.from('orders').update({ status }).eq('id', id)
  await fetchOrders()
}

onMounted(fetchOrders)
</script>

<template>
  <h1>الطلبات</h1>
  <p v-if="loading">جاري التحميل...</p>
  <p v-else-if="!orders.length">لسه مفيش طلبات.</p>

  <div v-else class="orders">
    <div class="order-card" v-for="o in orders" :key="o.id">
      <div class="head">
        <strong>{{ o.customer_name }}</strong>
        <span>{{ o.total }} ج.م</span>
      </div>
      <p>📞 {{ o.phone }}</p>
      <p>📍 {{ o.address }}</p>
      <ul>
        <li v-for="item in o.items" :key="item.id">{{ item.name }} × {{ item.qty }}</li>
      </ul>
      <select :value="o.status" @change="updateStatus(o.id, $event.target.value)">
        <option>جديد</option>
        <option>قيد التجهيز</option>
        <option>تم الشحن</option>
        <option>تم التسليم</option>
        <option>ملغي</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.orders { display: flex; flex-direction: column; gap: 14px; }
.order-card { background: var(--surface); padding: 16px; border-radius: 12px; }
.head { display: flex; justify-content: space-between; margin-bottom: 8px; }
.head span { color: var(--accent); font-weight: 700; }
select { margin-top: 10px; padding: 8px; border-radius: 6px; background: var(--bg); color: var(--text); border: 1px solid rgba(255,255,255,0.15); }
</style>