import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cart-store'
import { formatPrice } from '../../../lib/utils'
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react'

export const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore()

  const totalPrice = getTotalPrice()

  if (items.length === 0) {
    return (
      <div className="py-20 text-center space-y-6 max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white">Giỏ Hàng Đang Trống</h2>
        <p className="text-slate-400 text-sm">Hãy chọn các sản phẩm công nghệ tuyệt vời từ cửa hàng của chúng tôi.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white gradient-btn"
        >
          <ArrowLeft className="w-4 h-4" /> Tiếp Tục Mua Sắm
        </Link>
      </div>
    )
  }

  return (
    <div className="py-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-white">Giỏ Hàng Của Bạn</h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" /> Xóa Tất Cả
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="glass-panel p-4 rounded-2xl flex items-center gap-4 justify-between"
            >
              <img
                src={item.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200'}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-xl bg-slate-900 border border-slate-800"
              />

              <div className="flex-1">
                <h3 className="font-bold text-slate-100 line-clamp-1">{item.name}</h3>
                <span className="text-blue-400 font-extrabold text-base">
                  {formatPrice(item.price)}
                </span>
              </div>

              <div className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-xl">
                <button
                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                  className="text-slate-400 hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-sm text-white">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                  className="text-slate-400 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => removeItem(item.product_id)}
                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                title="Xóa"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="glass-panel p-6 rounded-2xl h-fit space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Tóm Tắt Đơn Hàng</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Tạm tính</span>
              <span className="text-slate-200">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Phí vận chuyển</span>
              <span className="text-emerald-400 font-semibold">Miễn phí</span>
            </div>
            <div className="border-t border-slate-800 pt-3 flex justify-between text-lg font-bold text-white">
              <span>Tổng thanh toán</span>
              <span className="text-blue-400">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 rounded-xl font-bold text-white gradient-btn shadow-lg shadow-blue-500/25"
          >
            Tiến Hành Thanh Toán (SePay QR)
          </button>

          <div className="flex items-center gap-2 justify-center text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Thanh toán mã QR SePay bảo mật 100%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
