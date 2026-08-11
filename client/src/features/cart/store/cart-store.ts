import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '../../../types/api'

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const currentItems = get().items
        const existingIndex = currentItems.findIndex((item) => item.product_id === product._id)

        if (existingIndex > -1) {
          const updatedItems = [...currentItems]
          updatedItems[existingIndex].quantity += quantity
          set({ items: updatedItems })
        } else {
          const newItem: CartItem = {
            product_id: product._id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.images?.[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'
          }
          set({ items: [...currentItems, newItem] })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.product_id !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          )
        })
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0)
    }),
    {
      name: 'techgear-cart-storage'
    }
  )
)
