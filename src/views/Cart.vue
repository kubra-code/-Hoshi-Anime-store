<script setup>
import { ref } from 'vue'
import { useCartStore } from '../stores/cart'
import { supabase } from '../supabase'

const cart = useCartStore()
const showForm = ref(false)
const submitting = ref(false)
const orderDone = ref(false)

const form = ref({ customer_name: '', phone: '', address: '' })

async function submitOrder() {
  if (!form.value.customer_name || !form.value.phone || !form.value.address) return
  submitting.value = true

  const { error } = await supabase.from('orders').insert({
    customer_name: form.value.customer_name,
    phone: form.value.phone,
    address: form.value.address,
    items: cart.items,
    total: cart.totalPrice
  })

  submitting.value = false
  if (!error) {
    orderDone.value = true
    cart.clear()
  } else {
    alert('حصل خطأ، جرب تاني: ' + error.message)
  }
}
</script>

<template>
  <h1>سلة المشتريات</h1>

  <div v-if="orderDone" class="success">
    ✅ تم استلام طلبك بنجاح! هنتواصل معاك قريب لتأكيد التوصيل.
  </div>

  <template v-else>
    <p v-if="!cart.items.length">
      السلة فاضية. <RouterLink to="/">ارجع للمتجر</RouterLink>
    </p>

    <div v-else>
      <div class="row" v-for="item in cart.items" :key="item.id">
        <img :src="item.image_url || 'https://placehold.co/80x80'" />
        <div class="info">
          <h3>{{ item.name }}</h3>
          <p>{{ item.price }} ج.م</p>
        </div>
        <input type="number" min="1" :value="item.qty" @change="cart.updateQty(item.id, +$event.target.value)" />
        <button class="remove" @click="cart.removeItem(item.id)">حذف</button>
      </div>

      <div class="total">
        <span>الإجمالي:</span>
        <strong>{{ cart.totalPrice }} ج.م</strong>
      </div>

      <button v-if="!showForm" class="checkout" @click="showForm = true">إتمام الطلب</button>

      <form v-else class="order-form" @submit.prevent="submitOrder">
        <input v-model="form.customer_name" placeholder="الاسم بالكامل" required />
        <input v-model="form.phone" placeholder="رقم الموبايل" required />
        <textarea v-model="form.address" placeholder="العنوان بالتفصيل" required></textarea>
        <button type="submit" :disabled="submitting">
          {{ submitting ? 'جاري الإرسال...' : 'تأكيد الطلب' }}
        </button>
      </form>
    </div>
  </template>
</template>

<style scoped>
.row { display: flex; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
.row img { width: 64px; height: 64px; object-fit: cover; border-radius: 8px; }
.info { flex: 1; }
.info h3 { margin: 0 0 4px; font-size: 0.95rem; }
.info p { margin: 0; color: var(--accent); }
input, textarea { padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: var(--surface); color: var(--text); font-family: inherit; }
.remove { background: none; border: none; color: #ff6b6b; cursor: pointer; font-family: inherit; }
.total { display: flex; justify-content: space-between; font-size: 1.2rem; margin: 24px 0; }
.checkout, .order-form button { width: 100%; padding: 14px; border: none; border-radius: 10px; background: var(--accent); color: white; font-weight: 700; cursor: pointer; font-family: inherit; }
.order-form { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
.success { background: var(--surface); padding: 24px; border-radius: 14px; text-align: center; font-weight: 600; }
</style>