import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLogin } from '../api/login'
import { Cpu, Lock, Mail, LogIn } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate('/')
        }
      }
    )
  }

  return (
    <div className="py-16 max-w-md mx-auto">
      <div className="glass-panel p-8 rounded-3xl space-y-6 border border-blue-500/20">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Cpu className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Đăng Nhập TechGear</h1>
          <p className="text-xs text-slate-400">Truy cập tài khoản để mua sắm và quản lý đơn hàng</p>
        </div>

        {loginMutation.isError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-300 text-center">
            {(loginMutation.error as any)?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@techgear.vn"
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-3 rounded-xl font-bold text-white gradient-btn flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 mt-2"
          >
            {loginMutation.isPending ? 'Đang Xử Lý...' : <><LogIn className="w-4 h-4" /> Đăng Nhập</>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-400 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
}
