import React, { useState } from 'react'
import { ProductCard } from '../components/product-card'
import { useProducts } from '../api/get-products'
import type { Product } from '../../../types/api'
import { Search, Filter } from 'lucide-react'

const MOCK_ALL_PRODUCTS: Product[] = [
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
  },
  {
    _id: 'p5',
    name: 'Màn Hình Gaming 4K QD-OLED 240Hz',
    description: 'Màn hình 32 inch 4K OLED, thời gian phản hồi 0.03ms GTG, HDR1000.',
    price: 28900000,
    stock: 4,
    category: 'Monitor',
    rating: 4.9,
    images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600']
  },
  {
    _id: 'p6',
    name: 'Lót Chuột Gaming Khổ Lớn TechGear Armor',
    description: 'Bề mặt vải Cordura chống nước, đế cao su tự nhiên chống trượt 5mm.',
    price: 450000,
    stock: 30,
    category: 'Accessory',
    rating: 4.7,
    images: ['https://images.unsplash.com/photo-1541140532154-b024d715b909?w=600']
  }
]

export const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const { data, isLoading } = useProducts()

  const productList: Product[] = data?.result && data.result.length > 0 ? data.result : MOCK_ALL_PRODUCTS

  const filteredProducts = productList.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'ALL' || p.category?.toUpperCase() === category.toUpperCase()
    return matchesSearch && matchesCategory
  })

  return (
    <div className="py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Tất Cả Sản Phẩm</h1>
          <p className="text-slate-400 text-sm mt-1">Khám phá các thiết bị Gaming & Phụ kiện cao cấp</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 glass-panel px-3 py-2 rounded-xl text-xs text-slate-300">
            <Filter className="w-4 h-4 text-blue-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-slate-200 cursor-pointer font-semibold"
            >
              <option value="ALL" className="bg-slate-900">Tất Cả</option>
              <option value="Keyboard" className="bg-slate-900">Bàn Phím</option>
              <option value="Mouse" className="bg-slate-900">Chuột Gaming</option>
              <option value="Headphone" className="bg-slate-900">Tai Nghe</option>
              <option value="Laptop" className="bg-slate-900">Laptop</option>
              <option value="Monitor" className="bg-slate-900">Màn Hình</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400">
          Không tìm thấy sản phẩm nào khớp với tìm kiếm của bạn.
        </div>
      )}
    </div>
  )
}
