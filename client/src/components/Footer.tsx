import React from 'react'
import { Cpu, Shield, Truck, RefreshCw, CreditCard, Code } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950/60 backdrop-blur-md text-slate-400">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">Giao Hàng Siêu Tốc</h4>
            <p className="text-xs text-slate-400">Nội thành 2H & Toàn quốc</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">Chính Hãng 100%</h4>
            <p className="text-xs text-slate-400">Bảo hành 12-36 tháng</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">Thanh Toán SePay QR</h4>
            <p className="text-xs text-slate-400">Tự động xác nhận 1s</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">Đổi Trả Dễ Dàng</h4>
            <p className="text-xs text-slate-400">1 đổi 1 trong 30 ngày</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-xl font-bold text-slate-100 mb-4">
            <Cpu className="w-6 h-6 text-blue-400" />
            <span className="gradient-text">TechGear</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Hệ thống cung cấp thiết bị công nghệ, phụ kiện Gaming & Laptop cao cấp hàng đầu Việt Nam.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">Danh Mục</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition-colors">Laptop Gaming</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Bàn Phím Cơ</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Chuột E-Sports</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Tai Nghe High-End</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">Hỗ Trợ</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition-colors">Trung Tâm Bảo Hành</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Hướng Dẫn Thanh Toán QR</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Chính Sách Vận Chuyển</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">Kết Nối</h4>
          <p className="text-sm text-slate-400 mb-3">Hotline: 1900 888 999</p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl glass-panel text-sm text-slate-300 hover:text-white transition-all"
          >
            <Code className="w-4 h-4 text-blue-400" /> GitHub Repository
          </a>
        </div>
      </div>

      <div className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        © 2026 TechGear E-Commerce Platform. Designed for Speed & Excellence.
      </div>
    </footer>
  )
}
