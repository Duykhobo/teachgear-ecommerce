import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api-client'
import type { Order } from '../../../types/api'
import { useCartStore } from '../../cart/store/cart-store'
import { toast } from 'sonner'

export interface CreateOrderPayload {
  shipping_address: string
  payment_method: 'SEPAY' | 'COD'
}

export const createOrder = async (data: CreateOrderPayload): Promise<{ result: Order }> => {
  return apiClient.post('/orders/checkout', data)
}

export const useCreateOrder = () => {
  const clearCart = useCartStore((state) => state.clearCart)

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (response) => {
      clearCart()
      toast.success(`Tạo đơn hàng ${response.result?.order_code || ''} thành công!`)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Tạo đơn hàng thất bại. Vui lòng thử lại.')
    }
  })
}
