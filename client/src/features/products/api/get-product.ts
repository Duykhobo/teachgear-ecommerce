import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api-client'
import type { Product } from '../../../types/api'

export const getProduct = async (id: string): Promise<{ result: Product }> => {
  return apiClient.get(`/products/${id}`)
}

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: !!id
  })
}
