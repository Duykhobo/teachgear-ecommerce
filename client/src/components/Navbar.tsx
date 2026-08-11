import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Cpu, LogOut, ShieldAlert } from 'lucide-react'
import { useCartStore } from '../features/cart'
import { useAuthStore } from '../features/auth'

export const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const totalItems = useCartStore((state: any) => state.getTotalItems())
  const { user, isAuthenticated, logout } = useAuthStore()

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <span className="gradient-text font-extrabold text-2xl">TechGear</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link to="/" className="hover:text-blue-400 transition-colors">
            Trang Chủ
          </Link>
          <Link to="/products" className="hover:text-blue-400 transition-colors">
            Sản Phẩm
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white hover:border-blue-500/40 transition-all"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-blue-500/50" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold border border-slate-700">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="hidden sm:inline text-sm font-medium text-slate-200">{user.name}</span>
                {user.role === 'Admin' && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white gradient-btn rounded-xl shadow-lg shadow-blue-500/20"
              >
                Đăng Ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
