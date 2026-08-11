import React from 'react'
import { Navbar } from '../Navbar'
import { Footer } from '../Footer'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}
