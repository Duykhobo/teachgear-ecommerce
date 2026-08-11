import React from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/product-card'
import { useProducts } from '../api/get-products'
import type { Product } from '../../../types/api'
import { Zap, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'

const MOCK_PRODUCTS: Product[] = [
  {
    _id: 'p1',
    name: 'Bàn Phím Cơ Custom TechGear Pro X',
    description: 'Switch Gateron Oil King, Hotswap 85%, Led RGB 16.8 triệu màu cao cấp.',
    price: 2490000,
    stock: 15,
    category: 'Keyboard',
    rating: 4.9,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600']
  },
  {
    _id: 'p2',
    name: 'Chuột E-Sports Wireless Superlight 2',
    description: 'Cảm biến 32K DPI, trọng lượng cực nhẹ 49g, pin dùng liên tục 95 giờ.',
    price: 3190000,
    stock: 8,
    category: 'Mouse',
    rating: 5.0,
    images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600']
  },
  {
    _id: 'p3',
    name: 'Tai Nghe High-End Wireless ANC Studio',
    description: 'Chống ồn chủ động lai, màng loa Beryllium 50mm, âm thanh Hi-Res Audio.',
    price: 5490000,
    stock: 12,
    category: 'Headphone',
    rating: 4.8,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600']
  },
  {
    _id: 'p4',
    name: 'Laptop Gaming TechGear Stealth OLED',
    description: 'Core i9-14900HX, RTX 4080 16GB, Màn hình 240Hz OLED 0.2ms.',
    price: 48990000,
    stock: 5,
    category: 'Laptop',
    rating: 4.9,
    images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600']
  }
]

export const HomePage: React.FC = () => {
  const { data, isLoading } = useProducts({ limit: 8 })
  const productList: Product[] = data?.result && data.result.length > 0 ? data.result : MOCK_PRODUCTS

  return (
    <div className="space-y-16 py-6">
      <section className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-14 border border-blue-500/20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Thế Hệ Gear Công Nghệ Mới 2026
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Nâng Tầm Trải Nghiệm <br />
            <span className="gradient-text">Gaming & Hi-Tech Gear</span>
          </h1>

          <p className="text-slate-300 text-lg md:text-xl leading-relaxed">
            Hệ thống phân phối thiết bị hi-tech chính hãng. Tích hợp thanh toán tự động qua <strong>SePay VietQR</strong> bảo mật tuyệt đối.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/products"
              className="px-6 py-3.5 rounded-xl font-bold text-white gradient-btn shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              Khám Phá Sản Phẩm <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-4 text-xs text-slate-400 border-l border-slate-700 pl-4">
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Chính Hãng 100%</span>
              <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-amber-400" /> Duyệt Đơn 1s</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Sản Phẩm Nổi Bật</h2>
            <p className="text-slate-400 text-sm mt-1">Những thiết bị bán chạy nhất tuần qua</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-blue-400 hover:underline flex items-center gap-1">
            Xem Tất Cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-2xl glass-panel animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productList.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
