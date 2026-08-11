import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api-client'
import type { Product } from '../../../types/api'

export interface GetProductsParams {
  page?: number
  limit?: number
  category?: string
}

export const getProducts = async (params?: GetProductsParams): Promise<{ result: Product[]; total: number }> => {
  return apiClient.get('/products', { params })
}

export const useProducts = (params?: GetProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params)
  })
}
