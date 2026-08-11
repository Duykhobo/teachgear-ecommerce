import React, { useState } from 'react'
import { useCartStore } from '../../cart/store/cart-store'
import { useCreateOrder } from '../api/create-order'
import { formatPrice } from '../../../lib/utils'
import { ShieldCheck, CreditCard, MapPin } from 'lucide-react'

export const CheckoutPage: React.FC = () => {
  const { items, getTotalPrice } = useCartStore()
  const createOrderMutation = useCreateOrder()

  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'SEPAY' | 'COD'>('SEPAY')
  const [createdOrder, setCreatedOrder] = useState<any>(null)

  const totalPrice = getTotalPrice()

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return

    createOrderMutation.mutate(
      { shipping_address: address, payment_method: paymentMethod },
      {
        onSuccess: (res) => {
          setCreatedOrder(res.result)
        }
      }
    )
  }

  if (createdOrder) {
    return (
      <div className="py-12 max-w-xl mx-auto space-y-6 text-center">
        <div className="glass-panel p-8 rounded-3xl space-y-6 border border-emerald-500/30">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-white">Đơn Hàng Đã Tạo Thành Công!</h1>
          <p className="text-xs text-slate-400">
            Mã đơn hàng: <strong className="text-blue-400">{createdOrder.order_code || createdOrder._id}</strong>
          </p>

          {createdOrder.qr_code_url ? (
            <div className="space-y-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200">Quét Mã VietQR SePay Để Thanh Toán</h3>
              <img
                src={createdOrder.qr_code_url}
                alt="SePay VietQR"
                className="w-56 h-56 mx-auto rounded-xl border border-slate-700 shadow-xl"
              />
              <p className="text-xs text-slate-400">
                Số tiền: <strong className="text-emerald-400">{formatPrice(createdOrder.total_amount)}</strong>
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-300">Đơn hàng của bạn đang được xử lý.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-black text-white">Thanh Toán Đơn Hàng</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleCheckout} className="space-y-6 glass-panel p-6 rounded-2xl">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Địa Chỉ Giao Hàng</label>
            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số 123 Đường ABC, Quận 1, TP.HCM"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Phương Thức Thanh Toán</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('SEPAY')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'SEPAY'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <CreditCard className="w-5 h-5" /> SePay VietQR (Khuyên dùng)
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <ShieldCheck className="w-5 h-5" /> Thanh toán khi nhận hàng
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={createOrderMutation.isPending || items.length === 0}
            className="w-full py-3.5 rounded-xl font-bold text-white gradient-btn shadow-lg shadow-blue-500/25"
          >
            {createOrderMutation.isPending ? 'Đang Xử Lý Đơn Hàng...' : 'Xác Nhận Đặt Hàng'}
          </button>
        </form>

        <div className="glass-panel p-6 rounded-2xl space-y-4 h-fit">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Chi Tiết Đơn Hàng ({items.length} món)</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.product_id} className="flex justify-between text-xs text-slate-300">
                <span className="line-clamp-1">{item.name} x {item.quantity}</span>
                <span className="font-semibold text-slate-100 font-mono">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-3 flex justify-between text-base font-extrabold text-white">
            <span>Tổng cộng</span>
            <span className="text-blue-400">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
