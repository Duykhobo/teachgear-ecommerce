import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api-client'
import type { AuthResponse } from '../../../types/api'
import { useAuthStore } from '../store/auth-store'
import { toast } from 'sonner'

export interface RegisterPayload {
  name: string
  email: string
  password: string
  confirm_password: string
}

export const registerWithEmailAndPassword = async (data: RegisterPayload): Promise<AuthResponse> => {
  return apiClient.post('/users/register', data)
}

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: registerWithEmailAndPassword,
    onSuccess: (response) => {
      if (response.result) {
        setAuth(response.result.user, response.result.access_token, response.result.refresh_token)
        toast.success(`Đăng ký thành công! Chào mừng ${response.result.user.name} đến với TechGear.`)
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.')
    }
  })
}
