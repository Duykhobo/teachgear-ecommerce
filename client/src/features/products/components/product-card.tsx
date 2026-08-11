import React from 'react'
import type { Product } from '../../../types/api'
import { ShoppingCart, Star, CheckCircle } from 'lucide-react'
import { useCartStore } from '../../cart/store/cart-store'
import { formatPrice } from '../../../lib/utils'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem)
  const [added, setAdded] = React.useState(false)

  const handleAddToCart = () => {
    addItem(product)
    setAdded(true)
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`)
    setTimeout(() => setAdded(false), 1500)
  }

  const defaultImage = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'
  const imageUrl = product.images?.[0] || defaultImage

  return (
    <div className="group glass-panel rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
      <div>
        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900/50 mb-4">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-2 right-2 px-2.5 py-1 text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-blue-400 rounded-full border border-blue-500/20">
            {product.category || 'Gear'}
          </span>
        </div>

        <h3 className="font-bold text-slate-100 text-lg group-hover:text-blue-400 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-slate-400 text-sm mt-1 line-clamp-2 min-h-[40px]">
          {product.description || 'Sản phẩm công nghệ cao cấp chính hãng từ TechGear.'}
        </p>

        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{product.rating || '4.9'}</span>
          </div>
          <span>Còn hàng: <strong className="text-slate-200">{product.stock}</strong></span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block">Giá bán</span>
          <span className="text-xl font-black text-blue-400">
            {formatPrice(product.price)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
            added
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : product.stock > 0
              ? 'gradient-btn text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {added ? (
            <>
              <CheckCircle className="w-4 h-4" /> Đã Thêm
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" /> {product.stock > 0 ? 'Thêm' : 'Hết Hàng'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
