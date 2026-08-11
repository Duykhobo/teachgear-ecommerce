import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api-client'
import type { AuthResponse } from '../../../types/api'
import { useAuthStore } from '../store/auth-store'
import { toast } from 'sonner'

export interface LoginPayload {
  email: string
  password: string
}

export const loginWithEmailAndPassword = async (data: LoginPayload): Promise<AuthResponse> => {
  return apiClient.post('/users/login', data)
}

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: loginWithEmailAndPassword,
    onSuccess: (response) => {
      if (response.result) {
        setAuth(response.result.user, response.result.access_token, response.result.refresh_token)
        toast.success(`Chào mừng trở lại, ${response.result.user.name}!`)
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.')
    }
  })
}
