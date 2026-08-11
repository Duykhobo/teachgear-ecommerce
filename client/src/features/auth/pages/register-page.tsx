import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegister } from '../api/register'
import { Cpu, Lock, Mail, User as UserIcon, UserPlus } from 'lucide-react'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setValidationError('Mật khẩu xác nhận không khớp.')
      return
    }
    setValidationError('')

    registerMutation.mutate(
      { name, email, password, confirm_password: confirmPassword },
      {
        onSuccess: () => {
          navigate('/')
        }
      }
    )
  }

  return (
    <div className="py-12 max-w-md mx-auto">
      <div className="glass-panel p-8 rounded-3xl space-y-6 border border-purple-500/20">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Cpu className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Tạo Tài Khoản Mới</h1>
          <p className="text-xs text-slate-400">Tham gia cộng đồng TechGear ngay hôm nay</p>
        </div>

        {(validationError || registerMutation.isError) && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-300 text-center">
            {validationError || (registerMutation.error as any)?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Họ và Tên</label>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mật Khẩu</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Xác Nhận Mật Khẩu</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full py-3 rounded-xl font-bold text-white gradient-btn flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 mt-2"
          >
            {registerMutation.isPending ? 'Đang Xử Lý...' : <><UserPlus className="w-4 h-4" /> Đăng Ký Tài Khoản</>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-purple-400 font-semibold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  )
}
