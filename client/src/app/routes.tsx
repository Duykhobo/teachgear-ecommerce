import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '../components/layouts/main-layout'
import { HomePage, ProductsPage } from '../features/products'
import { CartPage } from '../features/cart'
import { CheckoutPage } from '../features/orders'
import { LoginPage, RegisterPage } from '../features/auth'

export const AppRoutes: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </MainLayout>
  )
}
