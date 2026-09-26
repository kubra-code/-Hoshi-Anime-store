import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart_items') || '[]')
  }),
  getters: {
    totalItems: (state) => state.items.reduce((sum, i) => sum + i.qty, 0),
    totalPrice: (state) => state.items.reduce((sum, i) => sum + i.qty * i.price, 0)
  },
  actions: {
    addItem(product) {
      const existing = this.items.find(i => i.id === product.id)
      if (existing) {
        existing.qty += 1
      } else {
        this.items.push({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, qty: 1 })
      }
      this._persist()
    },
    removeItem(id) {
      this.items = this.items.filter(i => i.id !== id)
      this._persist()
    },
    updateQty(id, qty) {
      const item = this.items.find(i => i.id === id)
      if (item) { item.qty = Math.max(1, qty); this._persist() }
    },
    clear() {
      this.items = []
      this._persist()
    },
    _persist() {
      localStorage.setItem('cart_items', JSON.stringify(this.items))
    }
  }
})